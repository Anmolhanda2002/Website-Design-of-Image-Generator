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

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pollingJobId, setPollingJobId] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);

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
  //                     FETCH JOBS WITH PAGINATION
  // -------------------------------------------------------------------
  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);

      const res = await axiosInstance.get("/get_user_all_jobs/", {
        params: { 
          user_id: selectedUser?.user_id,
          page: page 
        },
      });

      if (!res.data?.success) {
        setJobs([]);
        return;
      }

      const completeWithMusic = res.data.data.filter(
        (job) => job.final_video_url
      );

      setJobs(completeWithMusic);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.total_pages);

    } catch (err) {
      toast({
        title: "Failed to load videos",
        status: "error",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    if (!selectedUser?.user_id) return;
    fetchJobs(1);
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
      });
    }

    try {
      setSubmitting(true);

      const body = {
        merge_id: selectedJob.job_id,
        user_id: selectedUser?.user_id,
        ...MusicData,
      };

      const res = await axiosInstance.post("/music_to_merge_video/", body);

      if (!res.data?.success) throw new Error(res.data?.message);

      const newMergeId = res.data?.job_id || selectedJob.job_id;

      setShowFinalView(false);
      setFinalMusicVideoUrl(null);

      setPollingJobId(newMergeId);
      setPollingStatus("processing");
      startPolling(newMergeId);

      toast({
        title: "Processing Started",
        description: `Job ${newMergeId} started.`,
        status: "success",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        status: "error",
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

       
          setFinalMusicVideoUrl(res.data.final_video_with_music_url);
          setShowFinalView(true);

          clearInterval(pollingRef.current);
          pollingRef.current = null;

          toast({
            title: "Video Ready",
            description: "Your video with music is completed.",
            status: "success",
          });
        
      } catch (err) {
        // console.log("Polling error:", err);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleBack = () => {
    setShowFinalView(false);
    setFinalMusicVideoUrl(null);
    setPollingStatus(null);
  };

  // -------------------------------------------------------------------
  //                     JOB CARD UI
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
  //                     PAGINATION UI
  // -------------------------------------------------------------------
  const Pagination = () => (
    <Flex justify="center" align="center" mt={6} gap={4}>
      <Button
        onClick={() => fetchJobs(currentPage - 1)}
        isDisabled={currentPage <= 1}
      >
        Previous
      </Button>

      <Text fontWeight="bold">
        Page {currentPage} / {totalPages}
      </Text>

      <Button
        onClick={() => fetchJobs(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </Flex>
  );

  // -------------------------------------------------------------------
  //                        MAIN RETURN UI
  // -------------------------------------------------------------------
  return (
    <Flex direction="column" p={6} gap={6} bg={pageBg} w="100%">
      {showFinalView && finalMusicVideoUrl ? (
        <Box>
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
              style={{ width: "100%",maxHeight: "400px", borderRadius: "12px" }}
            />
          </Box>
        </Box>
      ) : (
        <>
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

          {!pollingStatus && (
            <Box pr={1}>
              {loading ? (
                <Flex h="60vh" align="center" justify="center">
                  <Spinner size="xl" />
                </Flex>
              ) : jobs.length > 0 ? (
                <>
                  {/* GRID */}
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, md: 3, lg: 3 }}
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

                  {/* PAGINATION BELOW GRID */}
                  <Pagination />
                </>
              ) : (
                <Flex h="60vh" align="center" justify="center">
                  <Text>No videos found.</Text>
                </Flex>
              )}
            </Box>
          )}

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
