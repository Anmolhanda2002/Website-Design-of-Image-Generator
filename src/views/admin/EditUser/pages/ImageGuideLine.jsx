import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Select,
  Spinner,
  useToast,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Heading,
  Flex,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

const ImageGuideline = () => {
  const [guidelines, setGuidelines] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedValues, setSelectedValues] = useState({});
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const inputBg = useColorModeValue("gray.50", "gray.700");
  const inputColor = useColorModeValue("gray.800", "white");
  const placeholderColor = useColorModeValue("gray.500", "gray.300");
  const headingColor = useColorModeValue("blue.600", "blue.300");
const textColor = useColorModeValue("gray.700", "gray.200");
  useEffect(() => {
    const fetchGuidelines = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post("/get_image_guideline_choices");
        if (res.data.status === "success") {
          setGuidelines(res.data.data);
        } else {
          toast({
            title: "Failed to fetch guidelines",
            description: res.data.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error fetching data",
          description:
            error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, [toast]);

  const handleSelectChange = (field, value) => {
    setSelectedValues((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" />
        <Text ml={3} fontSize="md">
          Loading Image Guidelines...
        </Text>
      </Flex>
    );
  }

  return (
    <Box
      bg={cardBg}
      w={"100%"}
    >
      <Heading
        size="md"
        mb={6}
        color={headingColor}
        textAlign="center"
        letterSpacing="wide"
      >
        📸 Image Guideline Form
      </Heading>

      <Divider mb={6} />

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {Object.entries(guidelines).map(([field, options]) => (
          <Box
            key={field}
            color={textColor}
            p={4}
            borderRadius="12px"
            boxShadow="sm"
            _hover={{ boxShadow: "lg" }}
            transition="0.3s"
          >
            <Text
              fontSize="sm"
              mb={2}
              fontWeight="600"
             color={textColor}
            >
              {field
                .replaceAll("_", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>

            <Select
              placeholder={`Select ${field.replaceAll("_", " ")}`}
              bg={inputBg}
              color={inputColor}
              _placeholder={{ color: placeholderColor }}
              borderColor={borderColor}
              borderRadius="10px"
              value={selectedValues[field] || ""}
              onChange={(e) => handleSelectChange(field, e.target.value)}
            >
              {Object.entries(options).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Box>
        ))}
      </SimpleGrid>

      <Divider my={6} />

      <VStack spacing={2}>
        <Text fontSize="sm" color="gray.500">
          ✅ Please review and ensure all guidelines are properly selected.
        </Text>
        <Text fontSize="xs" color="gray.400">
          These preferences will help generate accurate visual results.
        </Text>
      </VStack>
    </Box>
  );
};

export default ImageGuideline;
