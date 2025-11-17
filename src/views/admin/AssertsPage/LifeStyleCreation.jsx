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

const LifestyleShots = ({ userId }) => {
  const toast = useToast();
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1 });
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch shots
  const fetchShots = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/factory_get_all_lifestyle_shots/?user_id=${userId}&page=${pageNumber}&limit=10`
      );

      if (res.data.status === "success") {
        setShots((prev) => [...prev, ...res.data.data]);
        setPagination({ total_pages: res.data.total_pages });
      } else {
        toast({
          title: "Failed to fetch shots",
          status: "error",
          duration: 2000,
        });
      }
    } catch (err) {
      toast({
        title: "Error fetching shots",
        description: err.message,
        status: "error",
        duration: 2000,
      });
    }
    setLoading(false);
  };

  // Reset when user changes
  useEffect(() => {
    setShots([]);
    setPage(1);
  }, [userId]);

  // Fetch on page change
  useEffect(() => {
    fetchShots(page);
  }, [page, userId]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50 &&
      page < pagination.total_pages &&
      !loading
    ) {
      setPage((prev) => prev + 1);
    }
  }, [page, pagination.total_pages, loading]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Open modal for a session
  const handleCardClick = (session) => {
    setSelectedSession(session);
  };

  // Get all images of a session
  const getSessionImages = (session) => {
    if (!session?.generated_images) return [NoImage];
    return [
      session.generated_images.guideline_based || NoImage,
      session.generated_images.ai_recommended || NoImage,
      session.generated_images.hybrid || NoImage,
    ];
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
        <Text>No shots found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {shots.map((shot) => {
            const imageUrl = shot.generated_images
              ? shot.generated_images.hybrid ||
                shot.generated_images.ai_recommended ||
                shot.generated_images.guideline_based
              : null;
            const isFailed = shot.status?.toLowerCase() === "failed";

            return (
              <Box
                key={shot.lifestyle_id}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleCardClick(shot)}
                _hover={{ shadow: "md" }}
              >
                <Image
                  src={imageUrl && !isFailed ? imageUrl : NoImage}
                  alt={shot.lifestyle_id}
                  fallback={<Skeleton height="200px" />}
                  height="200px"
                  width="100%"
                  objectFit="cover"
                />
                <Box p={2}>
                  <Text fontWeight="semibold">Session ID: {shot.session_id}</Text>
                  <HStack mt={1} spacing={2}>
                    <Badge colorScheme={isFailed ? "red" : shot.status === "completed" ? "green" : "yellow"}>
                      {shot.status}
                    </Badge>
                  </HStack>
                  {shot.error_message && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      {shot.error_message}
                    </Text>
                  )}
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

      {/* Session modal */}
      {selectedSession && (
        <Modal
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Session: {selectedSession.session_id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Session details */}
                <Box p={2} borderWidth="1px" borderRadius="md">
                  <Text>Status: {selectedSession.status}</Text>
                  <Text>Use Case: {selectedSession.use_case}</Text>
                  <Text>Model Used: {selectedSession.model_used}</Text>
                  <Text>Created At: {new Date(selectedSession.created_at).toLocaleString()}</Text>
                </Box>

                {/* All images */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  {getSessionImages(selectedSession).map((img, idx) => (
                    <Box key={idx} borderWidth="1px" borderRadius="md" overflow="hidden">
                      <Image
                        src={img}
                        alt={`Session Image ${idx + 1}`}
                        fallback={<Skeleton height="200px" />}
                        height="200px"
                        width="100%"
                        objectFit="cover"
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default LifestyleShots;
