import React, { useEffect, useState, startTransition, useRef } from "react";
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
  IconButton,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";

export default function AddMusic({ selectedUser, MusicData, SetMusicData }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pollingJobId, setPollingJobId] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);

  // FINAL VIDEO
  const [finalMusicVideoUrl, setFinalMusicVideoUrl] = useState(null);
  const [showFinalView, setShowFinalView] = useState(false);

  const pollingRef = useRef(null);
  const toast = useToast();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue(
    "0 0 10px rgba(66,153,225,0.7)",
    "0 0 10px rgba(66,153,225,0.9)"
  );

  // -------------------------------------------------------------------
  //                     FETCH USER JOBS
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!selectedUser?.user_id) {
      setJobs([]);
      return;
    }

    startTransition(() => {
      const fetchJobs = async () => {
        try {
          setLoading(true);

          const res = await axiosInstance.get("/get_user_all_jobs/", {
            params: { user_id: selectedUser.user_id },
          });

          if (!res.data?.success || !Array.isArray(res.data.data)) {
            setJobs([]);
            return toast({
              title: "No videos found.",
              status: "warning",
              duration: 2000,
              isClosable: true,
            });
          }

          const completeWithMusic = res.data.data.filter(
            (job) => job.final_video_with_music_url
          );

          setJobs(completeWithMusic);
        } catch (err) {
          toast({
            title: "Failed to load videos",
            description:
              err.response?.data?.message || "Please try again later.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchJobs();
    });
  }, [selectedUser]);

  // -------------------------------------------------------------------
  //                     SELECT JOB CARD
  // -------------------------------------------------------------------
  const handleSelect = (job) => {
    startTransition(() => {
      setSelectedJob(job);

      SetMusicData((prev) => ({
        ...prev,
        merge_id: job.job_id,
        user_id: selectedUser?.user_id || "",
      }));

      toast({
        title: "Video Selected",
        description: `Merge ID set to ${job.job_id}`,
        status: "info",
        duration: 1500,
        isClosable: true,
      });
    });
  };

  // -------------------------------------------------------------------
  //                       ADD MUSIC SUBMIT
  // -------------------------------------------------------------------
  const handleAddMusicSubmit = async () => {
    if (!selectedJob) {
      return toast({
        title: "No video selected",
        description: "Please select a video.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
    }

    try {
      setSubmitting(true);

      const body = {
        merge_id: selectedJob.job_id,
        user_id: selectedUser?.user_id,
        ...MusicData
      };

      const res = await axiosInstance.post("/music_to_merge_video/", body);

      if (!res.data?.success) throw new Error(res.data?.message);

      const newMergeId = res.data?.job_id || selectedJob.job_id;

      // RESET FINAL VIEW
      setShowFinalView(false);
      setFinalMusicVideoUrl(null);

      // Start polling
      setPollingJobId(newMergeId);
      setPollingStatus("processing");
      startPolling(newMergeId);

      toast({
        title: "Processing Started",
        description: `Job ${newMergeId} is being processed.`,
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------------
  //                       POLLING
  // -------------------------------------------------------------------
  const startPolling = (jobId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await axiosInstance.get(
          "/factory_get_merge_music_job_status/",
          { params: { job_id: jobId } }
        );

        if (res.data?.status !== "success") return;

        const status = res.data.job_status;
        setPollingStatus(status);

        if (status === "completed_with_music") {
          setFinalMusicVideoUrl(res.data.final_video_with_music_url);
          setShowFinalView(true);

          clearInterval(pollingRef.current);
          pollingRef.current = null;

          toast({
            title: "Success!",
            description: "Final video with music is ready.",
            status: "success",
            duration: 3000,
          });
        }
      } catch (err) {
        console.log("Polling error:", err);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // -------------------------------------------------------------------
  //                    BACK FROM FINAL VIEW
  // -------------------------------------------------------------------
  const handleBack = () => {
    setShowFinalView(false);
    setFinalMusicVideoUrl(null);
    setPollingStatus(null);
  };

  // -------------------------------------------------------------------
  //                     JOB CARD COMPONENT
  // -------------------------------------------------------------------
  const JobCard = ({ job, isSelected }) => {
    const videoUrl =
      job.final_video_with_music_url || job.final_video_url || "";

    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={isSelected ? activeShadow : "sm"}
        overflow="hidden"
        align="stretch"
      >
        <Flex h="200px" bg="gray.100">
          <video
            src={videoUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            controls
            muted
          />
        </Flex>

        <VStack p={3} spacing={1} align="stretch">
          <Text fontWeight="bold">Job ID: {job.job_id}</Text>
          <Button
            size="sm"
            colorScheme={isSelected ? "blue" : "gray"}
            variant={isSelected ? "solid" : "outline"}
            onClick={() => handleSelect(job)}
          >
            {isSelected ? "Selected" : "Select Video"}
          </Button>
        </VStack>
      </VStack>
    );
  };

  // -------------------------------------------------------------------
  //                        MAIN RETURN UI
  // -------------------------------------------------------------------
  return (
    <Flex direction="column" p={6} gap={6} bg={pageBg} w="100%">
      {/* ————————————————————————————————
            FINAL VIDEO SECTION ONLY
          ———————————————————————————————— */}
      {showFinalView && finalMusicVideoUrl ? (
        <Box>
          {/* Back Button */}
          <Flex align="center" mb={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              aria-label="Back"
              onClick={handleBack}
              mr={3}
              variant="outline"
              fontSize="22px"
            />
            <Text fontSize="2xl" fontWeight="bold">
              Final Video With Music
            </Text>
          </Flex>

          {/* Final Video Preview */}
          <Box
            border="2px solid green"
            borderRadius="xl"
            bg="black"
            overflow="hidden"
          >
            <video
              src={finalMusicVideoUrl}
              controls
              autoPlay
              style={{ width: "100%", borderRadius: "12px" }}
            />
          </Box>
        </Box>
      ) : (
        <>
          {/* HEADER */}
          <Flex justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold">
              Completed Videos (With Music)
            </Text>

            <Button
              colorScheme="blue"
              onClick={handleAddMusicSubmit}
              isLoading={submitting}
              
            >
              Add Music Again
            </Button>
          </Flex>

          {/* JOB CARDS GRID */}
          {!pollingStatus && (
            <Box pr={1}>
              {loading ? (
                <Flex h="60vh" align="center" justify="center">
                  <Spinner size="xl" />
                </Flex>
              ) : jobs.length > 0 ? (
                <SimpleGrid
                  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
                  spacing={6}
                >
                  {jobs.map((job) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      isSelected={selectedJob?.job_id === job.job_id}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex h="60vh" align="center" justify="center">
                  <Text>No videos found.</Text>
                </Flex>
              )}
            </Box>
          )}

          {/* PROCESSING VIEW */}
          {pollingStatus === "processing" && (
            <Box
              bg={panelBg}
              p={6}
              borderRadius="xl"
              border="1px solid"
              textAlign="center"
            >
              <Spinner size="xl" color="blue.500" />
              <Text mt={4} fontSize="lg" fontWeight="bold">
                Adding music... Please wait
              </Text>
            </Box>
          )}
        </>
      )}
    </Flex>
  );
}
