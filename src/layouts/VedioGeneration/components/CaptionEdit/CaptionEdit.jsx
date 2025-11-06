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
    "slideup", "slidedown", "zoomin", "zoomout", "wiperight",
    "wipeleft", "wipeup", "wipedown", "fadeblack", "fadewhite",
    "radial", "circlecrop", "rectcrop", "smoothleft", "smoothright",
    "distance", "dis_rot", "sequence", "sequential",
  ];

  // Sync selected user
  useEffect(() => {
    if (selectedUser?.user_id) {
      setSelectuser(selectedUser.user_id);
    }
  }, [selectedUser]);

  // ✅ Fetch videos with playback support
  useEffect(() => {
    if (!selectuser) return;

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectuser },
        });

        const allVideos = res.data?.data || [];

        // ✅ Accept ANY valid video URL so preview plays
        const captionedVideos = allVideos.filter((v) =>
          v.captioned_final_video_url ||
          v.final_video_url ||
          v.final_resize_video_url ||
          v.captioned_combined_video_url
        );

        setVideos(captionedVideos);
      } catch (err) {
        toast({
          title: "Error loading videos",
          description: err.message,
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectuser]);

  // Cleanup interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Select Video
  const handleSelectVideo = (video) => {
    setSelectedVideo((prev) =>
      prev?.edit_id === video.edit_id ? null : video
    );
  };

  // ✅ Polling Logic
  const pollStatus = (url) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setPollingStarted(true);
    setProcessing(true);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data?.data;

        if (!data) return;

        const status = data.status;
        setPollingStatusText("Status: " + status);

        if (status === "completed" || status === "completed_captioned") {
          clearInterval(intervalRef.current);

          // ✅ Support all video keys
          const finalUrl =
            data.final_video_url ||
            data.captioned_combined_video_url ||
            data.final_resize_video_url;

          setFinalVideoUrl(finalUrl);
          setProcessing(false);

          toast({
            title: "✅ Video Ready!",
            status: "success",
          });
        }

        if (status === "failed" || status === "error") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          toast({
            title: "❌ Processing failed",
            status: "error",
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 6000);
  };

  // ✅ Start Processing
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "No video selected",
        status: "warning",
      });
      return;
    }

    setProcessing(true);
    setFinalVideoUrl(null);

    const payload = {
      hygaar_key: selectedVideo.hygaar_key,
      edit_id: selectedVideo.edit_id,
      user_id: selectuser,
      transition_effect: transitionEffect,
    };

    try {
      const res = await axiosInstance.post(`/captioned_combined_video/`, payload);
      const statusUrl = res.data?.data?.status_check_url;

      pollStatus(statusUrl);
    } catch (err) {
      toast({
        title: "Error starting processing",
        description: err.message,
        status: "error",
      });
      setProcessing(false);
    }
  };

  // ✅ Video Card (preview plays properly)
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
            controls        // ✅ PREVIEW CAN PLAY NOW
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
          />
        ) : (
          <Box
            h="200px"
            bg="gray.200"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>No Preview</Text>
          </Box>
        )}

        <Box p={3}>
          <Text fontWeight="bold" noOfLines={1}>
            {video.project_name || "Untitled"}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {video.edit_id}
          </Text>
        </Box>
      </Box>
    );
  };

  // ✅ Processing UI
  const ProcessingView = () => (
    <Flex align="center" justify="center" minH="70vh" direction="column">
      {finalVideoUrl ? (
        <VStack spacing={6} w={{ base: "100%", md: "600px" }}>
          <Flex align="center" gap={3} color="green.500">
            <MdCheckCircle size={30} />
            <Text fontSize="2xl" fontWeight="bold">
              Video Ready!
            </Text>
          </Flex>

          {/* ✅ PLAY FINAL VIDEO HERE */}
          <video
            src={finalVideoUrl}
            controls
            autoPlay
            style={{
              width: "100%",
              borderRadius: "14px",
              backgroundColor: "black",
            }}
          />

          <Button
            colorScheme="blue"
            onClick={() => {
              setProcessing(false);
              setFinalVideoUrl(null);
              setPollingStarted(false);
            }}
          >
            Process Another
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.400" />
          <Text>{pollingStatusText}</Text>
        </VStack>
      )}
    </Flex>
  );

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <Flex justify="space-between" mb={6} flexWrap="wrap">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Video Combine
        </Text>

        {!processing && !pollingStarted && (
          <Flex gap={4}>
            <Select
              value={transitionEffect}
              onChange={(e) => setTransitionEffect(e.target.value)}
              w="200px"
            >
              {transitionOptions.map((effect) => (
                <option key={effect} value={effect}>
                  {effect}
                </option>
              ))}
            </Select>

            <Button
              colorScheme="blue"
              leftIcon={<MdPlayCircle />}
              onClick={handleSubmit}
              disabled={!selectedVideo}
            >
              Start Combine
            </Button>
          </Flex>
        )}
      </Flex>

      {processing || pollingStarted ? (
        <ProcessingView />
      ) : loading ? (
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" />
        </Flex>
      ) : videos.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {videos.map((v) => (
            <VideoCard key={v.edit_id} video={v} />
          ))}
        </SimpleGrid>
      ) : (
        <Flex align="center" justify="center" h="50vh">
          <Text>No videos found.</Text>
        </Flex>
      )}
    </Box>
  );
}
