import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Button, useToast, Select, useColorModeValue } from "@chakra-ui/react";
import VideoGrid from "./VideoGrid";
import ProcessingView from "./ProcessingView";
import axiosInstance from "utils/AxiosInstance";
import { MdPlayCircle } from "react-icons/md";
import { useColorMode } from "@chakra-ui/react";

const transitionOptions = [
  "none","fade","dissolve","slide","slideright","slideleft",
  "slideup","slidedown","zoomin","zoomout","wiperight","wipeleft",
  "wipeup","wipedown","fadeblack","fadewhite","radial","circlecrop",
  "rectcrop","smoothleft","smoothright","distance","dis_rot","sequence",
  "sequential",
];

export default function CaptionedCombine({ selectedUser }) {
  const toast = useToast();
  const intervalRef = useRef(null);
const { colorMode } = useColorMode();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const [pollingStarted, setPollingStarted] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState("sequence");
  const [pollingStatusText, setPollingStatusText] = useState("Initializing...");
  const [selectuser, setSelectuser] = useState(selectedUser?.user_id ?? "");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(12); // increase for larger grids
  const [totalPages, setTotalPages] = useState(1);

  const bg = useColorModeValue("#F8FAFC", "#1A202C");

  // Sync user selection
  useEffect(() => {
    if (selectedUser?.user_id) setSelectuser(selectedUser.user_id);
  }, [selectedUser]);

  // Fetch videos
  useEffect(() => {
    if (!selectuser) return;

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/get_edited_videos_by_user/", {
          params: { user_id: selectuser, page, limit },
        });

        const captionedVideos = (res.data?.data || []).filter(
          v => v.captioned_final_video_url || v.final_video_url || v.final_resize_video_url || v.captioned_combined_video_url
        );

        setVideos(captionedVideos);
        setTotalPages(res.data?.total_pages || 1);
      } catch (err) {
        toast({ title: "Error loading videos", description: err.message, status: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectuser, page, limit]);

  // Cleanup polling
  useEffect(() => () => intervalRef.current && clearInterval(intervalRef.current), []);

  const handleSubmit = async () => {
    if (!selectedVideo) return toast({ title: "No video selected", status: "warning" });

    setProcessing(true);
    setFinalVideoUrl(null);

    const payload = {
      hygaar_key: selectedVideo.hygaar_key,
      edit_id: selectedVideo.edit_id,
      user_id: selectuser,
      transition_effect: transitionEffect,
    };

    try {
      const res = await axiosInstance.post(`/captioned_combined_video/`, payload);
      toast({ title: res.data?.message || "Processing started", status: "success" });

      const statusUrl = res.data?.data?.status_check_url;
      if (!statusUrl) throw new Error("No status URL returned");

      pollStatus(statusUrl);
    } catch (err) {
      toast({
        title: "Processing failed",
        description: err.response?.data?.message || err.message || "Error starting processing",
        status: "error",
      });
      setProcessing(false);
    }
  };

  const pollStatus = (url) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPollingStarted(true);
    setProcessing(true);

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const data = res.data?.data;
        if (!data) return;

        const status = data.status;
        setPollingStatusText("Status: " + status.charAt(0).toUpperCase() + status.slice(1)); // Capitalize

        if (status === "completed" || status === "completed_captioned") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          setFinalVideoUrl(data.final_video_url || data.captioned_combined_video_url || data.final_resize_video_url);
          toast({ title: "✅ Video Ready!", status: "success" });
        }

        if (status === "failed" || status === "error") {
          clearInterval(intervalRef.current);
          setProcessing(false);
          toast({ title: "❌ Processing failed", status: "error" });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 6000);
  };

  return (
    <Box minH="100vh" p={4}>
      <Flex justify="space-between" mb={6} flexWrap="wrap">
        <Text fontSize="2xl" fontWeight="bold">Captioned Edit</Text>

        {!processing && !pollingStarted && (
          <Flex gap={4} mt={{ base: 4, md: 0 }}>
            <Select 
              value={transitionEffect} 
              onChange={(e) => setTransitionEffect(e.target.value)} 
              w="200px"
              sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
            >
              {transitionOptions.map(effect => (
                <option key={effect} value={effect}>
                  {effect.charAt(0).toUpperCase() + effect.slice(1)}
                </option>
              ))}
            </Select>
            <Button 
              colorScheme="blue" 
              leftIcon={<MdPlayCircle />} 
              onClick={handleSubmit} 
              disabled={!selectedVideo}
            >
              Start Combine
            </Button>
          </Flex>
        )}
      </Flex>

      {processing || pollingStarted ? (
        <ProcessingView 
          finalVideoUrl={finalVideoUrl} 
          pollingStatusText={pollingStatusText} 
          onReset={() => {
            setProcessing(false);
            setFinalVideoUrl(null);
            setPollingStarted(false);
          }} 
        />
      ) : (
        <VideoGrid
          videos={videos}
          selectedVideo={selectedVideo}
          onSelectVideo={setSelectedVideo}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
        />
      )}
    </Box>
  );
}
