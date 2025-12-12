import React from "react";
import { Box, Text, Flex, useColorModeValue } from "@chakra-ui/react";

export default function VideoCard({ video, isSelected, onSelect }) {
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const videoSrc =
    video.captioned_segment_url ||
    video.captioned_final_video_url ||
    video.final_video_url;

  return (
    <Box
      bg={panelBg}
      border="2px solid"
      borderColor={isSelected ? "blue.400" : borderColor}
      borderRadius="xl"
      boxShadow={isSelected ? "0 0 15px rgba(66,153,225,0.5)" : "sm"}
      overflow="hidden"
      cursor="pointer"
      onClick={() => onSelect(video)}
    >
      {videoSrc ? (
        <video
          src={videoSrc}
          controls
          muted
          style={{ width: "100%", height: "200px", objectFit: "cover" }}
        />
      ) : (
        <Flex w="100%" h="200px" bg="gray.100" align="center" justify="center">
          <Text>No Video</Text>
        </Flex>
      )}
      <Box p={3}>
        <Text fontWeight="bold" noOfLines={1}>
          {video.project_name || "Unnamed Project"}
        </Text>
        <Text fontSize="sm" color="gray.500">
          ID: {video.edit_id}
        </Text>
      </Box>
    </Box>
  );
}
