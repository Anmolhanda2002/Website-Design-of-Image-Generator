import React from "react";
import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

export default function FinalVideoView({ url, onBack }) {
  return (
    <Box>
      <Flex align="center" mb={4}>
        <IconButton
          onClick={onBack}
          icon={<ArrowBackIcon />}
          aria-label="Back"
          variant="outline"
          mr={3}
        />
        <Text fontSize="2xl" fontWeight="bold">
          Final Video With Music
        </Text>
      </Flex>

      <Box borderRadius="lg" overflow="hidden" border="2px solid" borderColor="green.400">
        <video
          src={url}
          controls
          autoPlay
          style={{ width: "100%", maxHeight: 520, borderRadius: 12 }}
        />
      </Box>
    </Box>
  );
}
