import { Box, Input, Button, Flex, Icon, useColorModeValue } from "@chakra-ui/react";
import { FiPlusSquare } from "react-icons/fi";
import { useState } from "react";

const TextFieldCard = () => {
  const [text, setText] = useState("");
  const cardBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box
      p={6}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={borderColor}
      bg={cardBg}
      maxW="600px"
      mx="auto"
    >
      <Flex align="center" gap={3}>
        <Icon as={FiPlusSquare} boxSize={6} color="blue.400" />
        <Input
          placeholder="Type your idea, click 'Create' to get a video"
          value={text}
          onChange={(e) => setText(e.target.value)}
          size="lg"
        />
        <Button colorScheme="purple" px={6}>
          ✨ Create Video
        </Button>
      </Flex>
    </Box>
  );
};

export default TextFieldCard;
