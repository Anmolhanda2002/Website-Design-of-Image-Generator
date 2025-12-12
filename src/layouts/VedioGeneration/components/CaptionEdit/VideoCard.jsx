import React from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

export default function VideoCard({ video, selectedVideo, onSelectVideo }) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const activeBorderColor = "blue.400";
  const activeShadow = useColorModeValue("0 0 10px rgba(66,153,225,0.7)", "0 0 10px rgba(66,153,225,0.9)");

  const selected = selectedVideo?.edit_id === video.edit_id;
  const videoUrl = video.captioned_final_video_url || video.final_video_url || video.final_resize_video_url || video.captioned_combined_video_url;

  return (
    <Box
      border="2px solid"
      borderColor={selected ? activeBorderColor : borderColor}
      borderRadius="xl"
      boxShadow={selected ? activeShadow : "sm"}
      bg={cardBg}
      overflow="hidden"
      cursor="pointer"
      onClick={() => onSelectVideo(video)}
    >
      {videoUrl ? (
        <video src={videoUrl} controls style={{ width: "100%", height: "auto", maxHeight: "250px", objectFit: "cover" }} />
      ) : (
        <Box h="250px" bg="gray.200" display="flex" alignItems="center" justifyContent="center">
          <Text>No Preview</Text>
        </Box>
      )}

      <Box p={3}>
        <Text fontWeight="bold" noOfLines={1}>{video.project_name || "Untitled"}</Text>
        <Text fontSize="sm" color="gray.500">{video.edit_id}</Text>
      </Box>
    </Box>
  );
}
