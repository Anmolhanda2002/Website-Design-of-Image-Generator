import React from "react";
import { Box, Flex, Input, Text, useColorModeValue } from "@chakra-ui/react";

const PersonalInfo = ({ formData, setFormData }) => {
  const textSecondary = useColorModeValue("gray.500", "gray.400");
  const inputBg = useColorModeValue("white", "navy.900");
  const inputColor = useColorModeValue("gray.800", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.300");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Flex wrap="wrap" gap={6} mt={4}>
      {["username", "first_name", "last_name", "email"].map((field) => (
        <Box flex="1" minW="250px" key={field}>
          <Text fontSize="sm" color={textSecondary} mb={1}>
            {field.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
          <Input
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={`Enter ${field.replace("_", " ")}`}
            color={inputColor}
            bg={inputBg}
            _placeholder={{ color: placeholderColor }}
          />
        </Box>
      ))}
    </Flex>
  );
};

export default PersonalInfo;
