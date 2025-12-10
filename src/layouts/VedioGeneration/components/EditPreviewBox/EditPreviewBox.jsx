import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  Checkbox,
  Button,
  Select,
  InputGroup,
  Input,
  InputRightElement,
  Icon,
  useToast,
  Spinner,
  useColorModeValue,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPlayCircle } from "react-icons/fa";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";

const POLL_INTERVAL = 10000;

const VideoSelectorPage = ({ setActiveTab, setlastimagetovideo, setImages, setclone, setclonecreationid, selectedUser }) => {
  const toast = useToast();

  // Chakra color values computed once
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const selectBg = useColorModeValue("gray.100", "navy.800");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const panelBg = useColorModeValue("gray.50", "gray.700");

  // State
  const [videos, setVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transitionEffect, setTransitionEffect] = useState("sequential");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [previewVideoData, setPreviewVideoData] = useState(null);
const [showFinalPreview, setShowFinalPreview] = useState(false);
  // Transition effects (memoized constant)
  const transitionEffects = React.useMemo(
    () => [
      "none", "fade", "dissolve", "slide", "slideright", "slideleft", "slideup",
      "slidedown", "zoomin", "zoomout", "wiperight", "wipeleft", "wipeup",
      "wipedown", "fadeblack", "fadewhite", "radial", "circlecrop", "rectcrop",
      "smoothleft", "smoothright", "distance", "dis_rot", "sequence", "sequential"
    ],
    []
  );

  // Helper: determine status pill style safely
  const getStatusColor = (status) => {
    if (!status) return { bg: useColorModeValue("gray.200", "gray.600"), color: useColorModeValue("gray.800", "white") };
    const s = String(status).toLowerCase();
    if (s.includes("completed") || s.includes("ready") || s.includes("success")) {
      return { bg: "green.100", color: "green.800" };
    }
    if (s.includes("processing") || s.includes("in_progress") || s.includes("processing")) {
      return { bg: "yellow.100", color: "yellow.800" };
    }
    if (s.includes("failed") || s.includes("error")) {
      return { bg: "red.100", color: "red.800" };
    }
    // default
    return { bg: useColorModeValue("gray.200", "gray.600"), color: useColorModeValue("gray.800", "white") };
  };

  // Fetch videos with pagination
  const fetchVideos = useCallback(
    async (pageNum = 1, search = "") => {
      if (!selectedUser?.user_id) return;

      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/videos_page/?user_id=${selectedUser.user_id}&page=${pageNum}&search=${encodeURIComponent(search)}`
        );

        if (res.data?.status === "success") {
          const newVideos = res.data.data || [];
          const pages = res.data.pagination?.pages || 1;

          setVideos((prev) => (pageNum === 1 ? newVideos : [...prev, ...newVideos]));
          setTotalPages(pages);
        } else {
          toast({ title: "No videos found", status: "info" });
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        toast({ title: "Error fetching videos", status: "error" });
      } finally {
        setLoading(false);
      }
    },
    [selectedUser, toast]
  );

  // Refetch when user or search changes
  useEffect(() => {
    if (selectedUser?.user_id) {
      setVideos([]);
      setPage(1);
      fetchVideos(1, searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, searchTerm]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1 && selectedUser?.user_id) {
      fetchVideos(page, searchTerm);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, fetchVideos, searchTerm, selectedUser]);

  // Toggle selection (max 4)
  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast({ title: "Max 4 videos allowed", status: "warning" });
        return prev;
      }
      return [...prev, id];
    });
  };

  // Create combined video
  const handleCreateVideo = async () => {
    if (selected.length < 2) {
      toast({ title: "Select at least 2 videos", status: "warning" });
      return;
    }

    try {
      setCreating(true);
      setShowFinalPreview(true);
      const payload = {
        key: "HYG-EAE6D1FA3895EB67-8C69",
        creation_ids: selected,
        transition_effect: transitionEffect,
        user_id: selectedUser?.user_id,
      };

      const res = await axiosInstance.post(`/factory_development_combined_video/`, payload);
      const data = res.data?.data;

      if (res.data?.success && data) {
        toast({ title: res.data.message || "Video creation started", status: "success" });
        setProcessing(true);
        setGeneratedVideo({ status: "processing", ...data });
        if (data?.status_check_url) pollStatus(data.status_check_url);
      } else {
        toast({ title: "Video creation failed", status: "error" });
      }
    } catch (err) {
      console.error("Create error:", err);
      toast({ title: "Error creating video", status: "error" });
    } finally {
      setCreating(false);
    }
  };

  // Polling for status
  const pollStatus = (url) => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const videoData = res.data?.data;
        if (videoData?.status === "completed" && videoData?.final_video_url) {
          clearInterval(interval);
          toast({ title: "Video ready!", status: "success" });
          setGeneratedVideo(videoData);
          setProcessing(false);
        } else if (videoData?.status === "failed") {
          clearInterval(interval);
          toast({ title: "Video Failed", status: "error" });
          setProcessing(false);
        } else {
          // still processing — optionally update generatedVideo state
          setGeneratedVideo((prev) => ({ ...(prev || {}), ...videoData }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL);
  };

  // Manual QC
  const handleQC = async (action) => {
    const creationId = generatedVideo?.creation_id || previewVideoData?.creation_id;

    if (!creationId) {
      toast({ title: "No creation ID found", status: "error" });
      return;
    }

    try {
      const payload = {
        creation_id: creationId,
        manual_qc: action,
        user_id: selectedUser?.user_id,
      };

      await axiosInstance.post(`/manual_qc_video/`, payload);

      // COMMON RESET FUNCTION
      const resetState = () => {
        setGeneratedVideo(null);
        setProcessing(false);
        setSelected([]);
        setIsPreviewOpen(false);
      };

      if (action === "accept") {
        toast({
          title: "Video accepted successfully ✅",
          status: "success",
          duration: 3000,
          position: "top-right",
        });

        resetState();
      } else if (action === "recreate") {
        toast({
          title: "Sent for recreation 🔄 — Please select new clips",
          status: "info",
          duration: 3000,
          position: "top-right",
        });

        const sourceVideoData = generatedVideo || previewVideoData;
        const imageUrls = sourceVideoData?.image_urls || [];

        if (imageUrls.length > 0) {
          const formattedImages = imageUrls.map((url, index) => ({
            id: `${Date.now()}-${index}`,
            url,
          }));
          setImages(formattedImages);
        } else {
          console.warn("No image URLs available for recreate flow");
        }

        setlastimagetovideo(true);
        setActiveTab("Image to Video");

        resetState();
        fetchVideos(1, searchTerm);
      }
    } catch (err) {
      console.error("QC error:", err);
      toast({
        title: "Error submitting QC 🚫",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Video Preview Handler
  const openPreview = useCallback((e, video) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    const videoUrl =
      video?.cloudinary_video_url ||
      video?.processed_video_url ||
      video?.manual_video_url;
    setPreviewVideo(videoUrl);
    setPreviewVideoData(video || null); // store full video object
    setIsPreviewOpen(true);
  }, []);

  // UI
  return (
    <Box p={6} mt={20} minH="100vh" bg="transparent">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Heading fontSize="2xl" color={textColor}>
          🎬 Combine Your Videos
        </Heading>
        <Flex gap={3} align="center">
          <Select
            value={transitionEffect}
            onChange={(e) => setTransitionEffect(e.target.value)}
            maxW="220px"
            size="sm"
            borderRadius="full"
            bg={selectBg}
            sx={{
              option: {
                fontSize: "sm",
                padding: "4px 8px",
              },
            }}
          >
            {transitionEffects.map((effect) => (
              <option key={effect} value={effect}>
                {effect}
              </option>
            ))}
          </Select>

          <Button
            colorScheme="blue"
            borderRadius="full"
            px={6}
            py={2}
            fontSize="sm"
            isLoading={creating}
            onClick={handleCreateVideo}
          >
            Create Video
          </Button>
        </Flex>
      </Flex>

      {/* Search */}
      <InputGroup mb={6} maxW="350px">
        <Input
          placeholder="Search by project or creation ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg={inputBg}
          borderRadius="full"
        />
        <InputRightElement>
          <SearchIcon color="gray.400" />
        </InputRightElement>
      </InputGroup>

      {/* Video Grid or Processing/Preview */}
      {!processing && !generatedVideo ? (
        <>
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={5}
          >
            {videos.map((video) => {
              const videoUrl =
                video?.cloudinary_video_url ||
                video?.processed_video_url ||
                video?.manual_video_url;
              const thumbnail =
                video?.image_urls?.[0] ||
                "https://via.placeholder.com/300x200?text=No+Thumbnail";
              const isSelected = selected.includes(video?.creation_id);

              const statusStyle = getStatusColor(video?.status);

              return (
                <GridItem
                  key={video?.creation_id || Math.random()}
                  position="relative"
                  bg={cardBg}
                  borderRadius="xl"
                  overflow="hidden"
                  p={3}
                  shadow="md"
                  border="2px solid"
                  borderColor={isSelected ? "blue.400" : borderColor}
                  cursor="pointer"
                  onClick={() => toggleSelect(video?.creation_id)}
                  transition="0.2s"
                  _hover={{ transform: "scale(1.02)" }}
                >
                  <Checkbox
                    position="absolute"
                    top={3}
                    left={3}
                    colorScheme="blue"
                    isChecked={isSelected}
                    pointerEvents="none"
                    size="lg"
                  />

                  <Box position="relative" mb={2}>
                    <Image
                      src={thumbnail}
                      alt={video?.product_name || "Video"}
                      borderRadius="md"
                      objectFit="cover"
                      height="180px"
                      width="100%"
                    />
                    <Icon
                      as={FaPlayCircle}
                      boxSize={10}
                      color="white"
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      cursor="pointer"
                      onClick={(e) => openPreview(e, video)}
                    />
                  </Box>

                  <Text fontWeight="bold" noOfLines={1} color={textColor}>
                    {video?.product_name || "Untitled Video"}
                  </Text>
                  <Text fontSize="sm" color="gray.400" mb={1}>
                    ID: {video?.creation_id || "—"}
                  </Text>

                  {/* Safe status pill (replaces Badge which can sometimes read undefined props) */}
                  <Box
                    display="inline-block"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={statusStyle.bg}
                    color={statusStyle.color}
                    fontSize="sm"
                    fontWeight="semibold"
                  >
                    {video?.status || "unknown"}
                  </Box>
                </GridItem>
              );
            })}

            {loading &&
              Array(4)
                .fill("")
                .map((_, i) => (
                  <GridItem key={`loading-${i}`} borderRadius="md" bg={cardBg} p={3} shadow="md">
                    <Flex align="center" justify="center" minH="140px">
                      <Spinner size="lg" />
                    </Flex>
                  </GridItem>
                ))}
          </Grid>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Flex justify="center" align="center" mt={8} gap={2} wrap="wrap">
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(page - 2, 0), Math.min(page + 1, totalPages))
                .map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    colorScheme={p === page ? "blue" : "gray"}
                    variant={p === page ? "solid" : "outline"}
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {p}
                  </Button>
                ))}

              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      ) : (
        <Flex mt={10} gap={5} wrap="wrap">
          {/* Left: Preview */}
          <Box flex="1" minW="350px" textAlign="center">
           <Flex align="center" justify="space-between" mb={3}>
  <Button
    leftIcon={<ChevronLeftIcon />}
    variant="ghost"
    colorScheme="gray"
    onClick={() => {
      setShowFinalPreview(false);
      setCreating(false);
      setGeneratedVideo(null);
      setProcessing(false);
    }}
  >
    Back
  </Button>

  <Heading size="md">
    {processing ? "Processing your video..." : "Combined Video Preview"}
  </Heading>

  {/* Empty box to balance spacing with Back button */}
  <Box w="80px"></Box>
</Flex>

            {processing ? (
              <Flex align="center" justify="center" h="400px" bg={panelBg} borderRadius="lg">
                <Spinner size="xl" />
                <Text ml={3}>Processing... This may take a few moments</Text>
              </Flex>
            ) : (
              <>
                <Box
                  bg={useColorModeValue("gray.900", "black")}
                  borderRadius="lg"
                  p={3}
                >

                  <video
                    src={generatedVideo?.final_video_url}
                    controls
                    style={{
                      width: "100%",
                      maxWidth: "900px",
                      height: "450px",
                      borderRadius: 12,
                      background: "black",
                    }}
                  />
                </Box>

                {/* <Flex mt={4} justify="center" gap={3}>
                  <Button colorScheme="green" onClick={() => handleQC("accept")}>
                    Accept
                  </Button>
                  <Button colorScheme="orange" onClick={() => handleQC("recreate")}>
                    Recreate
                  </Button>
                </Flex> */}
              </>
            )}
          </Box>

          {/* Right: Selected Videos */}
          <Box
            flex="1"
            minW="250px"
            maxH="450px"
            mt={10}
            overflowY="auto"
            p={3}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="lg"
            bg={useColorModeValue("white", "gray.800")}
          >
            <Heading size="sm" mb={3}>
              Selected Input Videos
            </Heading>
            {selected.length === 0 && <Text color="gray.500">No clips selected</Text>}
            {selected.map((id) => {
              const v = videos.find((vid) => vid.creation_id === id);
              if (!v) return null;
              return (
                <Flex key={id} mb={3} align="center" gap={3}>
                  <Image
                    src={
                      v?.image_urls?.[0] ||
                      "https://via.placeholder.com/200x120?text=No+Thumbnail"
                    }
                    alt={v?.product_name}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box>
                    <Text fontWeight="bold" noOfLines={1}>
                      {v?.product_name || "Untitled"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {id}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Box>
        </Flex>
      )}

      {/* Video Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        size="4xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Video Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {previewVideo ? (
              <Box>
                <video
                  src={previewVideo}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "50vh", borderRadius: "10px", background: "black" }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                <Flex justify="center" mt={5} gap={5}>
                  <Button colorScheme="green" onClick={() => handleQC("accept")}>
                    Accept
                  </Button>
                  <Button colorScheme="red" onClick={() => handleQC("recreate")}>
                    Recreate
                  </Button>
                </Flex>
              </Box>
            ) : (
              <Text>No video available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default VideoSelectorPage;
