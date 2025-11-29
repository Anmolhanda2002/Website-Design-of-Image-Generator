import React, { useEffect, useState, startTransition } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  VStack,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdSend, MdReplay, MdArrowBack } from "react-icons/md";

export default function CaptionedEdit({ selectedUser, captionData, setCaptionData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [resultVideo, setResultVideo] = useState(null);

  // 👉 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;

  const toast = useToast();
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const color = useColorModeValue("#A0AEC0", "#4A5568");

  // ---------------------- FETCH VIDEOS ----------------------
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
          startTransition(() => {
            setVideos(res.data.data);
            setCurrentPage(1);
          });
        } else {
          startTransition(() => setVideos([]));
        }
      } catch (err) {
        if (err.name !== "CanceledError") {
          toast({
            title: "Error loading videos",
            status: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    return () => controller.abort();
  }, [selectedUser?.user_id]);

  // ---------------------- SELECT VIDEO ----------------------
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setCaptionData((prev) => ({
      ...prev,
      edit_id: video.edit_id || "",
      segment_number: video.total_segments_created || 1,
    }));
  };

  // ---------------------- SUBMIT CAPTION ----------------------
  const handleSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Select a video first",
        status: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      edit_id: selectedVideo.edit_id,
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
          title: "Caption added!",
          status: "success",
        });

        // Show Result View
        setResultVideo({
          captioned_segment_url,
          edit_id,
          segment_number,
          project_name: selectedVideo.project_name || "Captioned Video",
        });

        setVideos([]);
        setSelectedVideo(null);
      }
    } catch (err) {
      toast({
        title: "Caption failed",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------- PAGINATION LOGIC ----------------------
  const indexOfLast = currentPage * videosPerPage;
  const indexOfFirst = indexOfLast - videosPerPage;
  const currentVideos = videos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(videos.length / videosPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // ---------------------- RESULT VIDEO VIEW ----------------------
  if (resultVideo) {
    return (
    <Flex direction="column" align="center" justify="center" h="100%" p={6}>
  <Box
    bg={panelBg}
    p={5}
    borderRadius="xl"
    boxShadow="lg"
    maxW="700px"
    w="100%"
    textAlign="center"
    position="relative"   // 👈 needed for correct absolute position
  >
    {/* 🔙 BACK BUTTON (Perfect Position) */}
    <IconButton
      icon={<MdArrowBack size={22} />}
      colorScheme="gray"
      variant="solid"
      borderRadius="full"
      size="sm"
        onClick={() => {
            setResultVideo(null);     // ← Go back
            setSelectedVideo(null);   // ← Clear selection (optional)
          }}
      position="absolute"
      top="12px"
      left="12px"
      bg="white"
      _hover={{ bg: "gray.200" }}
      boxShadow="md"
    />

    <Text fontSize="2xl" fontWeight="bold" mb={4} mt={4}>
      🎉 Captioned Segment Ready!
    </Text>

    <video
      src={resultVideo.captioned_segment_url}
      controls
      autoPlay
      style={{
        width: "100%",
        borderRadius: "12px",
        maxHeight: "300px",
        marginBottom: "16px",
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

  // ---------------------- DEFAULT LIST VIEW ----------------------
  return (
    <Flex direction="column" h="100vh" w="100%"  p={4} gap={4} overflowY="auto">
      {/* HEADER */}
      <Flex justify="space-between" align="center">
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xl" fontWeight="bold">Captioned Edit</Text>
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
          leftIcon={<MdSend size={18} />}
        >
          Submit Captions
        </Button>
      </Flex>

      {/* LOADING */}
      {loading ? (
        <Flex align="center" justify="center" flex="1">
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : videos.length === 0 ? (
        <Flex align="center" justify="center" flex="1">
          <Text>No videos found.</Text>
        </Flex>
      ) : (
        <>
          {/* VIDEO GRID */}
          <Box flex="1" overflowY="auto" h="100%">
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
              {currentVideos.map((video) => {
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
                    cursor="pointer"
                    onClick={() => handleSelect(video)}
                  >
                    {videoSrc ? (
                      <video
                        src={videoSrc}
                        controls
                        muted
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    ) : (
                      <Box w="100%" h="200px" bg="gray.100" display="flex" justifyContent="center" alignItems="center">
                        <Text>No Video</Text>
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

          {/* PAGINATION */}
          <Flex justify="center" align="center" mt={4} gap={3}>
            <Button onClick={prevPage} isDisabled={currentPage === 1}>
              Previous
            </Button>

            <Text fontWeight="bold">
              {currentPage} / {totalPages}
            </Text>

            <Button onClick={nextPage} isDisabled={currentPage === totalPages}>
              Next
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
}
