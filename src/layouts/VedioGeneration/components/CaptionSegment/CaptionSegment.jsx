import React, { useEffect, useState, startTransition } from "react";
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

export default function CaptionedEdit({ selectedUser, captionData, setCaptionData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const toast = useToast();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // 🔹 Fetch edited videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        // const res = await axiosInstance.get(`/get_edited_videos_by_user/?user_id=${selectedUser}`);
        const res = await axiosInstance.get(`/get_edited_videos_by_user/?user_id=SA-B124AD-9B`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setVideos(res.data.data);
        } else {
          setVideos([]);
          toast({
            title: "No videos found for this user",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching captioned videos:", err);
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

  // 🔹 Handle video selection
  const handleSelect = (video) => {
    console.log(video);
    startTransition(() => {
      setSelectedVideo(video);
      setCaptionData((prev) => ({
        ...prev,
        edit_id: video.edit_id || "",
      }));
    });
  };

  // 🔹 Handle submit
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

//   if (!captionData.text || !captionData.start_time || !captionData.end_time) {
//     toast({
//       title: "Please fill all required caption fields",
//       status: "warning",
//       duration: 2000,
//       isClosable: true,
//     });
//     return;
//   }

  // ✅ Build the payload in the expected API format
  const payload = {
    edit_id: selectedVideo.edit_id || captionData.edit_id,
    segment_number:
      selectedVideo.segments_info?.segment_number ||
      captionData.segment_number ||
      1,
    captions: [
      {
        text: captionData.text,
        start_time: Number(captionData.start_time),
        end_time: Number(captionData.end_time),
        font_size: Number(captionData.font_size),
        font_color: captionData.font_color,
        background_color: captionData.background_color,
        background_opacity: Number(captionData.background_opacity),
        x: captionData.x,
        y: captionData.y,
        animation: captionData.animation,
        animation_speed: captionData.animation_speed,
      },
    ],
  };

  try {
    const res = await axiosInstance.post(`/factory_add_segment_captions/`, payload);

    if (res.data?.success || res.data?.status === "success") {
      toast({
        title: "Caption segment submitted successfully!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Optionally clear the form
      setCaptionData({
        edit_id: selectedVideo.edit_id || "",
        segment_number: captionData.segment_number || 1,
        text: "",
        start_time: "",
        end_time: "",
        font_size: "",
        font_color: "#FFFFFF",
        background_color: "#000000",
        background_opacity: 1,
        x: "",
        y: "",
        animation: "",
        animation_speed: "",
      });
    } else {
      throw new Error(res.data?.message || "API response error");
    }
  } catch (err) {
    console.error("❌ Error submitting caption segment:", err);
    toast({
      title: "Failed to submit caption segment",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
  }
};


  // 🔹 Video Card Component
  const VideoCard = ({ video, isSelected, onSelect }) => (
    <Box
      bg={panelBg}
      border="2px solid"
      borderColor={isSelected ? "blue.400" : borderColor}
      borderRadius="xl"
      boxShadow={isSelected ? "0 0 20px rgba(66,153,225,0.5)" : "sm"}
      overflow="hidden"
      transition="all 0.3s ease"
      transform={isSelected ? "scale(0.97)" : "scale(1)"}
      _hover={{
        transform: "scale(0.99)",
        bg: hoverBg,
      }}
      onClick={() => onSelect(video)}
      cursor="pointer"
    >
      {video.final_video_url ? (
        <video
          src={video.final_video_url}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
          }}
          controls
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
          {video.project_name || "Unnamed Project"}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Total Segments: {video.total_segments_created || 0}
        </Text>
      </Box>
    </Box>
  );

  return (
    <Flex direction="column" h="100%" w="100%" p={4} gap={4}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          Captioned Edit
        </Text>
        <Button colorScheme="blue" size="sm" onClick={handleSubmit}>
          Submit Captions
        </Button>
      </Flex>

      {/* Content */}
      {loading ? (
        <Flex align="center" justify="center" flex="1">
          <Spinner size="lg" />
        </Flex>
      ) : videos.length === 0 ? (
        <Flex align="center" justify="center" flex="1">
          <Text>No videos found.</Text>
        </Flex>
      ) : (
        <Box
          flex="1"
          overflowY="auto"
          sx={{
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-thumb": {
              background: "#A0AEC0",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#718096",
            },
          }}
        >
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 2, lg: 3 }}
            spacing={6}
            w="100%"
          >
            {videos.map((video) => (
              <VideoCard
                key={video.final_video_url}
                video={video}
                isSelected={selectedVideo?.final_video_url === video.final_video_url}
                onSelect={handleSelect}
              />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Flex>
  );
}
