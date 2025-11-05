import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
  VStack,
  Image,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdPlayCircle, MdCheckCircle } from "react-icons/md";

export default function CaptionedEdit({ selectedUser, MergeData, setMergeData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [mergedVideo, setMergedVideo] = useState(null);
  const [polling, setPolling] = useState(false);

  const toast = useToast();
  const intervalRef = useRef(null);

  // --- Styling ---
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue(
    "0 0 10px rgba(66,153,225,0.7)",
    "0 0 10px rgba(66,153,225,0.9)"
  );

  // --- Stop polling on unmount ---
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Fetch captioned videos ---
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectedUser.user_id },
        });

        const success = res.data?.success ?? false;
        const videos = Array.isArray(res.data?.data) ? res.data.data : [];

        if (success && videos.length > 0) {
          setVideos(videos);
        } else {
          setVideos([]);
          toast({
            title: "No captioned videos found",
            description: res.data?.message || "Try again later.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: "Failed to load videos",
          description:
            err.response?.data?.message ||
            err.message ||
            "Unexpected error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedUser, toast]);

  // --- Select a video ---
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setMergeStatus(null);

    setMergeData((prev) => ({
      ...prev,
      user_id: selectedUser?.user_id,
      edit_id: video.edit_id,
      hygaar_key: video.hygaar_key,
    }));
  };

  // --- Submit merge request ---
  const handleMergeSubmit = async () => {
    const userId = selectedUser?.user_id;
    if (!selectedVideo || !userId) {
      toast({
        title: "Selection required",
        description: "Select a video and ensure valid User ID.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const hygaarKey =
      selectedVideo.hygaar_key || localStorage.getItem("api_key") || null;

    if (!hygaarKey) {
      toast({
        title: "Missing API Key",
        description: "Cannot proceed without a valid Hygaar Key.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const body = {
        user_id: userId,
        hygaar_key: hygaarKey,
        edit_id: selectedVideo.edit_id,
        brand_outro_video_url: MergeData.brand_outro_video_url || "",
        outro_video_url: MergeData.brand_outro_video_url || "",
        custom_resize: MergeData.custom_resize || false,
        height: MergeData.height || "",
        width: MergeData.width || "",
      };

      const res = await axiosInstance.post(`/merged_video/`, body);

      const success = res.data?.success ?? false;
      const data = res.data?.data || {};
      const mergeId = data.job_id || data.merge_id || null;

      if (!success || !mergeId) throw new Error("Failed to start merge job.");

      setMergeData((prev) => ({ ...prev, merge_id: mergeId }));

      toast({
        title: "Merge started",
        description: `Tracking ID: ${mergeId}`,
        status: "info",
        duration: 4000,
        isClosable: true,
      });

      startPolling(mergeId);
    } catch (err) {
      toast({
        title: "Merge Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Error merging videos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Poll merge status ---
  const startPolling = (mergeId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPolling(true);
    setMergedVideo(null);
    setMergeStatus("submitted");

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(
          `/get_video_merge_job_status/?job_id=${mergeId}`
        );
        if (res.data?.success) {
          const job = res.data.data;
          setMergeStatus(job.status);

          if (["completed", "failed", "error"].includes(job.status)) {
            clearInterval(intervalRef.current);
            setPolling(false);

            if (job.status === "completed") {
              const finalVideoUrl =
                job.final_resize_video_url ||
                job.final_video_with_music_url ||
                job.final_video_url;
              setMergedVideo(finalVideoUrl);
              toast({
                title: "Merge Completed",
                description: "Your merged video is ready.",
                status: "success",
                duration: 3500,
                isClosable: true,
              });
            } else {
              toast({
                title: "Merge Failed",
                description: "The process encountered an error.",
                status: "error",
                duration: 3500,
                isClosable: true,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error polling:", err);
      }
    }, 10000);
  };

  // --- Video Card ---
  const VideoCard = ({ video, isSelected }) => {
    const previewUrl = video.captioned_final_video_url;
    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={isSelected ? activeShadow : "sm"}
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleSelect(video)}
        _hover={{ transform: "scale(1.01)", boxShadow: "lg" }}
        transition="all 0.2s ease"
      >
        <Flex
          h="200px"
          align="center"
          justify="center"
          bg="gray.900"
          overflow="hidden"
          position="relative"
        >
          {previewUrl ? (
            <>
              <video
                src={previewUrl}
                muted
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
              />
              <Box
                position="absolute"
                top="0"
                right="0"
                m={2}
                bg="blue.500"
                color="white"
                px={2}
                py={0.5}
                borderRadius="md"
                fontSize="xs"
              >
                Captioned
              </Box>
            </>
          ) : (
            <VStack>
              <Image as={MdPlayCircle} boxSize={8} color="gray.500" />
              <Text color="gray.400" fontSize="sm">
                No Preview
              </Text>
            </VStack>
          )}
        </Flex>
        <Box p={3}>
          <Text fontWeight="bold" noOfLines={1}>
            {video.project_name || "Untitled Project"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Edit ID: {video.edit_id}
          </Text>
          {isSelected && (
            <Text fontSize="sm" color="blue.500" mt={2} fontWeight="bold">
              Selected
            </Text>
          )}
        </Box>
      </VStack>
    );
  };

  // --- Polling View ---
  const ProcessingView = () => (
    <VStack
      w="100%"
      minH="70vh"
      justify="center"
      align="center"
      spacing={8}
      bg={pageBg}
    >
      {mergedVideo ? (
        <VStack spacing={6} p={5} bg={panelBg} borderRadius="xl" boxShadow="2xl">
          <Flex align="center" gap={3} color="green.500">
            <MdCheckCircle size={30} />
            <Text fontSize="2xl" fontWeight="bold">
              Merge Completed!
            </Text>
          </Flex>
          <Box
            w={{ base: "95%", md: "600px" }}
            borderRadius="xl"
            overflow="hidden"
            bg="black"
          >
            <video
              src={mergedVideo}
              controls
              autoPlay
              style={{ width: "100%", aspectRatio: "16/9" }}
            />
          </Box>
          <Button colorScheme="green" onClick={() => setPolling(false)}>
            View More Videos
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4} p={5} bg={panelBg} borderRadius="xl" boxShadow="xl">
          <Text fontSize="xl" fontWeight="semibold">
            Merging videos... Please wait.
          </Text>
          <Spinner size="xl" color="blue.400" />
          {mergeStatus && (
            <Text color="gray.500" mt={3}>
              Current Status: <b>{mergeStatus.toUpperCase()}</b>
            </Text>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              clearInterval(intervalRef.current);
              setPolling(false);
            }}
          >
            Stop Polling
          </Button>
        </VStack>
      )}
    </VStack>
  );

  return (
    <Flex direction="column" p={{ base: 4, md: 8 }} gap={6} bg={pageBg} w="100%">
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Video Merge
        </Text>
        <Button
          colorScheme="blue"
          size="md"
          onClick={handleMergeSubmit}
          isLoading={submitting}
          isDisabled={!selectedVideo || polling}
          leftIcon={<MdPlayCircle />}
        >
          {submitting ? "Starting..." : "Start Merge"}
        </Button>
      </Flex>

      {/* Body */}
      {polling ? (
        <ProcessingView />
      ) : loading ? (
        <Flex align="center" justify="center" h="60vh" w="100%">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Box w="100%" pb={8}>
          {videos.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
              {videos.map((video) => (
                <VideoCard
                  key={video.edit_id}
                  video={video}
                  isSelected={selectedVideo?.edit_id === video.edit_id}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Flex align="center" justify="center" h="50vh">
              <Text color="gray.500" fontSize="lg">
                No captioned videos available to merge.
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );
}
