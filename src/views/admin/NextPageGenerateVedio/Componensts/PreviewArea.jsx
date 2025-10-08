import React from "react";
import { Flex, Text, Spinner } from "@chakra-ui/react";

const PreviewArea = ({ active, projectData }) => {
  return (
    <Flex
      flex="1"
      justify="center"
      align="center"
      bg="white"
      borderRadius="md"
      boxShadow="md"
      minH="400px"
      flexDirection="column"
    >
      {projectData.loading ? (
        <Spinner size="xl" />
      ) : projectData.videoUrls && projectData.videoUrls.length > 0 ? (
        projectData.videoUrls.map((url, idx) => (
          <video key={idx} src={url} controls width="100%" style={{ marginBottom: "1rem" }} />
        ))
      ) : (
        <Text fontSize="lg" color="gray.600">
          {projectData.projectName || "No Project"} - {active} Preview Area
        </Text>
      )}
    </Flex>
  );
};

export default PreviewArea;
