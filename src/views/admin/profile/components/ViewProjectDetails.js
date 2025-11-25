import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  Spinner,
  useColorModeValue,
  Heading,
  Flex,
  Divider,
  Badge,
  Stack,
  SimpleGrid,
  AspectRatio,
  Avatar,
  HStack,
  VStack,
  Tag,
} from "@chakra-ui/react";
import { useParams, useLocation } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";
import { IconButton } from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const ProjectDetails = () => {
  const { id: projectId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("user_id");
const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue("gray.50", "navy.900");
  const cardBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  const headingColor = useColorModeValue("gray.900", "white");
  const shadowColor = useColorModeValue("md", "dark-lg");

  // ✅ Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!userId || !projectId) return;
      try {
        const res = await axiosInstance.get(
          `/project_details/?user_id=${userId}&project_id=${projectId}`
        );
        setProject(res.data.data.project);
      } catch (err) {
        console.error("Error fetching project details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [userId, projectId]);

  if (loading)
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Spinner size="xl" thickness="4px" color="teal.400" />
      </Flex>
    );

  if (!project)
    return (
      <Flex align="center" justify="center" minH="80vh">
        <Text fontSize="lg" color={textColor}>
          No project details found.
        </Text>
      </Flex>
    );

  // ✅ Color scheme for status badge
  const getStatusColor = (status) => {
    if (!status) return "gray";
    switch (status.toLowerCase()) {
      case "completed":
      case "passed":
        return "green";
      case "processing":
      case "in progress":
        return "yellow";
      case "failed":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Box
        bg={cardBg}
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        boxShadow={shadowColor}
        maxW="1400px"
        mx="auto"
        transition="0.3s"
        mt={10}
      >


        {/* ✅ Project Header */}
        <Flex justify="space-between" mb={8} w="100%" flexWrap="wrap" gap={6}>
          <VStack align="flex-start" spacing={2}>
            <HStack spacing={3}>
              <IconButton
    icon={<MdArrowBack />}
    aria-label="Go back"
    onClick={() => navigate(-1)}
    variant="ghost"
    fontSize="24px"
    mr={3}
  />
              <Heading
                color={headingColor}
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="extrabold"
              >
                {project.project_name}
              </Heading>

              {/* ✅ Status Badge beside title */}
              {project.status && (
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  colorScheme={getStatusColor(project.status)}
                  fontSize="0.9em"
                  textTransform="capitalize"
                >
                  {project.status}
                </Badge>
              )}
            </HStack>

            {/* ✅ Below the title: Project ID + Date + Status */}
            <VStack align="flex-start" spacing={1} mt={2}>
              <HStack spacing={3}>
                <Tag colorScheme="teal" borderRadius="full">
                  Project ID: {project.project_id}
                </Tag>
                <Tag colorScheme="gray">
                  Created:{" "}
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : "N/A"}
                </Tag>
              </HStack>

              {/* ✅ Status below Project ID */}
              {project.status && (
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color={
                    project.status.toLowerCase() === "failed"
                      ? "red.500"
                      : project.status.toLowerCase() === "processing"
                      ? "yellow.500"
                      : "green.500"
                  }
                >
                  Status: {project.status}
                </Text>
              )}
            </VStack>
          </VStack>

          {/* ✅ Owner Info */}
          <HStack
            spacing={4}
            bg={useColorModeValue("gray.100", "gray.700")}
            px={5}
            py={3}
            rounded="xl"
            boxShadow="sm"
            _hover={{ transform: "scale(1.02)" }}
            transition="0.2s"
          >
            <Avatar size="lg" name={project.owner?.username} />
            <Box>
              <Text fontWeight="bold" fontSize="md">
                {project.owner?.username}
              </Text>
              <Text fontSize="sm" color={textColor}>
                {project.owner?.email}
              </Text>
            </Box>
          </HStack>
        </Flex>

        <Divider mb={8} />

        {/* ✅ Project Assets */}
        <Heading size="md" mb={4} color={headingColor}>
          Project Assets
        </Heading>
        {project.project_assets?.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
            {project.project_assets.map((img, i) => (
              <Box
                key={i}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                _hover={{ transform: "scale(1.02)", transition: "0.3s" }}
              >
                <AspectRatio ratio={16 / 9}>
                  <Image src={img} alt={`Asset ${i + 1}`} objectFit="cover" />
                </AspectRatio>
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="gray.500" mb={10}>
            No assets available.
          </Text>
        )}

        {/* ✅ Project Creations */}
        <Heading size="md" mb={4} color={headingColor}>
          Project Creations
        </Heading>

        {project.creations?.length > 0 ? (
          project.creations.map((creation, index) => (
            <Box
              key={creation.creation_id}
              bg={useColorModeValue("gray.100", "gray.700")}
              p={{ base: 4, md: 6 }}
              borderRadius="xl"
              mb={6}
              boxShadow="base"
              transition="0.3s"
              _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
              w="100%"
            >
              <Flex justify="space-between" align="center" mb={4} wrap="wrap">
                <Heading size="sm" color={headingColor}>
                  Creation #{index + 1}
                </Heading>
                <Badge
                  px={3}
                  py={1}
                  borderRadius="full"
                  colorScheme={getStatusColor(creation.status)}
                >
                  {creation.status}
                </Badge>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} w="100%">
                {/* Video Preview */}
                <Box w="100%">
                  <Text fontWeight="bold" mb={2}>
                    Video Preview
                  </Text>
                  {creation.cloudinary_video_url ? (
                    <AspectRatio ratio={16 / 9}>
                      <video
                        controls
                        src={creation.cloudinary_video_url}
                        style={{
                          borderRadius: "10px",
                          width: "100%",
                          backgroundColor: "#000",
                        }}
                      />
                    </AspectRatio>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No video available.
                    </Text>
                  )}
                </Box>

                {/* Creation Details */}
                <Stack spacing={2} w="100%">
                  <Text>
                    <b>Sector:</b> {creation.sector || "—"}
                  </Text>
                  <Text>
                    <b>Goal:</b> {creation.goal || "—"}
                  </Text>
                  <Text>
                    <b>Context:</b> {creation.context || "—"}
                  </Text>
                  <Text>
                    <b>Key Instructions:</b> {creation.key_instructions || "—"}
                  </Text>
                  <Text>
                    <b>Duration:</b> {creation.duration || "—"} sec
                  </Text>

                  {creation.image_urls?.length > 0 && (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} mt={3}>
                      {creation.image_urls.map((img, i) => (
                        <Image
                          key={i}
                          src={img}
                          alt="creation"
                          borderRadius="md"
                          objectFit="cover"
                          boxShadow="sm"
                          w="100%"
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </Stack>
              </SimpleGrid>
            </Box>
          ))
        ) : (
          <Text color="gray.500">No creations found for this project.</Text>
        )}

        <Divider mt={10} mb={4} />

        <Text
          fontSize="sm"
          color={textColor}
          textAlign="center"
          mt={6}
          opacity={0.8}
        >
          © {new Date().getFullYear()} <b>Hygaar</b> | All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
