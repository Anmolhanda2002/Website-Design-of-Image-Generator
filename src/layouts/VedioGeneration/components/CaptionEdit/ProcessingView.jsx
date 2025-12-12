import React from "react";
import { Flex, Box, VStack, Text, Spinner, Button } from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";

export default function ProcessingView({ finalVideoUrl, pollingStatusText, onReset }) {
  return (
    <Flex align="center" justify="center" width="100%" minH="60vh" py={4}>
      <Box w="100%" maxW="800px" maxH="75vh" overflowY="auto" px={2} sx={{ "&::-webkit-scrollbar": { width: "0px" }, scrollbarWidth: "none" }}>
        {finalVideoUrl ? (
          <VStack spacing={6} w="100%">
            <Flex align="center" gap={3} color="green.500">
              <MdCheckCircle size={30} />
              <Text fontSize="2xl" fontWeight="bold">Video Ready!</Text>
            </Flex>

            <video src={finalVideoUrl} controls autoPlay style={{ width: "100%", height: "400px", maxHeight: "450px", borderRadius: "14px", backgroundColor: "black" }} />

            <Button colorScheme="blue" onClick={onReset}>Process Another</Button>
          </VStack>
        ) : (
          <VStack spacing={4} py={10}>
            <Spinner size="xl" color="blue.400" />
            <Text>{pollingStatusText}</Text>
          </VStack>
        )}
      </Box>
    </Flex>
  );
}
