// src/components/MergeVideos.jsx
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
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import NoImage from "assets/NoImage.jpg";

/**
 * MergeVideos
 * - Props: userId (string) — required
 * - Uses: /factory_get_user_merge_videos/?user_id=...
 *
 * Notes:
 * - Card video uses `final_video_with_music_url` (falls back to final_video_url)
 * - Clicking a card opens a modal with a playable video and full details
 * - Clicking the "Open Fullscreen" button shows the video in a full-screen modal
 */

const MergeVideos = ({ userId }) => {
  const toast = useToast();

  // data + pagination
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, count: 0 });
  const [loading, setLoading] = useState(false);

  // modal / selection
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // fullscreen video modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalSrc, setVideoModalSrc] = useState(null);

  // colors
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const titleColor = useColorModeValue("gray.900", "white");
  const textColor = useColorModeValue("gray.700", "gray.300");

  // ---------------------------------------------------------------------------
  // fetch merge jobs
  // ---------------------------------------------------------------------------
  const fetchJobs = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/factory_get_user_merge_videos/?user_id=${encodeURIComponent(
          userId
        )}&page=${pageNumber}&limit=10`
      );

      // adapt to returned structure
      if (res.data?.status === "success" && Array.isArray(res.data.merge_jobs)) {
        const returned = res.data.merge_jobs;
        const count = res.data.count ?? returned.length;
        // naive pagination total pages if not provided
        const totalPages = Math.max(1, Math.ceil((res.data.count || returned.length) / 10));

        setPagination((prev) => ({ ...prev, total_pages: totalPages, count }));
        if (pageNumber === 1) {
          setJobs(returned);
        } else {
          setJobs((prev) => [...prev, ...returned]);
        }
      } else {
        // If API returns success=false or missing merge_jobs
        if (pageNumber === 1) setJobs([]);
        toast({
          title: res.data?.message || "No merge jobs found.",
          status: "info",
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Failed to fetch merge videos",
        description: err?.message || "Please try again later",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // reset when userId changes
  useEffect(() => {
    setJobs([]);
    setPage(1);
    setPagination({ total_pages: 1, count: 0 });
  }, [userId]);

  // fetch when page or user changes
  useEffect(() => {
    if (!userId) return;
    fetchJobs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, userId]);

  // infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 120 &&
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

  // ---------------------------------------------------------------------------
  // helper: choose video url for card / modal
  // prefer final_video_with_music_url > final_video_url > input_videos[0].url > outro
  const pickBestVideoUrl = (job) => {
    if (!job) return null;
    return (
      job.final_video_with_music_url ||
      job.final_video_url ||
      (Array.isArray(job.input_videos) && job.input_videos[0]?.url) ||
      job.outro_video_url ||
      null
    );
  };

  // open details modal
  const openModalForJob = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  // open fullscreen video modal
  const openVideoModal = (src) => {
    setVideoModalSrc(src);
    setVideoModalOpen(true);
  };

  // simple-safe render for date/time
  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  // ---------------------------------------------------------------------------
  // UI rendering
  // ---------------------------------------------------------------------------
  return (
    <Box p={5}>
      <Text fontSize="2xl" fontWeight="bold" mb={5}>
        Merge Videos
      </Text>

      {/* Loading + empty states */}
      {jobs.length === 0 && loading ? (
        <Flex justify="center" align="center" height="220px">
          <Spinner size="xl" />
        </Flex>
      ) : jobs.length === 0 ? (
        <Text>No merge jobs found.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
          {jobs.map((job) => {
            const cardVideo = pickBestVideoUrl(job);
            const createdAt = job.created_at;
            const status = job.status || "unknown";

            return (
              <Box
                key={job.job_id}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                cursor={cardVideo ? "pointer" : "default"}
                onClick={() => cardVideo && openModalForJob(job)}
                _hover={cardVideo ? { shadow: "md" } : undefined}
              >
                {cardVideo ? (
                  <Box position="relative" height="200px" bg="gray.100">
                    {/* use video tag inside card (muted auto-play loop for preview) */}
                    <video
                      src={cardVideo}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      muted
                      playsInline
                      // autoplay only when allowed: omit autoPlay to avoid browsers blocking; you can enable if desired
                    />
                  </Box>
                ) : (
                  <Image
                    src={NoImage}
                    alt="no video"
                    fallback={<Skeleton height="200px" />}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                  />
                )}

                <Box p={3}>
                  <Text fontWeight="semibold" noOfLines={1}>
                    Job ID: {job.job_id}
                  </Text>

                  <HStack mt={2} spacing={3}>
                    <Badge
                      colorScheme={
                        status === "completed_with_music"
                          ? "green"
                          : status === "failed"
                          ? "red"
                          : "yellow"
                      }
                    >
                      {status}
                    </Badge>

                    <Text fontSize="sm" color="gray.500">
                      {formatDate(createdAt)}
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

      {/* DETAILS MODAL */}
      {selectedJob && (
        <Modal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedJob(null);
          }}
          size="6xl"
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Merge Job: {selectedJob.job_id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Video preview area */}
                <Box borderWidth="1px" borderRadius="md" overflow="hidden" bg="black">
                  <video
                    src={pickBestVideoUrl(selectedJob)}
                    controls
                    style={{ width: "100%", maxHeight: "540px", objectFit: "contain" }}
                  />
                </Box>

                <HStack spacing={3} justify="flex-end">
                  <Button
                    size="sm"
                    onClick={() => openVideoModal(pickBestVideoUrl(selectedJob))}
                  >
                    Open Fullscreen
                  </Button>
                </HStack>

                {/* Job details */}
                <Box
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg={bgColor}
                  borderColor={borderColor}
                >
                  <Text fontSize="lg" fontWeight="bold" mb={3} color={titleColor}>
                    Job Details
                  </Text>

                  <VStack align="start" spacing={2} color={textColor}>
                    <Text><strong>Job ID:</strong> {selectedJob.job_id}</Text>
                    <Text><strong>Status:</strong> {selectedJob.status || "—"}</Text>
                    <Text><strong>User ID:</strong> {selectedJob.user_id || "—"}</Text>
                    <Text><strong>Created At:</strong> {formatDate(selectedJob.created_at)}</Text>
                    <Text><strong>Final Video (no music):</strong> {selectedJob.final_video_url || "—"}</Text>
                    <Text><strong>Final With Music:</strong> {selectedJob.final_video_with_music_url || "—"}</Text>
                    <Text><strong>Final Duration (s):</strong> {selectedJob.final_video_duration ?? "—"}</Text>
                    <Text><strong>Total Input Duration (s):</strong> {selectedJob.total_input_duration ?? "—"}</Text>
                    <Text><strong>Outro Source:</strong> {selectedJob.outro_source ?? "—"}</Text>
                    <Text><strong>Outro URL:</strong> {selectedJob.outro_video_url ?? "—"}</Text>
                    <Text><strong>Error Message:</strong> {selectedJob.error_message ?? "—"}</Text>
                    <Text><strong>S3 keys:</strong></Text>
                    <VStack align="start" spacing={1} pl={3}>
                      <Text fontSize="sm">final_video_s3_key: {selectedJob.final_video_s3_key ?? "—"}</Text>
                      <Text fontSize="sm">final_video_with_music_s3_key: {selectedJob.final_video_with_music_s3_key ?? "—"}</Text>
                    </VStack>
                  </VStack>
                </Box>

                {/* Input videos list */}
                {Array.isArray(selectedJob.input_videos) && selectedJob.input_videos.length > 0 && (
                  <Box p={4} borderWidth="1px" borderRadius="lg">
                    <Text fontWeight="bold" mb={2}>Input Videos</Text>
                    <VStack align="start" spacing={2}>
                      {selectedJob.input_videos.map((iv, idx) => (
                        <Box key={idx} width="100%">
                          <Text fontSize="sm"><strong>{iv.type || `Video ${idx+1}`}</strong></Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={2}>{iv.url}</Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                )}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* FULLSCREEN VIDEO MODAL */}
      <Modal
        isOpen={videoModalOpen}
        onClose={() => {
          setVideoModalOpen(false);
          setVideoModalSrc(null);
        }}
        size="full"
      >
        <ModalOverlay />
        <ModalContent bg="blackAlpha.900" display="flex" alignItems="center" justifyContent="center">
          <ModalCloseButton color="white" />
          <ModalBody display="flex" alignItems="center" justifyContent="center" p={0}>
            {videoModalSrc ? (
              <video
                src={videoModalSrc}
                controls
                autoPlay
                style={{ width: "100%", maxHeight: "100vh", objectFit: "contain" }}
              />
            ) : (
              <Text color="white">No video</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MergeVideos;
