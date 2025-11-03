import React, { useEffect, useState, startTransition } from "react";
import {
  Box,
  Flex,
  Text,
  Spinner,
  Button,
  useToast,
  useColorModeValue,
  SimpleGrid,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

export default function AddMusic({ selectedUser }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");

  // ✅ Check token validity
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({
        title: "Session expired",
        description: "Please log in again to continue.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  // 🎞 Fetch all merge jobs for selected user
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/get_user_all_jobs/?user_id=${selectedUser || "SA-B124AD-9B"}`
        );

        if (res.data?.success && Array.isArray(res.data.data)) {
          setJobs(res.data.data);
        } else {
          setJobs([]);
          toast({
            title: "No videos found for this user.",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
        }
      } catch (err) {
        console.error("❌ Error fetching jobs:", err);
        toast({
          title: "Failed to load videos",
          description: err.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 2500,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedUser, toast]);

  // 🎬 Select a job
  const handleSelect = (job) => {
    startTransition(() => {
      setSelectedJob(job);
    });
  };

  // 🎵 Submit Add Music Request
  const handleAddMusicSubmit = async () => {
    if (!selectedJob) {
      toast({
        title: "No video selected",
        description: "Please select a video first.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Access token missing. Please log in again.");

      setSubmitting(true);

      const body = {
        merge_id: selectedJob.job_id,
        hygaar_key: selectedJob.job_id, // As per your instruction
      };

      const res = await axiosInstance.post("/music_to_merge_video/", body);

      if (res.data?.success) {
        toast({
          title: "🎵 Music added successfully!",
          description: `Job ID: ${selectedJob.job_id}`,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      } else {
        throw new Error(res.data?.message || "Failed to add music");
      }
    } catch (err) {
      console.error("❌ Error adding music:", err);
      toast({
        title: "Error adding music",
        description: err.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🎥 Job Card
  const JobCard = ({ job, isSelected }) => (
    <Box
      bg={panelBg}
      border="2px solid"
      borderColor={isSelected ? "blue.400" : borderColor}
      borderRadius="xl"
      boxShadow={isSelected ? "0 0 15px rgba(66,153,225,0.5)" : "sm"}
      overflow="hidden"
      transition="all 0.3s ease"
      cursor="pointer"
      onClick={() => handleSelect(job)}
      _hover={{ transform: "scale(0.98)", bg: hoverBg }}
      minW="260px"
      flexShrink={0}
    >
      <Flex h="200px" align="center" justify="center" bg="gray.100">
        {job.final_resize_video_url ||
        job.final_video_with_music_url ||
        job.final_video_url ? (
          <video
            src={
              job.final_resize_video_url ||
              job.final_video_with_music_url ||
              job.final_video_url
            }
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
            muted
          />
        ) : (
          <Text color="gray.500">No Preview</Text>
        )}
      </Flex>
      <Box p={3}>
        <Text fontWeight="bold" noOfLines={1}>
          Job ID: {job.job_id}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Status: {job.status}
        </Text>
      </Box>
    </Box>
  );

  return (
    <Flex direction="column" p={{ base: 4, md: 8 }} gap={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
        <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="bold">
          Add Music to Video
        </Text>
        <Button
          colorScheme="blue"
          size="md"
          onClick={handleAddMusicSubmit}
          isLoading={submitting}
          isDisabled={!selectedJob}
        >
          Add Music
        </Button>
      </Flex>

      {/* Body */}
      {loading ? (
        <Flex align="center" justify="center" h="60vh">
          <Spinner size="xl" />
        </Flex>
      ) : jobs.length > 0 ? (
        <Box
          overflowX="auto"
          whiteSpace="nowrap"
          css={{
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#CBD5E0",
              borderRadius: "8px",
            },
          }}
        >
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            spacing={6}
            minW="900px"
          >
            {jobs.map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                isSelected={selectedJob?.job_id === job.job_id}
              />
            ))}
          </SimpleGrid>
        </Box>
      ) : (
        <Flex align="center" justify="center" h="60vh">
          <Text color="gray.500" fontSize="lg">
            No jobs found.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
