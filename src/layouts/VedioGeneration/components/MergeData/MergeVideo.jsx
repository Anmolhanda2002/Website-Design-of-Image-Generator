import React, { useEffect, useState, startTransition, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

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

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");

  // 🎞 Fetch all captioned videos for the selected user
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/get_edited_videos_by_user/?user_id=${selectedUser || "SA-B124AD-9B"}`
        );
        if (res.data?.success && Array.isArray(res.data.data)) {
          setVideos(res.data.data);
        } else {
          setVideos([]);
          toast({
            title: "No videos found for this user.",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching videos:", err);
        toast({
          title: "Failed to load videos",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedUser, toast]);

  // 🎬 Select a video
  const handleSelect = (video) => {
    startTransition(() => {
      setSelectedVideo(video);
      setMergeData((prev) => ({
        ...prev,
        edit_id: video.edit_id,
        hygaar_key: video.hygaar_key,
      }));
    });
  };

  // 🚀 Submit merge request
  const handleMergeSubmit = async () => {
    if (!MergeData.user_id || !MergeData.hygaar_key || !MergeData.edit_id) {
      toast({
        title: "Missing required fields",
        description: "User ID, Hygaar Key or Edit ID missing.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      const mergeBody = {
        user_id: MergeData.user_id,
        hygaar_key: MergeData.hygaar_key,
        edit_id: MergeData.edit_id,
        brand_outro_video_url: MergeData.brand_outro_video_url || "",
        outro_video_url: MergeData.brand_outro_video_url || "",
      };

      const mergeRes = await axiosInstance.post(`/merged_video/`, mergeBody);
      if (!mergeRes.data?.success) throw new Error("Merge API failed");

      const mergeId =
        mergeRes.data?.data?.job_id ||
        mergeRes.data?.data?.merge_id ||
        mergeRes.data?.data?.id ||
        "";

      setMergeData((prev) => ({
        ...prev,
        mearg_id: mergeId,
      }));

      toast({
        title: "✅ Merge job started!",
        description: `Merge ID: ${mergeId}`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      startPolling(mergeId);
    } catch (err) {
      console.error("❌ Error merging videos:", err);
      toast({
        title: "Error during merge process",
        description: err.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🔁 Polling merge job status every 10s
  const startPolling = (mergeId) => {
    setPolling(true);
    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(
          `/get_video_merge_job_status/?job_id=${mergeId}`
        );
        if (res.data?.success) {
          const job = res.data.data;
          setMergeStatus(job.status);

          if (
            job.status === "completed" ||
            job.status === "failed" ||
            job.status === "error"
          ) {
            clearInterval(intervalRef.current);
            setPolling(false);

            if (job.status === "completed") {
              setMergedVideo(
                job.final_resize_video_url ||
                  job.final_video_with_music_url ||
                  job.final_video_url
              );
              toast({
                title: "🎉 Merge Completed!",
                description: "Your merged video is ready.",
                status: "success",
                duration: 2500,
                isClosable: true,
              });
            } else {
              toast({
                title: "❌ Merge Failed",
                description: "Please try again.",
                status: "error",
                duration: 2500,
                isClosable: true,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error polling job:", err);
      }
    }, 10000);
  };

  // 🎥 Video Card
  const VideoCard = ({ video, isSelected }) => (
    <Box
      bg={panelBg}
      border="2px solid"
      borderColor={isSelected ? "blue.400" : borderColor}
      borderRadius="xl"
      boxShadow={isSelected ? "0 0 15px rgba(66,153,225,0.5)" : "sm"}
      overflow="hidden"
      transition="all 0.3s ease"
      cursor="pointer"
      onClick={() => handleSelect(video)}
      _hover={{ transform: "scale(0.98)" }}
    >
      {video.captioned_final_video_url ? (
        <video
          src={video.captioned_final_video_url}
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
          muted
        />
      ) : (
        <Flex h="200px" align="center" justify="center" bg="gray.100">
          <Text color="gray.500">No Preview</Text>
        </Flex>
      )}
      <Box p={3}>
        <Text fontWeight="bold" noOfLines={1}>
          {video.project_name || "Unnamed Project"}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Hygaar Key: {video.hygaar_key}
        </Text>
      </Box>
    </Box>
  );

  // 🌀 Processing View (Styled like CaptionedCombine)
  const ProcessingView = () => (
    <Flex
      direction={{ base: "column", lg: "row" }}
      justify="center"
      align="center"
      gap={{ base: 8, lg: 16 }}
      p={{ base: 4, md: 8 }}
      bg={pageBg}
      borderRadius="xl"
      minH="80vh"
      w="100%"
    >
      <Flex flex="1" direction="column" align="center" justify="center">
        {mergedVideo ? (
          <>
            <Text fontSize="2xl" fontWeight="bold" mb={5}>
              🎉 Merge Completed
            </Text>
            <Box
              w={{ base: "100%", md: "600px" }}
              maxW="100%"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="lg"
              bg="black"
            >
              <video
                src={mergedVideo}
                controls
                autoPlay
                style={{
                  width: "100%",
                  height: "50vh",
                  borderRadius: "12px",
                  backgroundColor: "black",
                }}
              />
            </Box>
          </>
        ) : (
          <>
            <Text fontSize="xl" fontWeight="semibold" mb={4}>
              Processing your merged video...
            </Text>
            <Spinner size="xl" color="blue.400" thickness="5px" />
            {mergeStatus && (
              <Text color="gray.500" mt={3}>
                Current Status: {mergeStatus}
              </Text>
            )}
          </>
        )}
      </Flex>

      {selectedVideo && (
        <Box
          bg={panelBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="xl"
          p={5}
          w={{ base: "100%", md: "380px" }}
          boxShadow="sm"
        >
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            Selected Video
          </Text>
          <Flex align="center" gap={4}>
            <Box
              w="100px"
              h="80px"
              borderRadius="md"
              overflow="hidden"
              bg="gray.100"
              flexShrink={0}
            >
              <video
                src={selectedVideo.captioned_final_video_url}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Box>
              <Text fontWeight="semibold" noOfLines={1}>
                {selectedVideo.project_name || "Untitled"}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {selectedVideo.edit_id}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}
    </Flex>
  );

  return (
    <Flex direction="column" p={{ base: 4, md: 8 }} gap={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
          Captioned Video Merge
        </Text>
        {!polling && (
          <Button
            colorScheme="blue"
            size="md"
            onClick={handleMergeSubmit}
            isLoading={submitting}
            isDisabled={!selectedVideo}
          >
            Start Merge
          </Button>
        )}
      </Flex>

      {/* Body */}
      {polling ? (
        <ProcessingView />
      ) : loading ? (
        <Flex align="center" justify="center" h="60vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {videos.map((video) => (
            <VideoCard
              key={video.edit_id}
              video={video}
              isSelected={selectedVideo?.edit_id === video.edit_id}
            />
          ))}
        </SimpleGrid>
      )}
    </Flex>
  );
}
