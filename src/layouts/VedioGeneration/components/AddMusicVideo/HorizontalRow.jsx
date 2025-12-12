import React from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Button,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import JobCard from "./JobCard";

/**
 * VerticalGrid (Improved spacing + responsive)
 */
export default function VerticalGrid({
  title,
  jobs = [],
  selectedJob,
  onSelect,
  page,
  totalPages,
  onNextPage,
  onPrevPage,
}) {
  const bg = useColorModeValue("transparent", "transparent");

  return (
    <Box w="100%">

      {/* GRID or Empty Message */}
      {jobs.length > 0 ? (
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 4, sm: 6, md: 8 }}
          w="100%"
          bg={bg}
        >
          {jobs.map((job) => (
            <Box key={job.job_id} w="100%">
              <JobCard
                job={job}
                isSelected={selectedJob?.job_id === job.job_id}
                onSelect={onSelect}
              />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text
          fontSize="lg"
          fontWeight="medium"
          color="gray.500"
          textAlign="center"
          py={10}
        >
          No video found for this user
        </Text>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <HStack mt={10} spacing={4} justify="center">
          <Button
            onClick={onPrevPage}
            isDisabled={page <= 1}
            colorScheme="gray"
            variant="outline"
          >
            Previous
          </Button>

          <Text fontWeight="bold" fontSize="lg">
            Page {page} / {totalPages}
          </Text>

          <Button
            onClick={onNextPage}
            isDisabled={page >= totalPages}
            colorScheme="blue"
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
}
