import React, { useEffect, useState, startTransition } from "react";
import {
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdSend } from "react-icons/md";
import VideoCard from "./VideoCard";
import ResultView from "./ResultView";

export default function CaptionedEdit({ selectedUser, captionData, setCaptionData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [resultVideo, setResultVideo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;

  const toast = useToast();

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
          toast({ title: "Error loading videos", status: "error" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    return () => controller.abort();
  }, [selectedUser?.user_id]);

  // ---------------------- VIDEO SELECTION ----------------------
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
      toast({ title: "Select a video first", status: "warning" });
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
        toast({ title: "Caption added!", status: "success" });

        setResultVideo({
          captioned_segment_url,
          edit_id,
          segment_number,
          project_name: selectedVideo.project_name || "Captioned Video",
        });

        // ✅ Keep videos intact
        setSelectedVideo(null); // only reset selected video
      }
    } catch (err) {
      toast({ title: "Caption failed", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------- PAGINATION ----------------------
  const indexOfLast = currentPage * videosPerPage;
  const indexOfFirst = indexOfLast - videosPerPage;
  const currentVideos = videos.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(videos.length / videosPerPage);
  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // ---------------------- RENDER ----------------------
  if (resultVideo) {
    return <ResultView resultVideo={resultVideo} onBack={() => setResultVideo(null)} />;
  }

  return (
    <Flex direction="column" p={4} gap={4}>
      {/* HEADER */}
      <Flex justify="space-between" align="center">
        <VStack align="flex-start" spacing={0}>
          <Text fontSize="xl" fontWeight="bold">Captioned Segment</Text>
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
        <Flex align="center" justify="center" flex="1" mt={10}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : videos.length === 0 ? (
        <Flex align="center" justify="center" flex="1" mt={10}>
          <Text>No videos found.</Text>
        </Flex>
      ) : (
        <>
          {/* VIDEO GRID */}
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
            {currentVideos.map((video) => (
              <VideoCard
                key={video.edit_id}
                video={video}
                isSelected={selectedVideo?.edit_id === video.edit_id}
                onSelect={handleSelect}
              />
            ))}
          </SimpleGrid>

          {/* PAGINATION */}
          <Flex justify="center" align="center" mt={4} gap={3}>
            <Button onClick={prevPage} isDisabled={currentPage === 1}>
              Previous
            </Button>
            <Text fontWeight="bold">{currentPage} / {totalPages}</Text>
            <Button onClick={nextPage} isDisabled={currentPage === totalPages}>
              Next
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
}
