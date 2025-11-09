import React, { useEffect, useState, startTransition } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  VStack,SimpleGrid
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdSend, MdReplay } from "react-icons/md";

export default function CaptionedEdit({ selectedUser, captionData, setCaptionData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [resultVideo, setResultVideo] = useState(null); // ✅ New state for result page
  const toast = useToast();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const color = useColorModeValue("#A0AEC0", "#4A5568");

  // ✅ Fetch all edited videos for user
  useEffect(() => {
    if (!selectedUser?.user_id) return;
    const controller = new AbortController();

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/get_edited_videos_by_user/`, {
          params: { user_id: selectedUser.user_id },
          signal: controller.signal,
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          startTransition(() => setVideos(res.data.data));
        } else {
          startTransition(() => setVideos([]));
          toast({
            title: "No videos found for this user",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("❌ Error fetching captioned videos:", err);
          toast({
            title: "Failed to load videos",
            description: err.response?.data?.message || "Check network or user ID.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        startTransition(() => setLoading(false));
      }
    };

    fetchVideos();
    return () => controller.abort();
  }, [selectedUser?.user_id, toast]);

  // ✅ Handle video selection
  const handleSelect = (video) => {
    startTransition(() => {
      setSelectedVideo(video);
      setCaptionData((prev) => ({
        ...prev,
        edit_id: video.edit_id || "",
        segment_number: video.total_segments_created || 1,
      }));
    });
  };

  // ✅ Handle caption submission
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Please select a video first",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      edit_id: selectedVideo.edit_id || captionData.edit_id,
      segment_number: Number(captionData.segment_number) || 1,
      captions: [
        {
          text: captionData.text,
          start_time: Number(captionData.start_time),
          end_time: Number(captionData.end_time),
          font_size: Number(captionData.font_size) || 52,
          font_color: captionData.font_color,
          background_color: captionData.background_color,
          background_opacity: Number(captionData.background_opacity) || 1,
          x: captionData.x,
          y: captionData.y,
          animation: captionData.animation || "none",
          animation_speed: captionData.animation_speed || "normal",
        },
      ],
      user_id: selectedUser?.user_id,
    };

    try {
      const res = await axiosInstance.post(`/factory_add_segment_captions/`, payload);

      if (res.data?.success) {
        const { captioned_segment_url, edit_id, segment_number } = res.data.data;

        toast({
          title: `Captions added successfully!`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });

        // ✅ Show only the result video in a new view
        setResultVideo({
          captioned_segment_url,
          edit_id,
          segment_number,
          project_name: selectedVideo.project_name || "Captioned Video",
        });

        // ✅ Clear previous videos and selections
        setVideos([]);
        setSelectedVideo(null);
      } else {
        throw new Error(res.data?.message || "API response error");
      }
    } catch (err) {
      console.error("❌ Error submitting caption segment:", err);
      toast({
        title: "Failed to submit caption segment",
        description: err.response?.data?.message || err.message || "An unknown error occurred.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      startTransition(() => setIsSubmitting(false));
    }
  };

  // ✅ Result view for single captioned video
  if (resultVideo) {
    return (
      <Flex direction="column" align="center" justify="center" h="100%" p={6} >
        <Box
          bg={panelBg}
          p={5}
          borderRadius="xl"
          boxShadow="lg"
          maxW="700px"
          w="100%"
          textAlign="center"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": { background: "none", borderRadius: "4px" },
          }}
           
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            🎉 Captioned Segment Ready!
          </Text>

          <video
            src={resultVideo.captioned_segment_url}
            controls
            autoPlay
            style={{
              width: "100%",
              borderRadius: "12px",
              maxHeight:"300px",
              marginBottom: "16px",
              boxShadow: "0 0 20px rgba(0,0,0,0.2)",
            }}
          />

          <Text fontWeight="semibold">
            Edit ID: <b>{resultVideo.edit_id}</b>
          </Text>
          <Text color="green.500" fontWeight="bold">
            Segment #{resultVideo.segment_number}
          </Text>


        </Box>
      </Flex>
    );
  }

  // ✅ Default Video List View
  return (
    <Flex direction="column" h="100%" w="100%" p={4} gap={4} overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": { background: color, borderRadius: "4px" },
          }}>
      <Flex justify="space-between" align="center">
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xl" fontWeight="bold">
            Captioned Edit
          </Text>
          {selectedVideo && (
            <Text fontSize="sm" color="gray.500">
              Selected Video ID: <b>{selectedVideo.edit_id}</b>
            </Text>
          )}
        </VStack>

        <Button
          colorScheme="blue"
          size="md"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          loadingText="Submitting..."
          isDisabled={!selectedVideo}
          leftIcon={isSubmitting ? undefined : <MdSend size={18} />}
        >
          Submit Captions
        </Button>
      </Flex>

      {loading ? (
        <Flex align="center" justify="center" flex="1">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : videos.length === 0 ? (
        <Flex align="center" justify="center" flex="1">
          <Text color="gray.500">No videos found for caption editing.</Text>
        </Flex>
      ) : (
        <Box
  flex="1"
  overflowY="auto"
  sx={{
    "&::-webkit-scrollbar": { width: "0px" },
    "&::-webkit-scrollbar-thumb": { background: "none", borderRadius: "4px" },
  }}
>
  <SimpleGrid
    columns={{ base: 1, sm: 2, md: 3 }} // 👈 1 col mobile, 2 tab, 3 desktop
    spacing={4}
    justifyItems="center"
  >
    {videos.map((video) => {
      const videoSrc =
        video.captioned_segment_url ||
        video.captioned_final_video_url ||
        video.final_video_url;

      const isSelected = selectedVideo?.edit_id === video.edit_id;

      return (
        <Box
          key={video.edit_id}
          bg={panelBg}
          border="2px solid"
          borderColor={isSelected ? "blue.400" : borderColor}
          borderRadius="xl"
          boxShadow={isSelected ? "0 0 15px rgba(66,153,225,0.5)" : "sm"}
          overflow="hidden"
          transition="all 0.3s ease"
          cursor="pointer"
          onClick={() => handleSelect(video)}
          _hover={{
            transform: "scale(1.03)",
            boxShadow: "lg",
          }}
        >
          {videoSrc ? (
            <video
              src={videoSrc}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
              controls
              muted
            />
          ) : (
            <Box
              w="100%"
              h="200px"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500">No Video</Text>
            </Box>
          )}
          <Box p={3}>
            <Text fontWeight="bold" noOfLines={1}>
              {video.project_name || "Unnamed Project"}
            </Text>
            <Text fontSize="sm" color="gray.500">
              ID: {video.edit_id}
            </Text>
          </Box>
        </Box>
      );
    })}
  </SimpleGrid>
</Box>

      )}
    </Flex>
  );
}
