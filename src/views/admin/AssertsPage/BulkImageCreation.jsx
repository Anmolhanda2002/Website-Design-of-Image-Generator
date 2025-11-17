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
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import NoImage from "assets/NoImage.jpg";

const BulkSessions = ({ userId }) => {
  const toast = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1 });

  // Fetch sessions
  const fetchSessions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/get_all_bulk_sessions_by_user/?user_id=${userId}&page=${pageNumber}&limit=10`
      );

      if (res.data.status === "success") {
        const pag = res.data.pagination || { total_pages: 1 };
        setPagination(pag);

        if (Array.isArray(res.data.data) && res.data.data.length > 0) {
          setSessions((prev) => [...prev, ...res.data.data]);
        } else if (pageNumber === 1) {
          setSessions([]);
          toast({
            title: res.data.message || "No bulk sessions found for this user",
            status: "info",
            duration: 2000,
          });
        }
      } else {
        toast({
          title: "Failed to fetch sessions",
          status: "error",
          duration: 2000,
        });
      }
    } catch (err) {
      toast({
        title: "Error fetching sessions",
        description: err.message,
        status: "error",
        duration: 2000,
      });
    }
    setLoading(false);
  };

  // Reset when user changes
  useEffect(() => {
    setSessions([]);
    setPage(1);
  }, [userId]);

  // Fetch sessions when page changes
  useEffect(() => {
    fetchSessions(page);
  }, [page, userId]);

  // Infinite scroll on window
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50 &&
      page < (pagination.total_pages || 1) &&
      !loading
    ) {
      setPage((prev) => prev + 1);
    }
  }, [page, pagination.total_pages, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCardClick = (session) => {
    setSelectedSession(session);
    setModalOpen(true);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        Bulk Sessions
      </Text>

      {sessions.length === 0 && loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : sessions.length === 0 ? (
        <Text>No sessions found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {sessions.map((session) => {
            const firstShot = session.shots && session.shots[0];
            const isFailed = firstShot?.status?.toLowerCase() === "failed";

            return (
              <Box
                key={session.session_id}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                cursor={firstShot ? "pointer" : "default"}
                onClick={() => firstShot && handleCardClick(session)}
                _hover={firstShot ? { shadow: "md" } : {}}
              >
                {firstShot ? (
                  <Image
                    src={firstShot.image_url && !isFailed ? firstShot.image_url : NoImage}
                    alt={firstShot.display_name || "No Image"}
                    fallback={<Skeleton height="200px" />}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                  />
                ) : (
                  <Flex
                    height="200px"
                    align="center"
                    justify="center"
                    bg="gray.100"
                  >
                    <Text>No Image</Text>
                  </Flex>
                )}
                <Box p={2}>
                  <Text fontWeight="semibold">
                    Session ID: {session.session_id}
                  </Text>
                  <HStack mt={1} spacing={2}>
                    <Badge
                      colorScheme={
                        session.session_summary?.status === "completed"
                          ? "green"
                          : session.session_summary?.status === "failed"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {session.session_summary?.status || "unknown"}
                    </Badge>
                    <Text fontSize="sm">
                      {session.session_summary?.success_rate || 0} Success
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

      {/* Session details modal */}
      {selectedSession && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Session Details: {selectedSession.session_id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {selectedSession.shots && selectedSession.shots.length > 0 ? (
                  selectedSession.shots.map((shot) => {
                    const shotFailed = shot.status?.toLowerCase() === "failed";
                    return (
                      <Box
                        key={shot.composition_id}
                        borderWidth="1px"
                        borderRadius="md"
                        overflow="hidden"
                        cursor="pointer"
                        onClick={() => handleImageClick(shot.image_url && !shotFailed ? shot.image_url : NoImage)}
                      >
                        <Image
                          src={shot.image_url && !shotFailed ? shot.image_url : NoImage}
                          alt={shot.display_name || "No Image"}
                          fallback={<Skeleton height="250px" />}
                          height="250px"
                          width="100%"
                          objectFit="contain"
                        />
                        <Box p={2}>
                          <Text fontWeight="semibold">{shot.display_name || "No Name"}</Text>
                          <HStack spacing={2} mt={1}>
                            <Badge
                              colorScheme={shotFailed ? "red" : shot.status === "completed" ? "green" : "yellow"}
                            >
                              {shot.status || "unknown"}
                            </Badge>
                            {shot.error && (
                              <Text fontSize="sm" color="red.500">
                                Error: {shot.error}
                              </Text>
                            )}
                          </HStack>
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Text>No images available in this session.</Text>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Full-size image modal */}
      {selectedImage && (
        <Modal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          size="full"
        >
          <ModalOverlay />
          <ModalContent
            bg="blackAlpha.900"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <ModalCloseButton color="white" />
            <Image
              src={selectedImage}
              maxH="90vh"
              maxW="90vw"
              objectFit="contain"
            />
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default BulkSessions;
