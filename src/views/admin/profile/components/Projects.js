// Chakra imports
import { Box, Text, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
// Assets
import Project1 from "assets/img/profile/Project1.png";
import Project2 from "assets/img/profile/Project2.png";
import Project3 from "assets/img/profile/Project3.png";
// Custom components
import Project from "views/admin/profile/components/Project";
import React from "react";

export default function Projects(props) {
  const textColorPrimary = useColorModeValue("gray.900", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");

  // Card shadow for hover
  const cardShadow = useColorModeValue(
    "0px 10px 25px rgba(0, 0, 0, 0.05)",
    "0px 10px 25px rgba(255, 255, 255, 0.1)"
  );

  return (
    <Box w="100%" px={{ base: 2, md: 4 }} py={4}>
      {/* Section: Today */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColorPrimary} mb={2}>
          Today
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <Project
            image={Project1}
            title="Technology behind the Blockchain"
            link="#"
            boxShadow={cardShadow}
          />
          <Project
            image={Project2}
            title="Greatest way to a good Economy"
            link="#"
            boxShadow={cardShadow}
          />
        </SimpleGrid>
      </Box>

      {/* Section: This Week */}
      <Box mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color={textColorPrimary} mb={2}>
          This Week
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <Project
            image={Project3}
            title="Most essential tips for Burnout"
            link="#"
            boxShadow={cardShadow}
          />
          <Project
            image={Project1}
            title="Technology behind the Blockchain"
            link="#"
            boxShadow={cardShadow}
          />
        </SimpleGrid>
      </Box>
    </Box>
  );
}
