import React from "react";
import { Flex, Spinner, Text } from "@chakra-ui/react";

export default function LoadingOverlay({ loading, status }) {
  if (!loading) return null;

  return (
    <Flex h="65vh" justify="center" align="center" direction="column">
      <Spinner size="xl" />
      {status && <Text mt={3}>{status}</Text>}
    </Flex>
  );
}
