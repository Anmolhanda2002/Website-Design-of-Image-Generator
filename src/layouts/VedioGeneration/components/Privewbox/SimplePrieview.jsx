import React from "react";
import { Box, Flex, Image, IconButton, Spinner, Text } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

export default function PreviewBox({
  loading,
  generatedImage,
  resizedImage,
  generatedVideo,
  resizeDetails,
  onViewDetails,
  panelBg,
  borderColor,
}) {
  const previewUrl = resizedImage || generatedImage || generatedVideo;

  const isVideo = previewUrl && previewUrl.endsWith(".mp4");

  return (
    <Flex
      minH="300px"
      bg={panelBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      align="center"
      justify="center"
      position="relative"
      boxShadow="sm"
      p={4}
    >
      {loading ? (
        <Spinner size="xl" color="blue.500" />
      ) : previewUrl ? (
        <Box w="100%" h="100%" textAlign="center">
          {isVideo ? (
            <video
              src={previewUrl}
              controls
              style={{
                maxHeight: "400px",
                borderRadius: "12px",
                margin: "auto",
              }}
            />
          ) : (
            <Image
              src={previewUrl}
              alt="Generated Result"
              maxH="400px"
              objectFit="contain"
              mx="auto"
              borderRadius="lg"
            />
          )}
          {resizeDetails && (
            <IconButton
              icon={<ViewIcon />}
              aria-label="View Details"
              position="absolute"
              top="10px"
              right="10px"
              size="sm"
              colorScheme="blue"
              onClick={onViewDetails}
            />
          )}
        </Box>
      ) : (
        <Text color="gray.500" fontSize="md">
          {isVideo ? "🎬 Video Preview" : "🖼️ Image Preview"}
        </Text>
      )}
    </Flex>
  );
}
