import React from "react";
import { Box, Flex, Text, IconButton, useColorModeValue } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";

export default function ResultView({ resultVideo, onBack }) {
  const panelBg = useColorModeValue("white", "gray.800");

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"   // ensures button is visible even on small screens
      p={6}
    >
      <Box
        
        p={6}
        borderRadius="xl"
        boxShadow="lg"
        maxW="700px"
        w="100%"
        textAlign="center"
        position="relative"
      >
        {/* 🔙 Properly positioned back button */}
        <Flex
          position="absolute"
          top={4}
          left={4}
          zIndex={10}
        >
          <IconButton
            icon={<MdArrowBack size={22} />}
            colorScheme="gray"
            variant="solid"
            borderRadius="full"
            size="sm"
            onClick={onBack}
            bg={useColorModeValue("white", "gray.700")}
            _hover={{ bg: useColorModeValue("gray.200", "gray.600") }}
            boxShadow="md"
            aria-label="Go Back"
          />
        </Flex>

        <Text fontSize="2xl" fontWeight="bold" my={4}>
          🎉 Captioned Segment Ready!
        </Text>

        <video
          src={resultVideo.captioned_segment_url}
          controls
          autoPlay
          style={{
            width: "100%",
            borderRadius: "12px",
            maxHeight: "300px",
            marginBottom: "16px",
          }}
        />

        <Text fontWeight="semibold">
          Edit ID: <b>{resultVideo.edit_id}</b>
        </Text>
        <Text color="green.500" fontWeight="bold">
          Segment #{resultVideo.segment_number}
        </Text>
      </Box>
    </Flex>
  );
}
