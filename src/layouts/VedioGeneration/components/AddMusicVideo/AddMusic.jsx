import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import HorizontalRow from "./HorizontalRow";
import FinalVideoView from "./FinalVideoView";
import PollingStatus from "./PollingStatus";
import useFetchJobs from "./hooks/useFetchJobs";
import useMusicSubmit from "./hooks/useMusicSubmit";

export default function AddMusic({ selectedUser, MusicData, SetMusicData }) {
  const toast = useToast();
  const pageBg = useColorModeValue("#F8FAFC", "#0B1220");
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch jobs hook handles paging and infinite load
  const {
    jobs,
    loading,
    currentPage,
    totalPages,
    loadNextPage,
    refresh,
    hasMore,
    setJobsFromExternal,
  } = useFetchJobs(selectedUser);

  // Submit + polling hook
  const {
    startSubmit,
    submitting,
    pollingState,
    finalUrl,
    cancelPolling,
    resetSubmit,
  } = useMusicSubmit({
    onStarted: (jobId) =>
      toast({
        title: "Processing Started",
        description: `Job ${jobId} started.`,
        status: "success",
        duration: 3000,
      }),
    onComplete: () =>
      toast({
        title: "Video Ready",
        description: "Your video with music is completed.",
        status: "success",
        duration: 3000,
      }),
    onError: (msg) =>
      toast({
        title: "Error",
        description: msg,
        status: "error",
        duration: 4000,
      }),
  });

  // called when user clicks a JobCard Select
  const handleSelect = useCallback(
    (job) => {
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
    },
    [SetMusicData, selectedUser, toast]
  );

  // Start add-music submit
  const handleAddMusicSubmit = async () => {
    if (!selectedJob) {
      toast({
        title: "No video selected",
        description: "Please select a video.",
        status: "warning",
      });
      return;
    }

    const body = {
      merge_id: selectedJob.job_id,
      user_id: selectedUser?.user_id,
      ...MusicData,
    };

    startSubmit(body);
  };

  const handleBackFromFinal = () => {
    resetSubmit();
    setSelectedJob(null);
    // refresh jobs (in case finalVideo now exists on job)
    refresh();
  };

  // optionally expose jobs externally (not required)
  // setJobsFromExternal([])

  return (
    <Flex direction="column"  gap={6}  w="100%">
      {pollingState === "completed" && finalUrl ? (
        <FinalVideoView url={finalUrl} onBack={handleBackFromFinal} />
      ) : (
        <>
          <Flex justify="space-between" align="center" wrap="wrap">
            <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
              Add Music
            </Text>

            <Flex gap={3}>
              <Button
                colorScheme="blue"
                onClick={handleAddMusicSubmit}
                isLoading={submitting}
              >
                Add Music Again
              </Button>
{/* 
              <Button
                variant="outline"
                onClick={() => {
                  cancelPolling();
                  toast({ title: "Cancelled", status: "info" });
                }}
              >
                Cancel
              </Button> */}
            </Flex>
          </Flex>

          {pollingState === "processing" && <PollingStatus />}

          
            {/* Single row for simplicity — can render multiple rows grouped by date/category */}
            <HorizontalRow
              
  jobs={jobs}
  selectedJob={selectedJob}
  onSelect={handleSelect}
  page={currentPage}
  totalPages={totalPages}
  onNextPage={loadNextPage}
  onPrevPage={() => refresh(currentPage - 1)}

            />
          
        </>
      )}
    </Flex>
  );
}
