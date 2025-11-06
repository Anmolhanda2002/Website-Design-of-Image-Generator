import React, { useEffect, useState, useRef,startTransition } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Select,
  VStack,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdCheckCircle, MdPlayCircle } from "react-icons/md";

export default function CaptionedCombine({ selectedUser }) {
  const toast = useToast();
  const intervalRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState("sequence");
  const [pollingStatusText, setPollingStatusText] = useState("Initializing...");
  const [selectuser, setSelectuser] = useState(selectedUser?.user_id ?? "");

  const bg = useColorModeValue("#F8FAFC", "#1A202C");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue(
    "0 0 10px rgba(66,153,225,0.7)",
    "0 0 10px rgba(66,153,225,0.9)"
  );

  const transitionOptions = [
    "none",
    "fade",
    "dissolve",
    "slide",
    "slideright",
    "slideleft",
    "slideup",
    "slidedown",
    "zoomin",
    "zoomout",
    "wiperight",
    "wipeleft",
    "wipeup",
    "wipedown",
    "fadeblack",
    "fadewhite",
    "radial",
    "circlecrop",
    "rectcrop",
    "smoothleft",
    "smoothright",
    "distance",
    "dis_rot",
    "sequence",
    "sequential",
  ];

  // ✅ Sync `selectedUser` safely — only store string ID
  useEffect(() => {
    if (selectedUser?.user_id && typeof selectedUser.user_id === "string") {
      setSelectuser(selectedUser.user_id);
    }
  }, [selectedUser]);

  // ✅ Fetch captioned videos when `selectuser` is ready
 

useEffect(() => {
  if (!selectuser) return;

  
    const fetchVideos = async () => {
      console.log("🎯 Fetching videos for user:", selectuser);
      setLoading(true);
      try {

console.log("")
        
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectuser },
        });

        const success = res.data?.success ?? true;
        const message = res.data?.message || "Videos fetched successfully.";
        const allVideos = res.data?.data || [];
        const captionedVideos =
          allVideos.filter((v) => v.captioned_final_video_url) || [];

        setVideos(captionedVideos);

        if (captionedVideos.length === 0) {
          toast({
            title: "No captioned videos found",
            description: "You don't have any captioned videos yet.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        } else if (!success) {
          toast({
            title: "Warning",
            description: message,
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        } else {
          console.log("✅", message);
        }
      } catch (err) {
        console.error("❌ Failed to load videos:", err);
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
 
}, [selectuser, toast]);

  // ✅ Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 🔹 Select one video
  const handleSelectVideo = (video) => {
    setSelectedVideo((prev) =>
      prev?.edit_id === video.edit_id ? null : video
    );
  };

  // 🔹 Polling job status
  const pollStatus = (url) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPollingStarted(true);
    setProcessing(true);
    setPollingStatusText("Job submitted. Waiting for completion...");

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data?.data;
        const currentStatus = data?.status;
        setPollingStatusText(`Status: ${currentStatus?.toUpperCase()}`);

        if (
          currentStatus === "completed_captioned" ||
          currentStatus === "completed"
        ) {
          clearInterval(intervalRef.current);
          const finalUrl =
            data?.final_video_url ||
            data?.final_resize_video_url ||
            data?.captioned_combined_video_url;
          setFinalVideoUrl(finalUrl);
          setProcessing(false);
          toast({
            title: "✅ Captioned video ready!",
            status: "success",
            duration: 3500,
            isClosable: true,
          });
        } else if (currentStatus === "failed" || currentStatus === "error") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setFinalVideoUrl(null);
          toast({
            title: "❌ Processing Failed",
            description:
              data?.message || "The backend job failed to complete.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000);
  };

  // 🔹 Submit video for captioned processing
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Selection required",
        description: "Please select one video to continue.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    setProcessing(true);
    setFinalVideoUrl(null);
    setPollingStarted(false);
    setPollingStatusText("Submitting job...");

    const payload = {
      hygaar_key: selectedVideo.hygaar_key,
      edit_id: selectedVideo.edit_id,
      transition_effect: transitionEffect,
      user_id: selectuser, // always string
    };

    try {
      const res = await axiosInstance.post(`/captioned_combined_video/`, payload);
      const success = res.data?.success;
      const message = res.data?.message || "Request processed.";
      const data = res.data?.data;
      const statusUrl = data?.status_check_url;

      if (success && statusUrl) {
        pollStatus(statusUrl);
        toast({
          title: "Processing started",
          description:
            message ||
            "Combining video with transition effect in progress.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error(
          message || "Invalid response from the backend. Please try again."
        );
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setProcessing(false);
      setPollingStarted(false);
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "An unknown error occurred.";
      toast({
        title: "Failed to start processing",
        description: backendMsg,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // 🔹 Video card
  const VideoCard = ({ video }) => {
    const selected = selectedVideo?.edit_id === video.edit_id;
    return (
      <Box
        border="2px solid"
        borderColor={selected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={selected ? activeShadow : "sm"}
        bg={cardBg}
        overflow="hidden"
        cursor="pointer"
        transition="0.25s ease"
        _hover={{ transform: "scale(1.01)" }}
        onClick={() => handleSelectVideo(video)}
      >
        {video.captioned_final_video_url ? (
          <video
            src={video.captioned_final_video_url}
            muted
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
          />
        ) : (
          <Box
            h="200px"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="gray.500">No Captioned Video Preview</Text>
          </Box>
        )}
        <Box p={3}>
          <Text fontWeight="bold" noOfLines={1}>
            {video.project_name || "Untitled"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Edit ID: {video.edit_id}
          </Text>
          {selected && (
            <Text
              fontSize="sm"
              color="blue.500"
              fontWeight="semibold"
              mt={1}
            >
              Selected
            </Text>
          )}
        </Box>
      </Box>
    );
  };

  // 🔹 Processing / Final video display
  const ProcessingView = () => (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={{ base: 4, md: 8 }}
      bg={cardBg}
      borderRadius="xl"
      minH="70vh"
      w="100%"
      boxShadow="lg"
    >
      {finalVideoUrl ? (
        <VStack spacing={6} w={{ base: "100%", md: "600px" }} maxW="100%">
          <Flex align="center" gap={3} color="green.500">
            <MdCheckCircle size={30} />
            <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
              Combination Complete!
            </Text>
          </Flex>
          <Box
            borderRadius="xl"
            overflow="hidden"
            boxShadow="dark-lg"
            bg="black"
            w="100%"
          >
            <video
              src={finalVideoUrl}
              controls
              autoPlay
              style={{
                width: "100%",
                height: "auto",
                minHeight: "300px",
                borderRadius: "12px",
                backgroundColor: "black",
              }}
            />
          </Box>
          <Button
            colorScheme="blue"
            onClick={() => {
              setProcessing(false);
              setPollingStarted(false);
              setFinalVideoUrl(null);
            }}
          >
            Combine Another Video
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Text fontSize="xl" fontWeight="semibold">
            Combining Captioned Segments...
          </Text>
          <Spinner size="xl" color="blue.400" thickness="5px" />
          <Text color="gray.500" mt={3} fontWeight="medium" textAlign="center">
            {pollingStatusText}
          </Text>
          <Text color="gray.500" fontSize="sm">
            Estimated time: 1-5 minutes, depending on video length.
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
              setProcessing(false);
              setPollingStarted(false);
              setFinalVideoUrl(null);
              setPollingStatusText("Canceled.");
            }}
          >
            Cancel Job
          </Button>
        </VStack>
      )}
    </Flex>
  );

  return (
    <Box bg={bg} minH="100%" w="100%" overflowY="auto" p={{ base: 4, md: 8 }}>
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} mb={6}>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
          Captioned Video Combination
        </Text>
        {!(processing || pollingStarted) && (
          <Flex gap={4} align="center" flexWrap="wrap">
            <Select
              size="md"
              value={transitionEffect}
              onChange={(e) => setTransitionEffect(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
              w={{ base: "100%", sm: "200px" }}
            >
              {transitionOptions.map((effect) => (
                <option key={effect} value={effect}>
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </option>
              ))}
            </Select>
            <Button
              colorScheme="blue"
              size="md"
              onClick={handleSubmit}
              isDisabled={!selectedVideo || processing}
              leftIcon={<MdPlayCircle />}
            >
              Start Processing
            </Button>
          </Flex>
        )}
      </Flex>

      {processing || pollingStarted ? (
        <ProcessingView />
      ) : loading ? (
        <Flex align="center" justify="center" h="60vh">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : videos.length > 0 ? (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          spacing={6}
          pb={10}
        >
          {videos.map((v) => (
            <VideoCard key={v.edit_id} video={v} />
          ))}
        </SimpleGrid>
      ) : (
        <Flex align="center" justify="center" h="50vh">
          <Text color="gray.500" fontSize="lg" textAlign="center">
            No captioned videos found for this user.
          </Text>
        </Flex>
      )}
    </Box>
  );
}
