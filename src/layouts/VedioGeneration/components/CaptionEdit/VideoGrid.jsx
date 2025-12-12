import React from "react";
import { SimpleGrid, Flex, Text, Button } from "@chakra-ui/react";
import VideoCard from "./VideoCard";

export default function VideoGrid({ videos, selectedVideo, onSelectVideo, page, setPage, totalPages }) {
  if (!videos.length)
    return (
      <Flex justify="center" align="center" h="50vh">
        <Text fontSize="xl" fontWeight="bold" color="gray.500">No videos found</Text>
      </Flex>
    );

  return (
    <>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} width="100%">
        {videos.map(v => (
          <VideoCard key={v.edit_id} video={v} selectedVideo={selectedVideo} onSelectVideo={onSelectVideo} />
        ))}
      </SimpleGrid>

      <Flex justify="center" mt={6} gap={4}>
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
        <Text fontSize="lg" fontWeight="bold">Page {page} of {totalPages}</Text>
        <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
      </Flex>
    </>
  );
}
