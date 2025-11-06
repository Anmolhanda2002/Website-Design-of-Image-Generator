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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { MdPlayCircle } from "react-icons/md";

export default function CaptionedEdit({ selectedUser, MergeData, setMergeData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [mergedVideo, setMergedVideo] = useState(null);

  const toast = useToast();
  const intervalRef = useRef(null);

  // ✅ Modal for playing videos
  const videoPlayer = useDisclosure();
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const activeBorderColor = "blue.400";

  // ✅ CLEAR polling when unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ FETCH VIDEOS
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectedUser.user_id },
        });

        const success = res.data?.success;
        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        setVideos(success ? data : []);
      } catch (e) {
        toast({
          title: "Failed to load videos",
          status: "error",
          duration: 2500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedUser]);

  // ✅ SELECT VIDEO
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setMergeStatus(null);

    setMergeData((prev) => ({
      ...prev,
      user_id: selectedUser?.user_id,
      hygaar_key: video.hygaar_key,
      edit_id: video.edit_id,
    }));
  };

  // ✅ MERGE SUBMIT
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

      // ✅ Show backend success message
      toast({
        title: res.data?.message || "Merge request submitted",
        status: "success",
        duration: 2500,
      });

      const jobId = res.data?.data?.job_id;
      if (!jobId) throw new Error("Job ID missing");

      startPolling(jobId);

    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Merge failed";

      toast({
        title: "Merge failed",
        description: backendMessage,
        status: "error",
        duration: 3000,
      });

    } finally {
      setSubmitting(false);
    }
  };

  // ✅ POLLING
const startPolling = (jobId) => {
  if (intervalRef.current) clearInterval(intervalRef.current);

  setPolling(true);
  setMergeStatus("submitted");

  intervalRef.current = setInterval(async () => {
    try {
      const res = await axiosInstance.get(
        `/get_video_merge_job_status/?job_id=${jobId}`
      );

      const job = res.data?.data;
      const status = job?.status?.toLowerCase() || "unknown";

      setMergeStatus(status);

      // ✅ STOP on COMPLETED
      if (status === "completed") {
        clearInterval(intervalRef.current);
        setPolling(false);

        const finalUrl =
          job.final_resize_video_url ||
          job.final_video_with_music_url ||
          job.final_video_url;

        setMergedVideo(finalUrl);
        setPlayingVideoUrl(finalUrl);
        videoPlayer.onOpen();
        return;
      }

      // ✅ STOP on FAILED or ERROR
      if (
        status === "failed" ||
        status === "error" ||
        status === "cancelled" ||
        status === "stopped"
      ) {
        clearInterval(intervalRef.current);
        setPolling(false);

        toast({
          title: "Merge Failed",
          description: job?.message || "The merge job failed. Try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

    } catch (err) {
      console.log("Polling failed", err);

      clearInterval(intervalRef.current);
      setPolling(false);

      toast({
        title: "Polling Error",
        description: "Something went wrong while checking job status.",
        status: "error",
      });
    }
  }, 7000);
};


  // ✅ Single Video Card
  const VideoCard = ({ video, isSelected }) => {
    const preview =
      video.captioned_final_video_url ||
      video.final_video_url ||
      video.final_resize_video_url;

    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="lg"
        overflow="hidden"
        cursor="pointer"
        onClick={() => handleSelect(video)}
        transition="0.2s"
        _hover={{ borderColor: "blue.300" }}
      >
        <Box h="210px" w="100%" position="relative" bg="black">
          {preview ? (
            <video
              src={preview}
              muted
              autoPlay
              loop
              style={{ width: "100%", height: "210px", objectFit: "cover" }}
              onClick={(e) => {
                e.stopPropagation();
                setPlayingVideoUrl(preview);
                videoPlayer.onOpen();
              }}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text color="gray.400">No Preview</Text>
            </Flex>
          )}

          {/* play button */}
          <Box
            position="absolute"
            bottom="12px"
            right="12px"
            bg="rgba(0,0,0,0.6)"
            p={2}
            borderRadius="full"
            onClick={(e) => {
              e.stopPropagation();
              setPlayingVideoUrl(preview);
              videoPlayer.onOpen();
            }}
          >
            <MdPlayCircle size={30} color="white" />
          </Box>
        </Box>

        <Box p={3} w="100%">
          <Text fontWeight="bold" noOfLines={1}>
            {video.project_name}
          </Text>
          <Text color="gray.500" fontSize="sm">
            {video.edit_id}
          </Text>
        </Box>
      </VStack>
    );
  };

  // ✅ Video Modal
  const VideoPlayerModal = () => (
    <Modal isOpen={videoPlayer.isOpen} onClose={videoPlayer.onClose} size="5xl">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalCloseButton color="white" />
        <ModalBody p={0}>
          {playingVideoUrl && (
            <video
              src={playingVideoUrl}
              controls
              autoPlay
              style={{ width: "100%", height: "500px", objectFit: "contain" }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  return (
    <Flex direction="column" w="100%" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Videos
        </Text>

        <Button
          colorScheme="blue"
          isLoading={submitting}
          onClick={handleMergeSubmit}
          isDisabled={!selectedVideo || polling}
        >
          Start Merge
        </Button>
      </Flex>

      {/* Loader */}
      {loading ? (
        <Flex h="65vh" justify="center" align="center">
          <Spinner size="xl" />
        </Flex>
      ) : videos.length === 0 ? (
        // ✅ EMPTY VIEW
        <Flex
          h="65vh"
          justify="center"
          align="center"
          direction="column"
          w="100%"
        >
          <Text fontSize="xl" fontWeight="bold" color="gray.500">
            No videos found
          </Text>
          <Text color="gray.400">This user has no captioned videos.</Text>
        </Flex>
      ) : polling ? (
        // ✅ Polling View
        <Flex h="65vh" justify="center" align="center" direction="column">
          <Spinner size="xl" />
          <Text mt={3}>Status: {mergeStatus}</Text>
        </Flex>
      ) : (
        // ✅ Video Grid
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={6} w="100%">
          {videos.map((video) => (
            <VideoCard
              key={video.edit_id}
              video={video}
              isSelected={selectedVideo?.edit_id === video.edit_id}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Player Modal */}
      <VideoPlayerModal />
    </Flex>
  );
}
