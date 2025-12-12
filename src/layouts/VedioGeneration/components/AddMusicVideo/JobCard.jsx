import React, { memo } from "react";
import { Box, Text, Button, useColorModeValue } from "@chakra-ui/react";

function JobCardComponent({ job, isSelected = false, onSelect }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const hoverShadow = useColorModeValue("lg", "dark-lg");

  const videoUrl =
    job?.final_video_with_music_url ||
    job?.final_video_url ||
    "";

  return (
    <Box
      w="100%"
      border="1px solid"
      borderColor={isSelected ? "blue.400" : borderColor}
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      boxShadow="md"
      transition="all 0.2s ease"
      _hover={{ transform: "scale(1.02)", boxShadow: hoverShadow }}
    >
      {/* VIDEO PREVIEW */}
      <Box
        h={{ base: "180px", md: "200px", lg: "220px" }}
        bg="black"
        overflow="hidden"
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            muted
            controls
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="100%"
          >
            No Preview
          </Box>
        )}
      </Box>

      {/* DETAILS */}
      <Box p={3}>
        <Text
          fontWeight="semibold"
          fontSize="md"
          noOfLines={1}
        >
          Job ID: {job.job_id}
        </Text>

        <Button
          mt={3}
          size="sm"
          colorScheme={isSelected ? "blue" : "gray"}
          variant={isSelected ? "solid" : "outline"}
          onClick={() => onSelect(job)}
          w="100%"
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </Box>
    </Box>
  );
}

export default memo(JobCardComponent);
