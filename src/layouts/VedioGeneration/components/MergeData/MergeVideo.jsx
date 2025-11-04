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
  VStack, // Added for card layout
  Image, // Added for potential fallback image display
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdPlayCircle, MdCheckCircle, MdErrorOutline } from "react-icons/md";

// Note: Assuming 'MergeData' and 'setMergeData' are used to communicate with the main layout.
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

  // --- Styling Constants ---
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue("0 0 10px rgba(66,153,225,0.7)", "0 0 10px rgba(66,153,225,0.9)");

  // --- Effect: Stop polling on unmount ---
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // --- Effect: Fetch all captioned videos for the selected user ---
useEffect(() => {
  // ✅ Retrieve user_id safely from localStorage or props
  const storedUserId =
    JSON.parse(localStorage.getItem("user"))?.user_id ||
    localStorage.getItem("user_id") ||
    selectedUser || 
    null;

  if (!storedUserId) {
    setVideos([]);
    toast({
      title: "User ID not found",
      description: "Please log in or ensure a valid user ID is stored.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const fetchVideos = async () => {
    try {
      setLoading(true);

      // ✅ Use params to ensure proper encoding
      const res = await axiosInstance.get("/get_edited_videos_by_user/", {
        params: { user_id: storedUserId },
      });

      const success = res.data?.success ?? false;
      const message =
        res.data?.message ||
        res.data?.detail ||
        "Fetched videos successfully.";
      const videos = Array.isArray(res.data?.data) ? res.data.data : [];

      if (success && videos.length > 0) {
        setVideos(videos);
      } else {
        setVideos([]);
        toast({
          title: "No captioned videos found",
          description: message,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching videos:", err);

      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred while fetching videos.";

      toast({
        title: "Failed to load videos",
        description: backendMsg,
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


  // --- Handler: Select a video ---
  const handleSelect = (video) => {
    startTransition(() => {
      setSelectedVideo(video);
      setMergedVideo(null); // Clear previous merge result
      setMergeStatus(null);
      
      // Update the MergeData state with necessary IDs for the merge operation
      setMergeData((prev) => ({
        ...prev,
        user_id: selectedUser, // Use the prop for user ID
        edit_id: video.edit_id,
        hygaar_key: video.hygaar_key,
        // Other merge fields like brand_outro_video_url are left as they might be set elsewhere
      }));
    });
  };

  // --- Handler: Submit merge request ---
const handleMergeSubmit = async () => {
  // ✅ Get user_id safely from localStorage
  const storedUserId =
    JSON.parse(localStorage.getItem("user"))?.user_id ||
    localStorage.getItem("user_id") ||
    selectedUser || // fallback if selected manually
    null;

  if (!selectedVideo || !storedUserId) {
    toast({
      title: "Selection required",
      description:
        "Please select a captioned video and ensure a valid User ID is available.",
      status: "warning",
      duration: 2500,
      isClosable: true,
    });
    return;
  }

  // ✅ Get Hygaar Key safely
  const hygaarKey =
    selectedVideo.hygaar_key || localStorage.getItem("api_key") || null;

  if (!hygaarKey) {
    toast({
      title: "API Key missing",
      description: "Cannot proceed without a valid Hygaar Key.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  try {
    setSubmitting(true);

    const mergeBody = {
      user_id: storedUserId,
      hygaar_key: hygaarKey,
      edit_id: selectedVideo.edit_id,
      brand_outro_video_url: MergeData.brand_outro_video_url || "",
      outro_video_url: MergeData.brand_outro_video_url || "",
      custom_resize: MergeData.custom_resize || false,
      height: MergeData.height || "",
      width: MergeData.width || "",
    };

    const mergeRes = await axiosInstance.post(`/merged_video/`, mergeBody);

    // ✅ Extract backend message and data properly
    const success = mergeRes.data?.success ?? false;
    const message =
      mergeRes.data?.message ||
      mergeRes.data?.detail ||
      "Merge request completed.";
    const data = mergeRes.data?.data || {};

    if (!success) throw new Error(message);

    const mergeId =
      data.job_id || data.merge_id || data.id || null;

    if (!mergeId) throw new Error("Could not retrieve merge job ID from backend.");

    // ✅ Store merge ID for tracking
    setMergeData((prev) => ({ ...prev, merge_id: mergeId }));

    toast({
      title: "✅ Merge job started!",
      description: `${message} (Merge ID: ${mergeId})`,
      status: "info",
      duration: 4000,
      isClosable: true,
    });

    startPolling(mergeId);
  } catch (err) {
    console.error("❌ Error merging videos:", err);

    const backendMsg =
      err.response?.data?.message ||
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.message ||
      "An unexpected error occurred during the merge process.";

    toast({
      title: "Merge Failed",
      description: backendMsg,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setSubmitting(false);
  }
};


  // --- Polling merge job status every 10s ---
  const startPolling = (mergeId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPolling(true);
    setMergedVideo(null); // Clear completed video when new job starts
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
              const finalVideoUrl = job.final_resize_video_url || job.final_video_with_music_url || job.final_video_url;
              setMergedVideo(finalVideoUrl);
              toast({
                title: "🎉 Merge Completed!",
                description: "Your merged video is ready.",
                status: "success",
                duration: 3500,
                isClosable: true,
              });
            } else {
              setMergedVideo(null);
              toast({
                title: "❌ Merge Failed",
                description: "The merge process encountered an error.",
                status: "error",
                duration: 3500,
                isClosable: true,
              });
            }
          }
        }
      } catch (err) {
        console.error("Error polling job:", err);
      }
    }, 10000); // Poll every 10 seconds
  };

  // --- Component: Video Card ---
  const VideoCard = ({ video, isSelected }) => {
    // Only display the video if it has captions applied (captioned_final_video_url)
    const previewUrl = video.captioned_final_video_url;
    
    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={isSelected ? activeShadow : "sm"}
        overflow="hidden"
        transition="all 0.3s ease"
        cursor="pointer"
        onClick={() => handleSelect(video)}
        _hover={{ transform: "scale(1.01)", boxShadow: isSelected ? activeShadow : "md" }}
        align="stretch"
      >
        <Flex h="200px" align="center" justify="center" bg="gray.900" overflow="hidden" position="relative">
          {previewUrl ? (
            <>
              <video
                src={previewUrl}
                style={{ width: "100%", height: "200px", objectFit: "cover" }}
                muted
              />
              <Box position="absolute" top="0" right="0" m={2} bg="blue.500" color="white" px={2} py={0.5} borderRadius="md" fontSize="xs" fontWeight="semibold">
                  Captioned
              </Box>
            </>
          ) : (
            <VStack spacing={2}>
                <Image as={MdPlayCircle} boxSize={8} color="gray.500" />
                <Text color="gray.500" fontSize="sm">Video URL Missing</Text>
            </VStack>
          )}
        </Flex>
        
        <Box p={3}>
          <Text fontWeight="bold" noOfLines={1} fontSize="md">
            {video.project_name || "Unnamed Project"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Edit ID: {video.edit_id}
          </Text>
          <Text fontSize="xs" color="gray.400" mt={1}>
            Key: {video.hygaar_key}
          </Text>
          {isSelected && (
              <Text fontSize="sm" color="blue.500" fontWeight="bold" mt={2}>
                  Selected for Merge
              </Text>
          )}
        </Box>
      </VStack>
    );
  };

  // --- Component: Processing View ---
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
        // --- Completed View ---
        <VStack spacing={6} p={5} bg={panelBg} borderRadius="xl" boxShadow="2xl">
          <Flex align="center" gap={3} color="green.500">
              <MdCheckCircle size={30} />
              <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                  Merge Completed!
              </Text>
          </Flex>
          <Box
            w={{ base: "95%", md: "600px" }}
            maxW="100%"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="dark-lg"
            bg="black"
          >
            <video
              src={mergedVideo}
              controls
              autoPlay
              style={{
                width: "100%",
                aspectRatio: "16/9", // Use aspect ratio for responsiveness
                backgroundColor: "black",
              }}
            />
          </Box>
          <Button colorScheme="green" onClick={() => setPolling(false)}>
              View More Videos
          </Button>
        </VStack>
      ) : (
        // --- Polling/Loading View ---
        <VStack spacing={4} p={5} bg={panelBg} borderRadius="xl" boxShadow="xl">
          <Text fontSize="xl" fontWeight="semibold">
            Merging videos... Please wait.
          </Text>
          <Spinner size="xl" color="blue.400" thickness="5px" />
          {mergeStatus && (
            <Text color="gray.500" mt={3} fontWeight="medium">
              Current Status: **{mergeStatus.toUpperCase()}**
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
    <Flex
      direction="column"
      p={{ base: 4, md: 8 }}
      gap={6}
      bg={pageBg}
      w="100%" // Full width container
      minH="100%"
      overflowY="auto"
    >
      {/* Header and Action Button */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
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
          {submitting ? "Initiating..." : "Start Merge"}
        </Button>
      </Flex>

      {/* Body: Conditional Views */}
      {polling ? (
        <ProcessingView />
      ) : loading ? (
        <Flex align="center" justify="center" h="60vh" w="100%">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Box w="100%" pb={8}>
          {videos.length > 0 ? (
            <SimpleGrid
              columns={{ base: 1, sm: 2, lg: 3 }}
              spacing={6}
              w="100%"
            >
              {videos.map((video) => (
                <VideoCard
                  key={video.edit_id}
                  video={video}
                  isSelected={selectedVideo?.edit_id === video.edit_id}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Flex align="center" justify="center" h="50vh" w="100%">
              <Text color="gray.500" fontSize="lg" textAlign="center">
                No captioned videos available to merge.
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );
}