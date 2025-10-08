// Chakra imports
import {
  Box,
  Text,
  SimpleGrid,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import Project from "views/admin/profile/components/Project";

export default function Projects({ projects, loading }) {
  const textColorPrimary = useColorModeValue("gray.900", "white");

  // Card shadow for hover
  const cardShadow = useColorModeValue(
    "0px 10px 25px rgba(0, 0, 0, 0.05)",
    "0px 10px 25px rgba(255, 255, 255, 0.1)"
  );

  // Format created_at date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const formatted = dateString.replace(",", " ");
      const date = new Date(formatted);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box w="100%" textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box w="100%" px={{ base: 2, md: 4 }} py={4}>
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColorPrimary} mb={4}>
          Saved Projects
        </Text>

        {projects && projects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {projects.map((project) => (
              <Project
                key={project.project_id}
                image={project.image_urls?.[0] || ""}
                title={project.project_name}
                subtitle={
                  <Text fontSize="sm" color="gray.500">
                    Created on {formatDate(project.created_at)}
                  </Text>
                }
                link={`/projects/${project.project_id}`}
                boxShadow={cardShadow}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Text fontSize="md" color="gray.500">
            No projects found.
          </Text>
        )}
      </Box>
    </Box>
  );
}
