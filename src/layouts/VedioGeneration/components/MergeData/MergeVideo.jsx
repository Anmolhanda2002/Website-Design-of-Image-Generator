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
  VStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdPlayCircle, MdCheckCircle } from "react-icons/md";

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

  // ✅ Modal for Video Playback
  const videoPlayer = useDisclosure();
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue(
    "0 0 10px rgba(66,153,225,0.7)",
    "0 0 10px rgba(66,153,225,0.9)"
  );

  // ---------------- STOP POLLING ----------------
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ---------------- FETCH VIDEOS ----------------
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectedUser.user_id },
        });

        const success = res.data?.success ?? false;
        const videos = Array.isArray(res.data?.data) ? res.data.data : [];

        if (success && videos.length > 0) {
          setVideos(videos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        toast({
          title: "Failed to load videos",
          status: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedUser]);

  // ---------------- SELECT VIDEO ----------------
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setMergeStatus(null);

    setMergeData((prev) => ({
      ...prev,
      user_id: selectedUser?.user_id,
      edit_id: video.edit_id,
      hygaar_key: video.hygaar_key,
    }));
  };

  // ---------------- MERGE SUBMIT ----------------
  const handleMergeSubmit = async () => {
    if (!selectedVideo) {
      toast({
        title: "Select a video first",
        status: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post("/merged_video/", {
        user_id: selectedUser.user_id,
        hygaar_key: selectedVideo.hygaar_key,
        edit_id: selectedVideo.edit_id,
        brand_outro_video_url: MergeData.brand_outro_video_url || "",
        outro_video_url: MergeData.brand_outro_video_url || "",
      });

      const jobId = res.data?.data?.job_id;
      if (!jobId) throw new Error("Job failed");

      startPolling(jobId);
    } catch (err) {
      toast({ title: "Merge failed", status: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- POLLING ----------------
  const startPolling = (jobId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setPolling(true);
    setMergeStatus("submitted");

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/get_video_merge_job_status/?job_id=${jobId}`);
        const job = res.data?.data;

        setMergeStatus(job.status);

        if (job.status === "completed") {
          clearInterval(intervalRef.current);
          setPolling(false);

          const finalUrl =
            job.final_resize_video_url ||
            job.final_video_with_music_url ||
            job.final_video_url;

          setMergedVideo(finalUrl);
          videoPlayer.onOpen();
          setPlayingVideoUrl(finalUrl);
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 8000);
  };

  // ---------------- VIDEO CARD ----------------
  const VideoCard = ({ video, isSelected }) => {
    const previewUrl =
      video.captioned_final_video_url ||
      video.final_video_url ||
      video.final_resize_video_url;

    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={isSelected ? activeShadow : "sm"}
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleSelect(video)}
      >
        <Flex
          h="200px"
          align="center"
          justify="center"
          bg="black"
          position="relative"
          w="100%"
        >
          {previewUrl ? (
            <video
              src={previewUrl}
              muted
              autoPlay
              loop
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
              onClick={(e) => {
                e.stopPropagation();
                setPlayingVideoUrl(previewUrl);
                videoPlayer.onOpen();
              }}
            />
          ) : (
            <Text color="gray.500">No Preview</Text>
          )}

          {/* Play button on hover */}
          <Box
            position="absolute"
            bottom="10px"
            right="10px"
            bg="rgba(0,0,0,0.6)"
            p={2}
            borderRadius="full"
            cursor="pointer"
            onClick={(e) => {
              e.stopPropagation();
              setPlayingVideoUrl(previewUrl);
              videoPlayer.onOpen();
            }}
          >
            <MdPlayCircle color="white" size={28} />
          </Box>
        </Flex>

        <Box p={3} w="100%">
          <Text fontWeight="bold" noOfLines={1}>
            {video.project_name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            ID: {video.edit_id}
          </Text>
        </Box>
      </VStack>
    );
  };

  // ---------------- VIDEO PLAYER MODAL ----------------
  const VideoPlayerModal = () => (
    <Modal isOpen={videoPlayer.isOpen} onClose={videoPlayer.onClose} size="4xl">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalCloseButton color="white" />
        <ModalBody p={0}>
          {playingVideoUrl && (
            <video
              src={playingVideoUrl}
              controls
              autoPlay
              style={{ width: "100%", height: "200px", borderRadius: "8px" }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  // ---------------- UI ----------------
  return (
    <Flex direction="column" p={6} bg={pageBg}>
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Videos
        </Text>

        <Button
          colorScheme="blue"
          onClick={handleMergeSubmit}
          isDisabled={!selectedVideo || polling}
        >
          Start Merge
        </Button>
      </Flex>

      {polling ? (
        <VStack minH="70vh" justify="center">
          <Spinner size="xl" />
          <Text>Status: {mergeStatus}</Text>
        </VStack>
      ) : loading ? (
        <Flex justify="center" h="60vh">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} mt={6}>
          {videos.map((video) => (
            <VideoCard
              key={video.edit_id}
              video={video}
              isSelected={selectedVideo?.edit_id === video.edit_id}
            />
          ))}
        </SimpleGrid>
      )}

      {/* ✅ VIDEO PLAYER MODAL */}
      <VideoPlayerModal />
    </Flex>
  );
}
