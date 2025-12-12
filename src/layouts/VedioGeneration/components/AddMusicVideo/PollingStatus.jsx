// PollingStatus.jsx
import { Box, Spinner, Text, useColorModeValue } from "@chakra-ui/react";

export default function PollingStatus() {
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box
      bg={bg}
      p={8}
      textAlign="center"
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.600"
    >
      <Spinner size="xl" />
      <Text mt={4} fontSize="lg" fontWeight="bold">
        Adding music… Please wait
      </Text>
    </Box>
  );
}
