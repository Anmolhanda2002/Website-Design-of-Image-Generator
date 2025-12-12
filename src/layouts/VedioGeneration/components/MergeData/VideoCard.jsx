import React from "react";
import { VStack, Box, Text } from "@chakra-ui/react";

export default function VideoCard({ video, onSelect }) {
  return (
    <VStack
      bg="white"
      border="1px solid gray"
      borderRadius="md"
      overflow="hidden"
      cursor="pointer"
      onClick={() => onSelect(video)}
    >
      <Box h="210px" w="100%" bg="black">
        <video
          src={video.captioned_final_video_url || video.final_video_url}
          muted
          autoPlay
          loop
          style={{ width: "100%", height: "210px", objectFit: "cover" }}
        />
      </Box>
      <Box p={3} w="100%">
        <Text fontWeight="bold" noOfLines={1}>{video.project_name}</Text>
        <Text color="gray.500" fontSize="sm">{video.edit_id}</Text>
      </Box>
    </VStack>
  );
}
