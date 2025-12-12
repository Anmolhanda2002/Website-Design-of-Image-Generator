import React from "react";
import { SimpleGrid, VStack, Box, Text, Button, Flex } from "@chakra-ui/react";
import VideoCard from "./VideoCard";

export default function VideoGrid({ videos, currentPage, videosPerPage, totalPages, onSelect, setCurrentPage }) {
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  if (!videos.length) {
    return <Text textAlign="center" mt={10}>No videos found for this user</Text>;
  }

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mt={4}>
        {currentVideos.map((video) => (
          <VideoCard key={video.edit_id} video={video} onSelect={onSelect} />
        ))}
      </SimpleGrid>

      {videos.length > videosPerPage && (
        <Flex justify="center" mt={6} gap={4}>
          <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} isDisabled={currentPage === 1}>
            Previous
          </Button>
          <Text fontWeight="bold">Page {currentPage} of {totalPages}</Text>
          <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} isDisabled={currentPage === totalPages}>
            Next
          </Button>
        </Flex>
      )}
    </>
  );
}
