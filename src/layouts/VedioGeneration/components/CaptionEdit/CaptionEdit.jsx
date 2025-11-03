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
  Select,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

export default function CaptionedCombine({ selectedUser }) {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); // ✅ Single video
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState("sequence"); // ✅ default

  const toast = useToast();
  const intervalRef = useRef(null);

  const bg = useColorModeValue("#F8FAFC", "#1A202C");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const transitionOptions = [
    "none", "fade", "dissolve",
    "slide", "slideright", "slideleft", "slideup", "slidedown",
    "zoomin", "zoomout",
    "wiperight", "wipeleft", "wipeup", "wipedown",
    "fadeblack", "fadewhite",
    "radial", "circlecrop", "rectcrop",
    "smoothleft", "smoothright",
    "distance", "dis_rot",
    "sequence", "sequential"
  ];

  // 🔹 Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/get_edited_videos_by_user/?user_id=${selectedUser || "SA-B124AD-9B"}`
        );
        if (res.data?.success) setVideos(res.data.data);
      } catch (err) {
        toast({
          title: "Failed to load videos",
          status: "error",
          duration: 2000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedUser, toast]);

  // 🔹 Select single video
  const handleSelectVideo = (video) => {
    setSelectedVideo((prev) => (prev?.edit_id === video.edit_id ? null : video));
  };

  // 🔹 Polling
  const pollStatus = (url) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPollingStarted(true);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data?.data;
        if (res.data?.success && data?.status === "completed_captioned") {
          clearInterval(intervalRef.current);
          setFinalVideoUrl(data?.final_video_url);
          setProcessing(false);
          toast({
            title: "✅ Captioned video ready!",
            status: "success",
            duration: 2500,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000);
  };

  // 🔹 Submit for processing
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Select one video to continue",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const payload = {
      hygaar_key: selectedVideo.hygaar_key,
      edit_id: selectedVideo.edit_id,
      transition_effect: transitionEffect,
    };

    try {
      setProcessing(true);
      const res = await axiosInstance.post(`/captioned_combined_video/`, payload);
      const statusUrl = res.data?.data?.status_check_url;
      if (res.data?.success && statusUrl) {
        pollStatus(statusUrl);
        toast({
          title: "Processing started...",
          status: "info",
          duration: 2000,
        });
      } else throw new Error("Invalid response");
    } catch (err) {
      console.error("Submit error:", err);
      setProcessing(false);
      toast({
        title: "Failed to start processing",
        status: "error",
        duration: 2000,
      });
    }
  };

  // 🔹 Video Card
  const VideoCard = ({ video }) => {
    const selected = selectedVideo?.edit_id === video.edit_id;
    return (
      <Box
        border="2px solid"
        borderColor={selected ? "blue.400" : borderColor}
        borderRadius="xl"
        bg={cardBg}
        overflow="hidden"
        cursor="pointer"
        transition="0.25s ease"
        _hover={{ transform: "scale(0.98)" }}
        onClick={() => handleSelectVideo(video)}
      >
        {video.final_video_url ? (
          <video
            src={video.final_video_url}
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
            <Text color="gray.500">No Preview</Text>
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

  // 🔹 Processing or Final View
  const ProcessingView = () => (
    <Flex
      direction={{ base: "column", lg: "row" }}
      justify="center"
      align="center"
      gap={{ base: 8, lg: 16 }}
      p={{ base: 4, md: 8 }}
      bg={bg}
      borderRadius="xl"
      minH="80vh"
      w="100%"
    >
      <Flex flex="1" direction="column" align="center" justify="center">
        {finalVideoUrl ? (
          <>
            <Text fontSize="2xl" fontWeight="bold" mb={5}>
              🎉 Captioned Video Completed
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
                src={finalVideoUrl}
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
              Processing your captioned video...
            </Text>
            <Spinner size="xl" color="blue.400" thickness="5px" />
            <Text color="gray.500" mt={3}>
              Please wait — it usually takes 2–4 minutes.
            </Text>
          </>
        )}
      </Flex>

      {selectedVideo && (
        <Box
          bg={cardBg}
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
                src={selectedVideo.final_video_url}
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
      {/* HEADER */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
          Captioned Video Combination
        </Text>

        {!processing && !pollingStarted && (
          <Flex gap={4} align="center">
            <Select
              size="md"
              value={transitionEffect}
              onChange={(e) => setTransitionEffect(e.target.value)}
              bg={cardBg}
              borderColor={borderColor}
              w="200px"
            >
              {transitionOptions.map((effect) => (
                <option key={effect} value={effect}>
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </option>
              ))}
            </Select>
            <Button
              colorScheme="green"
              size="md"
              onClick={handleSubmit}
              isDisabled={!selectedVideo}
            >
              Start Processing
            </Button>
          </Flex>
        )}
      </Flex>

      {/* BODY */}
      {processing || pollingStarted ? (
        <ProcessingView />
      ) : loading ? (
        <Flex align="center" justify="center" h="60vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {videos.map((v) => (
            <VideoCard key={v.edit_id} video={v} />
          ))}
        </SimpleGrid>
      )}
    </Flex>
  );
}
