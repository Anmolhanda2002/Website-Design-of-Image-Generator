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

  // ✅ For Resize Info
  const [resizeInfo, setResizeInfo] = useState(null);
  const resizeInfoModal = useDisclosure();

  const toast = useToast();
  const intervalRef = useRef(null);

  // ✅ Video Player Modal
  const videoPlayer = useDisclosure();
  const [playingVideoUrl, setPlayingVideoUrl] = useState(null);

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // ✅ Cleanup polling
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ Fetch videos
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectedUser.user_id },
        });

        setVideos(res.data?.success ? res.data?.data || [] : []);
      } catch (e) {
        toast({ title: "Failed to load videos", status: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedUser]);

  // ✅ Select Video
  const handleSelect = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setMergeStatus(null);
    setResizeInfo(null);

    setMergeData((p) => ({
      ...p,
      user_id: selectedUser.user_id,
      hygaar_key: video.hygaar_key,
      edit_id: video.edit_id,
    }));
  };

  // ✅ Merge Button
  const handleMergeSubmit = async () => {
    if (!selectedVideo) {
      toast({ title: "Select a video first", status: "warning" });
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
      if (!jobId) throw new Error("Missing job id");

      toast({ title: "Merge Started", status: "success" });

      startPolling(jobId);
    } catch (e) {
      toast({
        title: "Merge Failed",
        description: e.response?.data?.message || "Error",
        status: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Polling (Merge)
  const startPolling = (jobId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    setPolling(true);
    setMergeStatus("submitted");

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/get_video_merge_job_status/?job_id=${jobId}`);
        const job = res.data?.data;

        const status = job?.status?.toLowerCase();
        setMergeStatus(status);

        // ✅ COMPLETED
        if (status === "completed") {
          clearInterval(intervalRef.current);
          setPolling(false);

          const finalUrl =
            job.final_resize_video_url ||
            job.final_video_with_music_url ||
            job.final_video_url;

          setMergedVideo(finalUrl);

          // ✅ IF CUSTOM RESIZE is ON — Call Resizer API
          if (MergeData.custom_resize && MergeData.height && MergeData.width) {
            callResizeAPI(jobId);
          } else {
            setPlayingVideoUrl(finalUrl);
            videoPlayer.onOpen();
          }
        }

        // ✅ FAILED STATES
        if (["failed", "error", "cancelled"].includes(status)) {
          clearInterval(intervalRef.current);
          setPolling(false);
          toast({
            title: "Merge Failed",
            description: job?.message || "Something went wrong",
            status: "error",
          });
        }
      } catch (e) {
        clearInterval(intervalRef.current);
        toast({
          title: "Polling Error",
          status: "error",
        });
      }
    }, 6000);
  };

  // ✅ Call Resize API
  const callResizeAPI = async (mergeId) => {
    try {
      const res = await axiosInstance.post("/merge_resizer/", {
        
        mearg_id: mergeId,
        height: Number(MergeData.height),
        width: Number(MergeData.width),
      });

      setResizeInfo(res.data?.data || {});
      toast({ title: "Resize Completed", status: "success" });

      resizeInfoModal.onOpen();
    } catch (e) {
      toast({
        title: "Resize Failed",
        description: e.response?.data?.message || "Error",
        status: "error",
      });
    }
  };

  // ✅ Video Card
  const VideoCard = ({ video }) => {
    const preview =
      video.captioned_final_video_url ||
      video.final_video_url ||
      video.final_resize_video_url;

    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={selectedVideo?.edit_id === video.edit_id ? "blue.400" : borderColor}
        borderRadius="lg"
        onClick={() => handleSelect(video)}
        cursor="pointer"
        spacing={0}
      >
        <Box h="200px" w="100%" position="relative">
          {preview ? (
            <video
              src={preview}
              muted
              autoPlay
              loop
              style={{ height: "100%", width: "100%", objectFit: "cover" }}
            />
          ) : (
            <Flex h="100%" align="center" justify="center">
              <Text>No Preview</Text>
            </Flex>
          )}

          <Box
            position="absolute"
            bottom="10px"
            right="10px"
            onClick={(e) => {
              e.stopPropagation();
              setPlayingVideoUrl(preview);
              videoPlayer.onOpen();
            }}
          >
            <MdPlayCircle size={32} color="white" />
          </Box>
        </Box>

        <Box p={2} w="100%">
          <Text fontWeight="bold">{video.project_name}</Text>
          <Text fontSize="sm" color="gray.500">
            {video.edit_id}
          </Text>
        </Box>
      </VStack>
    );
  };

  return (
    <Flex direction="column" w="100%" p={5} h="100vh">
      {/* ✅ Header */}
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Captioned Videos
        </Text>

        <Flex gap={3}>
          {/* ✅ Resize Info Button */}
          {resizeInfo && (
            <Button colorScheme="green" onClick={resizeInfoModal.onOpen}>
              View Resize Info
            </Button>
          )}

          <Button
            colorScheme="blue"
            isLoading={submitting}
            onClick={handleMergeSubmit}
            isDisabled={!selectedVideo || polling}
          >
            Start Merge
          </Button>
        </Flex>
      </Flex>

      {/* ✅ Scrollable Area */}
      <Box flex="1" mt={4} overflowY="auto"
        sx={{ "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}
      >
        {loading ? (
          <Flex h="70vh" justify="center" align="center">
            <Spinner size="xl" />
          </Flex>
        ) : videos.length === 0 ? (
          <Flex h="70vh" justify="center" align="center" direction="column">
            <Text fontSize="xl">No Videos Found</Text>
          </Flex>
        ) : polling ? (
          <Flex h="70vh" justify="center" align="center" direction="column">
            <Spinner size="xl" />
            <Text mt={3}>Status: {mergeStatus}</Text>
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
            {videos.map((v) => (
              <VideoCard key={v.edit_id} video={v} />
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* ✅ Video Modal */}
      <Modal isOpen={videoPlayer.isOpen} onClose={videoPlayer.onClose} size="5xl">
        <ModalOverlay />
        <ModalContent bg="black">
          <ModalCloseButton color="white" />
          <ModalBody p={0}>
            {playingVideoUrl && (
              <video src={playingVideoUrl} controls autoPlay style={{ width: "100%" }} />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* ✅ Resize Info Modal */}
      <Modal isOpen={resizeInfoModal.isOpen} onClose={resizeInfoModal.onClose}>
        <ModalOverlay />
        <ModalContent p={5}>
          <ModalCloseButton />

          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Resize Information
          </Text>

          {resizeInfo ? (
            <Box>
              <Text><b>Merge ID:</b> {resizeInfo.mearg_id}</Text>
              <Text><b>Width:</b> {resizeInfo.width}</Text>
              <Text><b>Height:</b> {resizeInfo.height}</Text>

              {resizeInfo?.final_video_url && (
                <Button
                  mt={4}
                  colorScheme="blue"
                  onClick={() => {
                    setPlayingVideoUrl(resizeInfo.final_video_url);
                    videoPlayer.onOpen();
                  }}
                >
                  Play Resized Video
                </Button>
              )}
            </Box>
          ) : (
            <Text>No resize info found</Text>
          )}
        </ModalContent>
      </Modal>
    </Flex>
  );
}
