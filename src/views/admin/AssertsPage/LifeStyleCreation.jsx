import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Image,
  Skeleton,
  Flex,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Badge,
  Button,
  Textarea,
  Select,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import NoImage from "assets/NoImage.jpg";

/**
 * LifestyleShots component
 * - Fetches /factory_get_all_lifestyle_shots/?user_id=...
 * - Shows sessions in a grid
 * - Click session -> show modal with all generated + edited compositions
 * - Select image -> Edit/View actions
 * - Edit opens prompt+model modal and POSTS to /factory_edit_lifestyle_composition/
 * - Safely handles null compositions (shows placeholder)
 */

const LifestyleShots = ({ userId }) => {
  const toast = useToast();

  const [shots, setShots] = useState([]); // list of sessions
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1 });

  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [bigImage, setBigImage] = useState(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(789);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Fetch sessions (paginated)
  const fetchShots = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/factory_get_all_lifestyle_shots/?user_id=${encodeURIComponent(userId)}&page=${pageNumber}&limit=10`
      );

      if (res?.data?.status === "success") {
        // API uses res.data.data array
        const incoming = Array.isArray(res.data.data) ? res.data.data : [];
        setShots((prev) => (pageNumber === 1 ? incoming : [...prev, ...incoming]));
        setPagination((p) => ({ ...p, total_pages: Number(res.data.total_pages || 1) }));
      } else {
        toast({
          title: res?.data?.message || "Failed to fetch sessions",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error fetching shots",
        description: err?.message || String(err),
        status: "error",
        duration: 3500,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // reset and initial fetch when user changes
  useEffect(() => {
    setShots([]);
    setPage(1);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchShots(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userId]);

  // infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120 &&
      page < (pagination.total_pages || 1) &&
      !loading
    ) {
      setPage((p) => p + 1);
    }
  }, [page, pagination.total_pages, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Build a unified list of images for a session.
  // Null-safe: if a composition is null, push a placeholder object with type "missing".
  const getSessionAllImages = (session) => {
    const images = [];

    // generated_compositions may be null or object with keys.
    const gen = session?.generated_compositions || {};
    if (typeof gen === "object" && Object.keys(gen).length > 0) {
      Object.entries(gen).forEach(([key, comp]) => {
        if (comp && comp.image_url) {
          images.push({
            type: "generated",
            image_url: comp.image_url,
            composition_id: comp.composition_id || "",
            key,
          });
        } else {
          // placeholder for missing generated composition
          images.push({
            type: "missing",
            image_url: NoImage,
            composition_id: null,
            key,
            missingReason: "generated_missing",
          });
        }
      });
    }

    // edited_compositions may be null or object
    const ed = session?.edited_compositions || {};
    if (typeof ed === "object" && Object.keys(ed).length > 0) {
      Object.entries(ed).forEach(([key, comp]) => {
        if (comp && comp.image_url) {
          images.push({
            type: "edited",
            image_url: comp.image_url,
            composition_id: comp.composition_id || "",
            edited_slot: key,
          });
        } else {
          // placeholder for missing edited composition
          images.push({
            type: "missing",
            image_url: NoImage,
            composition_id: null,
            edited_slot: key,
            missingReason: "edited_missing",
          });
        }
      });
    }

    return images;
  };

  // when user clicks "Edit" — open the edit modal
  const openEditModal = () => {
    if (!selectedSession || !selectedImage) {
      toast({ title: "Select an image first", status: "warning", duration: 2000 });
      return;
    }
    setPrompt("");
    setModel(789); // default
    setEditModalOpen(true);
  };

  // Submit edit to API
  const handleSubmitEdit = async () => {
    if (!selectedSession || !selectedImage) {
      toast({ title: "Missing data", status: "error" });
      return;
    }
    if (!prompt.trim()) {
      toast({ title: "Prompt is required", status: "warning" });
      return;
    }

    setSubmittingEdit(true);
    try {
      const body = {
        user_id: userId,
        lifestyle_id: selectedSession.lifestyle_id,
        composition_id: selectedImage.composition_id || selectedImage.edited_slot || "",
        prompt: prompt,
        model: Number(model) || 789,
      };

      const res = await axiosInstance.post("/factory_edit_lifestyle_composition/", body);

      // show API message in toast if available
      const message = res?.data?.message || (res?.data?.status === "success" ? "Edit request submitted" : "Edit failed");
      toast({ title: message, status: res?.data?.status === "success" ? "success" : "error", duration: 3500 });

      // If API returns edited image url in data -> show and integrate it
      const returned = res?.data?.data || res?.data; // support both shapes
      if (returned && returned.edited_image_url) {
        const editedUrl = returned.edited_image_url;
        // Show in big image viewer
        setBigImage(editedUrl);

        // Update local shots state: find the session and add/update edited_compositions
        setShots((prevShots) =>
          prevShots.map((s) => {
            if (s.lifestyle_id !== selectedSession.lifestyle_id) return s;

            // create edited_compositions object if missing
            const edited = { ...(s.edited_compositions || {}) };

            // Determine a slot/key for the edited composition:
            // If API returns edited_composition_id, use that as key; else use composition_id + "_EDIT_SLOT" or create new edited_{n}
            const keyFromApi = returned.edited_composition_id || returned.original_composition_id || null;

            let editKey = null;
            if (keyFromApi) {
              // try to use API's edited_composition_id or original id with suffix
              editKey = keyFromApi.includes("_EDIT") ? keyFromApi : `${keyFromApi}_EDIT`;
            } else {
              // fallback: find first empty edited slot name or increment
              // prefer edited_1, edited_2, edited_3
              for (let i = 1; i <= 6; i++) {
                const candidate = `edited_${i}`;
                if (!edited[candidate] || !edited[candidate].image_url) {
                  editKey = candidate;
                  break;
                }
              }
              if (!editKey) editKey = `edited_${Object.keys(edited).length + 1}`;
            }

            edited[editKey] = {
              composition_id: returned.edited_composition_id || editKey,
              image_url: returned.edited_image_url,
              resized_image: null,
            };

            return {
              ...s,
              edited_compositions: edited,
            };
          })
        );
      }
      // Close edit modal
      setEditModalOpen(false);
    } catch (err) {
      toast({
        title: "Edit failed",
        description: err?.response?.data?.message || err?.message || String(err),
        status: "error",
        duration: 4000,
      });
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Helper: safe display date
  const safeDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        Lifestyle Shots
      </Text>

      {shots.length === 0 && loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : shots.length === 0 ? (
        <Text>No sessions found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {shots.map((shot) => {
            const preview =
              shot?.generated_images?.hybrid ||
              shot?.generated_images?.ai_recommended ||
              shot?.generated_images?.guideline_based ||
              NoImage;

            return (
              <Box
                key={shot.lifestyle_id}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                cursor="pointer"
                _hover={{ shadow: "md" }}
                onClick={() => {
                  setSelectedSession(shot);
                  setSelectedImage(null);
                }}
              >
                <Image
                  src={preview}
                  alt={shot.session_id}
                  fallback={<Skeleton height="200px" />}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
                <Box p={2}>
                  <Text fontWeight="semibold">Session: {shot.session_id}</Text>
                  <HStack mt={1}>
                    <Badge colorScheme={shot.status === "completed" ? "green" : "yellow"}>
                      {shot.status || "unknown"}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      {safeDate(shot.created_at)}
                    </Text>
                  </HStack>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      )}

      {loading && (
        <Flex justify="center" mt={4}>
          <Spinner />
        </Flex>
      )}

      {/* Session Modal */}
      {selectedSession && (
        <Modal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} size="6xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Session: {selectedSession.session_id} — {selectedSession.lifestyle_id}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box p={3} borderWidth="1px" borderRadius="md">
                  <Text><strong>Use Case:</strong> {selectedSession.use_case || "—"}</Text>
                  <Text><strong>Model Used:</strong> {selectedSession.model_used ?? "—"}</Text>
                  <Text><strong>Created:</strong> {safeDate(selectedSession.created_at)}</Text>
                </Box>

                <Text fontWeight="bold">Generated & Edited Compositions</Text>

                <SimpleGrid columns={{ base: 1, md: 3, lg: 4 }} spacing={3}>
                  {getSessionAllImages(selectedSession).map((img, idx) => (
                    <Box
                      key={`${img.key ?? img.edited_slot ?? idx}-${idx}`}
                      borderWidth={selectedImage?.image_url === img.image_url ? "3px" : "1px"}
                      borderColor={selectedImage?.image_url === img.image_url ? "blue.400" : "gray.200"}
                      borderRadius="md"
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img.image_url || NoImage}
                        fallback={<Skeleton height="150px" />}
                        height="150px"
                        width="100%"
                        objectFit="cover"
                        alt={img.composition_id || img.edited_slot || "image"}
                      />
                      <Box p={2}>
                        <HStack justify="space-between">
                          <Badge colorScheme={img.type === "edited" ? "purple" : img.type === "generated" ? "blue" : "gray"}>
                            {img.type === "missing" ? "missing" : img.type}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {img.composition_id ? img.composition_id : img.edited_slot ? img.edited_slot : ""}
                          </Text>
                        </HStack>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>

                {selectedImage && (

                  <Flex gap={3} pt={3}>
                  {selectedImage && (
  <Modal
    isOpen={!!selectedImage}
    onClose={() => setSelectedImage(null)}
    size="4xl"
    motionPreset="none"
  >
    <ModalOverlay bg="rgba(0,0,0,0.85)" />
    <ModalContent bg="gray.900" color="white" p={4} borderRadius="lg">
      <ModalCloseButton color="white" />

      <ModalBody>
        <VStack spacing={5}>

          {/* BIG IMAGE PREVIEW */}
          <Image
            src={selectedImage.image_url}
            maxH="70vh"
            objectFit="contain"
            borderRadius="md"
          />

          {/* ACTION BUTTONS */}
          <HStack spacing={4} pt={4}>
            <Button
              colorScheme="blue"
              onClick={() => handleNavigation("imageToVideo", selectedImage)}
            >
              Create Video
            </Button>

            <Button
              colorScheme="purple"
              onClick={() => handleNavigation("imageCreation", selectedImage)}
            >
              Image Creation
            </Button>

            <Button
              colorScheme="yellow"
              onClick={() => handleNavigation("resize", selectedImage)}
            >
              Resize Image
            </Button>
<Button colorScheme="blue" onClick={openEditModal}>
                      Edit
                    </Button>
            <Button
              colorScheme="green"
              onClick={() => handleDownload(selectedImage.image_url)}
            >
              Download
            </Button>
          </HStack>

        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
)}

                    <Button colorScheme="blue" onClick={openEditModal}>
                      Edit
                    </Button>
                    <Button colorScheme="green" onClick={() => setBigImage(selectedImage.image_url)}>
                      View
                    </Button>
                  </Flex>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Big image viewer modal */}
      {bigImage && (
        <Modal isOpen={!!bigImage} onClose={() => setBigImage(null)} size="full" motionPreset="none">
          <ModalOverlay bg="rgba(0,0,0,0.9)" />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton color="white" />
            <ModalBody p={0} display="flex" justifyContent="center" alignItems="center">
              <Image src={bigImage} maxH="90vh" maxW="90vw" objectFit="contain" alt="edited" />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Edit modal (prompt + model) */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Composition</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="600">Prompt</Text>
              <Textarea
                placeholder="Describe the edit (e.g. 'Make the background sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />

              <Text fontWeight="600">Model</Text>
              <Select value={model} onChange={(e) => setModel(Number(e.target.value))}>
                <option value={123}>123 — Nano Banana</option>
                <option value={789}>789 — Pro (recommended)</option>
              </Select>

              <HStack spacing={3}>
                <Button isLoading={submittingEdit} colorScheme="blue" onClick={handleSubmitEdit}>
                  Save
                </Button>
                <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default LifestyleShots;
