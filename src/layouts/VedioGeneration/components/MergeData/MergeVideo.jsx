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
  Input,
  HStack,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

export default function CaptionedEdit({ selectedUser, MergeData, setMergeData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [mergedVideo, setMergedVideo] = useState(null);
  const [resizing, setResizing] = useState(false);
  const [resizedVideo, setResizedVideo] = useState(null);
  const [resizeInputs, setResizeInputs] = useState({ height: "", width: "" });

  const toast = useToast();
  const intervalRef = useRef(null);
  const videoPlayer = useDisclosure();
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const activeBorderColor = "blue.400";

  // ✅ cleanup interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ fetch videos
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectedUser.user_id },
        });
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setVideos(res.data?.success ? data : []);
      } catch {
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

  // ✅ select a video
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setResizedVideo(null);
    setMergeStatus(null);

    setMergeData((prev) => ({
      ...prev,
      user_id: selectedUser?.user_id,
      edit_id: video.edit_id,
    }));
  };

  // ✅ start merge
  const handleMergeSubmit = async () => {
    if (!selectedVideo) {
      toast({ title: "Select a video first", status: "warning" });
      return;
    }

    try {
      setSubmitting(true);

      const res = await axiosInstance.post("/merged_video/", {
        user_id: selectedUser.user_id,
        edit_id: selectedVideo.edit_id,
        brand_outro_video_url: MergeData.brand_outro_video_url || "",
        outro_video_url: MergeData.brand_outro_video_url || "",
      });

      const jobId = res.data?.data?.job_id;
      if (!jobId) throw new Error("Job ID missing");

      toast({
        title: res.data?.message || "Merge request submitted",
        status: "success",
        duration: 2500,
      });

      setMergeData((prev) => ({
        ...prev,
        mearg_id: jobId,
      }));

      startPolling(jobId);
    } catch (err) {
      toast({
        title: "Merge failed",
        description:
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Merge failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ poll merge status
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
        }

        if (["failed", "error", "cancelled", "stopped"].includes(status)) {
          clearInterval(intervalRef.current);
          setPolling(false);
          toast({
            title: "Merge Failed",
            description: job?.message || "The merge job failed.",
            status: "error",
          });
        }
      } catch {
        clearInterval(intervalRef.current);
        setPolling(false);
        toast({
          title: "Polling Error",
          description: "Error while checking job status.",
          status: "error",
        });
      }
    }, 7000);
  };

  // ✅ handle resize (manual trigger)
  const handleResize = async () => {
    if (!resizeInputs.height || !resizeInputs.width) {
      toast({
        title: "Enter height and width",
        status: "warning",
      });
      return;
    }

    try {
      setResizing(true);

      const payload = {
        height: resizeInputs.height,
        width: resizeInputs.width,
        user_id: selectedUser?.user_id,
      };

      const res = await axiosInstance.post("/merge_resizer/", payload);

      if (res.data?.status === "success") {
        toast({
          title: res.data?.message || "Video resized successfully",
          status: "success",
        });

        const finalResizedUrl =
          res.data.final_video_url || res.data.result || null;

        if (finalResizedUrl) {
          setResizedVideo(finalResizedUrl);
          setPlayingVideoUrl(finalResizedUrl);
          videoPlayer.onOpen();
        }
      } else {
        throw new Error(res.data?.message || "Resize failed");
      }
    } catch (err) {
      toast({
        title: "Resize Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Resize process failed.",
        status: "error",
      });
    } finally {
      setResizing(false);
    }
  };

  // ✅ video modal
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
              style={{
                width: "100%",
                height: "500px",
                objectFit: "contain",
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );

  // ✅ reusable video card
  const VideoCard = ({ title, url, buttonLabel, dimensions }) => (
    <VStack
      bg={panelBg}
      border="2px solid"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      p={3}
      w="100%"
    >
      <Text fontWeight="bold">{title}</Text>
      <video
        src={url}
        controls
        style={{ width: "100%", height: "240px", objectFit: "cover" }}
      />
      {dimensions && (
        <Text color="gray.500" fontSize="sm">
          {dimensions}
        </Text>
      )}
      <Button
        mt={2}
        colorScheme="blue"
        onClick={() => {
          setPlayingVideoUrl(url);
          videoPlayer.onOpen();
        }}
      >
        {buttonLabel}
      </Button>
    </VStack>
  );

  return (
    <Flex direction="column" w="100%" p={6} h="100vh" mb={10}>
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Videos
        </Text>

        <Button
          colorScheme="blue"
          isLoading={submitting}
          onClick={handleMergeSubmit}
          isDisabled={ polling}
        >
          Start Merge
        </Button>
      </Flex>

      <Box mt={4} flex="1" mb={10} pr={2}>
        {loading ? (
          <Flex h="65vh" justify="center" align="center">
            <Spinner size="xl" />
          </Flex>
        ) : polling ? (
          <Flex h="65vh" justify="center" align="center" direction="column">
            <Spinner size="xl" />
            <Text mt={3}>Merging... ({mergeStatus})</Text>
          </Flex>
        ) : resizing ? (
          <Flex h="65vh" justify="center" align="center" direction="column">
            <Spinner size="xl" />
            <Text mt={3}>Resizing...</Text>
          </Flex>
        ) : resizedVideo ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={4}>
            <VideoCard
              title="Merged Video"
              url={mergedVideo}
              buttonLabel="Play Merged Video"
            />
            <VideoCard
              title="Resized Video"
              url={resizedVideo}
              buttonLabel={`Play Resized (${resizeInputs.width}×${resizeInputs.height})`}
              dimensions={`${resizeInputs.width} × ${resizeInputs.height}`}
            />
          </SimpleGrid>
        ) : mergedVideo ? (
          <VStack mt={4} spacing={4}>
            <VideoCard
              title="Merged Video"
              url={mergedVideo}
              buttonLabel="Play Merged Video"
            />
            <HStack spacing={3}>
              <Input
                placeholder="Height"
                value={resizeInputs.height}
                onChange={(e) =>
                  setResizeInputs({ ...resizeInputs, height: e.target.value })
                }
                w="120px"
              />
              <Input
                placeholder="Width"
                value={resizeInputs.width}
                onChange={(e) =>
                  setResizeInputs({ ...resizeInputs, width: e.target.value })
                }
                w="120px"
              />
          
            </HStack>
          </VStack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
            {videos.map((video) => (
              <VStack
                key={video.edit_id}
                bg={panelBg}
                border="2px solid"
                borderColor={
                  selectedVideo?.edit_id === video.edit_id
                    ? activeBorderColor
                    : borderColor
                }
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                onClick={() => handleSelect(video)}
              >
                <Box h="210px" w="100%" bg="black">
                  <video
                    src={
                      video.captioned_final_video_url ||
                      video.final_video_url ||
                      video.final_resize_video_url
                    }
                    muted
                    autoPlay
                    loop
                    style={{ width: "100%", height: "210px", objectFit: "cover" }}
                  />
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
            ))}
          </SimpleGrid>
        )}
      </Box>

      <VideoPlayerModal />
    </Flex>
  );
}
