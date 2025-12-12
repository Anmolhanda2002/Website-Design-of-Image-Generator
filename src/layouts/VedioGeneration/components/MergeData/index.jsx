import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import VideoGrid from "./VideoGrid";
import MergedVideoPanel from "./MergedVideoPanel";
import VideoPlayerModal from "./VideoPlayerModal";
import LoadingOverlay from "./LoadingOverlay";

export default function CaptionedEdit({ selectedUser, MergeData, setMergeData }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [mergedVideo, setMergedVideo] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  const toast = useToast();
  const intervalRef = useRef(null);

  const panelBg = useColorModeValue("white", "gray.800");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 9;
  const totalPages = Math.ceil(videos.length / videosPerPage);

  // Fetch videos
  useEffect(() => {
    if (!selectedUser?.user_id) return;

    setLoading(true);
    axiosInstance
      .get("/get_edited_videos_by_user/", { params: { user_id: selectedUser.user_id } })
      .then((res) => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setVideos(res.data?.success ? data : []);
      })
      .catch(() => {
        toast({ title: "Failed to load videos", status: "error", duration: 2500 });
      })
      .finally(() => setLoading(false));
  }, [selectedUser]);

  // Cleanup polling
  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  // Select a video
  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setMergedVideo(null);
    setMergeStatus(null);

    setMergeData((prev) => ({
      ...prev,
      user_id: selectedUser?.user_id,
      edit_id: video.edit_id,
    }));
  };

  // Merge API
  const handleMergeSubmit = async () => {
    if (!selectedVideo) {
      toast({ title: "Select a video first", status: "warning" });
      return;
    }

    try {
      setPolling(true);
      setMergeStatus("submitted");

      const res = await axiosInstance.post("/merged_video/", {
        user_id: selectedUser.user_id,
        edit_id: selectedVideo.edit_id,
        brand_outro_video_url: MergeData.brand_outro_video_url || "",
        outro_video_url: MergeData.outro_video_url || "",
      });

      const jobId = res.data?.data?.job_id;
      if (!jobId) throw new Error("Job ID missing");

      toast({
        title: res.data?.message || "Merge started",
        status: "success",
        duration: 2500,
      });

      setMergeData((prev) => ({ ...prev, merge_id: jobId }));

      startPolling(jobId);
    } catch (err) {
      setPolling(false);
      toast({
        title: "Merge failed",
        description: err.response?.data?.message || err.message || "Merge API failed",
        status: "error",
      });
    }
  };

  // Poll merge status
  const startPolling = (jobId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/get_video_merge_job_status/?job_id=${jobId}`);
        const status = res.data?.data?.status?.toLowerCase() || "unknown";
        setMergeStatus(status);

        if (status === "completed") {
          clearInterval(intervalRef.current);
          setPolling(false);

          const finalUrl =
            res.data?.data?.final_resize_video_url ||
            res.data?.data?.final_video_with_music_url ||
            res.data?.data?.final_video_url;

          setMergedVideo(finalUrl);
        }

        if (["failed", "error", "cancelled", "stopped"].includes(status)) {
          clearInterval(intervalRef.current);
          setPolling(false);
          toast({
            title: "Merge failed",
            description: res.data?.data?.message || "The merge job failed.",
            status: "error",
          });
        }
      } catch {
        clearInterval(intervalRef.current);
        setPolling(false);
        toast({ title: "Polling Error", description: "Failed to check merge status", status: "error" });
      }
    }, 5000);
  };

  return (
    <Flex direction="column" w="100%" p={6} h="100vh">
      <Flex justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">Captioned Videos</Text>
        <Button colorScheme="blue" onClick={handleMergeSubmit} isDisabled={polling || !selectedVideo}>
          Merge Video
        </Button>
      </Flex>

      <Box mt={4} flex="1">
        <LoadingOverlay loading={loading || polling} status={mergeStatus} />

        {mergedVideo ? (
          <MergedVideoPanel mergedVideo={mergedVideo} onBack={() => setMergedVideo(null)} />
        ) : (
          <VideoGrid
            videos={videos}
            currentPage={currentPage}
            videosPerPage={videosPerPage}
            totalPages={totalPages}
            onSelect={handleSelectVideo}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Box>

      <VideoPlayerModal />
    </Flex>
  );
}
