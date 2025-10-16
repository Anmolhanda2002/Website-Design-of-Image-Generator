import React from "react";
import { VStack, Textarea, Text, useColorModeValue } from "@chakra-ui/react";

const BrandGuideline = ({ brandGuideline, setBrandGuideline }) => {
  const textColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("white", "navy.900");
  const inputColor = useColorModeValue("gray.800", "white");

  return (
    <VStack align="start" spacing={4}>
      <Text color={textColor} fontWeight="bold">
        Brand Guidelines
      </Text>
      <Textarea
        value={brandGuideline}
        onChange={(e) => setBrandGuideline(e.target.value)}
        placeholder="Write brand guidelines here..."
        bg={inputBg}
        color={inputColor}
        minH="150px"
      />
    </VStack>
  );
};

export default BrandGuideline;
