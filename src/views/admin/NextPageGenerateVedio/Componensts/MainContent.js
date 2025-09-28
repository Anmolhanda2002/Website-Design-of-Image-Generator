import { Box, Text, useColorModeValue } from "@chakra-ui/react";
import TextFieldCard from "./TextField";

const MainContent = () => {
  const contentBg = useColorModeValue("white", "gray.800");

  return (
    <Box flex="1" bg={contentBg} p={10} overflowY="auto">
      {/* Page Title */}
      <Box
        p={6}
        borderRadius="lg"
        boxShadow="md"
        border="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        maxW="400px"
        mb={8}
      >
        <Text fontSize="sm" color="gray.500">
          Pages › Dashboard
        </Text>
        <Text fontSize="2xl" fontWeight="bold" mt={2}>
          Dashboard
        </Text>
      </Box>

      {/* Text Input Card */}
      <TextFieldCard />
    </Box>
  );
};

export default MainContent;
