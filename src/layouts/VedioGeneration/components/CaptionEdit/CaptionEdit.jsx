import React, { useEffect, useState, useRef, startTransition } from "react";
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
    "none", "fade", "dissolve", "slide", "slideright", "slideleft",
    "slideup", "slidedown", "zoomin", "zoomout", "wiperight", "wipeleft",
    "wipeup", "wipedown", "fadeblack", "fadewhite", "radial", "circlecrop",
    "rectcrop", "smoothleft", "smoothright", "distance", "dis_rot",
    "sequence", "sequential",
  ];

  // Sync selectedUser ID
  useEffect(() => {
    if (selectedUser?.user_id && typeof selectedUser.user_id === "string") {
      setSelectuser(selectedUser.user_id);
    }
  }, [selectedUser]);

  // ✅ Fetch videos (supports final_video_url)
  useEffect(() => {
    if (!selectuser) return;

    const fetchVideos = async () => {
      console.log("🎯 Fetching videos for user:", selectuser);
      setLoading(true);
      try {
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectuser },
        });

        const allVideos = res.data?.data || [];

        // ✅ FIX — accept ANY valid video URL
        const captionedVideos = allVideos.filter((v) =>
          v.captioned_final_video_url ||
          v.final_video_url ||
          v.final_resize_video_url ||
          v.captioned_combined_video_url
        );

        setVideos(captionedVideos);

        if (captionedVideos.length === 0) {
          toast({
            title: "No videos found",
            description: "This user has no processed videos.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("❌ Failed to load videos:", err);
        toast({
          title: "Failed to load videos",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectuser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Select a video
  const handleSelectVideo = (video) => {
    setSelectedVideo((prev) =>
      prev?.edit_id === video.edit_id ? null : video
    );
  };

  // ✅ Polling job status
  const pollStatus = (url) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setPollingStarted(true);
    setProcessing(true);
    setPollingStatusText("Job submitted...");

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data?.data;

        const currentStatus = data?.status;
        setPollingStatusText(`Status: ${currentStatus?.toUpperCase()}`);

        if (currentStatus === "completed" || currentStatus === "completed_captioned") {
          clearInterval(intervalRef.current);

          // ✅ FIX — support all final video keys
          const finalUrl =
            data?.final_video_url ||
            data?.captioned_combined_video_url ||
            data?.final_resize_video_url;

          setFinalVideoUrl(finalUrl);
          setProcessing(false);

          toast({
            title: "✅ Video Ready!",
            status: "success",
            duration: 3500,
            isClosable: true,
          });
        }

        if (currentStatus === "failed" || currentStatus === "error") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setFinalVideoUrl(null);
          toast({
            title: "❌ Processing Failed",
            description: data?.message,
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 8000);
  };

  // Submit processing job
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Select a video",
        description: "Please select a video to continue.",
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
      user_id: selectuser,
      transition_effect: transitionEffect,
    };

    try {
      const res = await axiosInstance.post(`/captioned_combined_video/`, payload);

      const statusUrl = res.data?.data?.status_check_url;

      if (statusUrl) {
        pollStatus(statusUrl);
        toast({
          title: "Processing started",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      setProcessing(false);
      toast({
        title: "Failed to start processing",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // ✅ Video Card with fixed preview logic
  const VideoCard = ({ video }) => {
    const selected = selectedVideo?.edit_id === video.edit_id;

    const videoUrl =
      video.captioned_final_video_url ||
      video.final_video_url ||
      video.final_resize_video_url ||
      video.captioned_combined_video_url;

    return (
      <Box
        border="2px solid"
        borderColor={selected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={selected ? activeShadow : "sm"}
        bg={cardBg}
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleSelectVideo(video)}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
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
            <Text color="gray.500">No Video Preview</Text>
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
            <Text fontSize="sm" color="blue.500" fontWeight="semibold" mt={1}>
              Selected
            </Text>
          )}
        </Box>
      </Box>
    );
  };

  // Processing Screen
  const ProcessingView = () => (
    <Flex
      direction="column"
      align="center"
      justify="center"
      p={6}
      bg={cardBg}
      borderRadius="xl"
      minH="70vh"
      w="100%"
    >
      {finalVideoUrl ? (
        <VStack spacing={6} w={{ base: "100%", md: "600px" }}>
          <Flex align="center" gap={3} color="green.500">
            <MdCheckCircle size={30} />
            <Text fontSize="2xl" fontWeight="bold">
              Combination Complete!
            </Text>
          </Flex>

          <Box borderRadius="xl" overflow="hidden" bg="black" w="100%">
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
            Combining video segments...
          </Text>
          <Spinner size="xl" color="blue.400" thickness="5px" />
          <Text color="gray.500">{pollingStatusText}</Text>
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
    <Box bg={bg} minH="100%" p={6}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Video Combination
        </Text>

        {!processing && !pollingStarted && (
          <Flex gap={4} align="center">
            <Select
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
              leftIcon={<MdPlayCircle />}
              onClick={handleSubmit}
              isDisabled={!selectedVideo || processing}
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
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {videos.map((v) => (
            <VideoCard key={v.edit_id} video={v} />
          ))}
        </SimpleGrid>
      ) : (
        <Flex align="center" justify="center" h="50vh">
          <Text color="gray.500" fontSize="lg">
            No videos found for this user.
          </Text>
        </Flex>
      )}
    </Box>
  );
}
