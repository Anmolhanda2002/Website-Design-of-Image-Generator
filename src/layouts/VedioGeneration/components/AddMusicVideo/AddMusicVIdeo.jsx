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
  VStack,
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
  const pageBg = useColorModeValue("#F8FAFC", "#1A202C");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue(
    "0 0 10px rgba(66,153,225,0.7)",
    "0 0 10px rgba(66,153,225,0.9)"
  );

  // 🎞 Fetch all merge jobs for selected user
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

        if (res.data?.success && Array.isArray(res.data.data)) {
          const availableJobs = res.data.data.filter(
            (job) => !job.final_video_with_music_url
          );
          setJobs(availableJobs);
          if (availableJobs.length === 0) {
            toast({
              title: "No merge jobs available for music.",
              status: "info",
              duration: 2500,
              isClosable: true,
            });
          }
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
          description:
            err.response?.data?.message ||
            "Please check your connection and try again.",
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
}, [selectedUser, toast]);
 // ✅ runs again when user changes

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
      const hygaarKey = localStorage.getItem("api_key");
      if (!hygaarKey) {
        throw new Error("API key missing. Please log in again.");
      }

      setSubmitting(true);

      const body = {
        merge_id: selectedJob.job_id,
        hygaar_key: hygaarKey,
        user_id: selectedUser?.user_id,
      };

      const res = await axiosInstance.post("/music_to_merge_video/", body);

      if (res.data?.success) {
        toast({
          title: "🎵 Music added successfully!",
          description: `Job ID: ${selectedJob.job_id}. Processing started.`,
          status: "success",
          duration: 4000,
          isClosable: true,
        });

        // Update job status locally
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.job_id === selectedJob.job_id
              ? { ...job, status: "Music Added (Processing)" }
              : job
          )
        );
        setSelectedJob(null);
      } else {
        throw new Error(res.data?.message || "Failed to add music. Check API response.");
      }
    } catch (err) {
      console.error("❌ Error adding music:", err);
      toast({
        title: "Error adding music",
        description: err.message || "Something went wrong with the request.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 🎥 Job Card Component
  const JobCard = ({ job, isSelected }) => {
    const videoUrl = job.final_resize_video_url || job.final_video_url;
    const brandMessage = job.consumer_message || job.key_instructions || "N/A";

    return (
      <VStack
        bg={panelBg}
        border="2px solid"
        borderColor={isSelected ? activeBorderColor : borderColor}
        borderRadius="xl"
        boxShadow={isSelected ? activeShadow : "sm"}
        overflow="hidden"
        transition="all 0.3s ease"
        align="stretch"
      >
        <Flex h="200px" align="center" justify="center" bg="gray.100" overflow="hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              controls
              muted
            />
          ) : (
            <Text color="gray.500">Video URL Missing</Text>
          )}
        </Flex>

        <VStack p={3} spacing={1} align="stretch">
          <Text fontWeight="bold" noOfLines={1} fontSize="md">
            Job ID: {job.job_id}
          </Text>

          <Box bg={useColorModeValue("blue.50", "gray.700")} p={2} borderRadius="md">
            <Text fontSize="xs" fontWeight="semibold" color="blue.500">
              Brand Message:
            </Text>
            <Text fontSize="sm" noOfLines={2} color={useColorModeValue("gray.700", "gray.200")}>
              {brandMessage}
            </Text>
          </Box>

          <Text fontSize="sm" color="gray.500">
            Status: {job.status}
          </Text>

          <Button
            size="sm"
            mt={2}
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

  return (
    <Flex
      direction="column"
      p={{ base: 4, md: 8 }}
      gap={6}
      bg={pageBg}
      w="100%"
      minH="100%"
    >
      {/* Header and Action Button */}
      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} w="100%">
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
          Add Music to Video
        </Text>
        <Button
          colorScheme="blue"
          size="md"
          onClick={handleAddMusicSubmit}
          isLoading={submitting}
          isDisabled={!selectedJob}
        >
          {submitting ? "Processing..." : "Submit to Add Music"}
        </Button>
      </Flex>

      {/* Body / Grid */}
      {loading ? (
        <Flex align="center" justify="center" h="60vh" w="100%">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : jobs.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} pb={10} w="100%">
          {jobs.map((job) => (
            <JobCard
              key={job.job_id}
              job={job}
              isSelected={selectedJob?.job_id === job.job_id}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Flex align="center" justify="center" h="60vh" w="100%">
          <Text color="gray.500" fontSize="lg" textAlign="center">
            No merge jobs found for the selected user that are ready to receive music.
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
