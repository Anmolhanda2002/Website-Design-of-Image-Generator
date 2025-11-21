import {
  Box,
  Text,
  SimpleGrid,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import Project from "views/admin/profile/components/Project";
import { useNavigate } from "react-router-dom";

export default function Projects({ projects, loading, userId }) {
  const navigate = useNavigate();
  const textColor = useColorModeValue("gray.900", "white");
  const cardShadow = useColorModeValue(
    "0px 10px 25px rgba(0,0,0,0.05)",
    "0px 10px 25px rgba(255,255,255,0.1)"
  );

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
    }) : "";

const handleClick = (projectId) => {
  navigate(`/admin/projectdetails/${projectId}?user_id=${userId}`);
};

  

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box w="100%" px={{ base: 2, md: 4 }} py={4}>
      <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={4}>
        Saved Projects
      </Text>
      {projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {projects.map((p) => (
            <Box
              key={p.project_id}
              cursor="pointer"
              onClick={() => handleClick(p.project_id)}
              transition="all 0.2s"
               borderRadius="50px" 
              _hover={{ transform: "scale(1.03)", boxShadow: cardShadow }}
            >
              <Project
                image={p.image_urls?.[0]}
                title={p.project_name}
                subtitle={`Created on ${formatDate(p.created_at)}`}
              />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Text color="gray.500">No projects found.</Text>
      )}
    </Box>
  );
}
