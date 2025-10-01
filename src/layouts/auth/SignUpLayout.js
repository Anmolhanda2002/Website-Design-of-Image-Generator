import React from "react";
import { Flex, Box, Text, Image, useColorModeValue } from "@chakra-ui/react";

const AuthLayout = ({ children, projectName = "My Project" }) => {
  const textColor = useColorModeValue("white", "white");

  return (
    <Flex
      w="100vw"
      h="100vh"
      direction={{ base: "column", md: "row" }}
      fontFamily="'DM Sans', sans-serif"
    >
      {/* Left Section (Branding / Welcome) */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        h="100%"
        align="center"
        justify="center"
        bgGradient="linear(to-b, #4e54c8, #8f94fb)"
        direction="column"
        color={textColor}
        p="12"
        borderBottomLeftRadius={{ base: "0", md: "250px" }}
      >
        {/* Logo Image Placeholder */}
        <Box
          bg="white"
          borderRadius="full"
          mt={-20}
          w="120px"
          h="120px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="6"
          boxShadow="lg"
        >
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="#4e54c8"
            fontFamily="'DM Sans', sans-serif"
          >
            {projectName.charAt(0)}
          </Text>
        </Box>

        {/* Welcome Message in One Line */}
        <Text
          fontSize="3xl"
          fontWeight="bold"
          mb="2"
          textAlign="center"
          fontFamily="var(--chakra-fonts-heading)" // 👈 updated font
        >
          Welcome to {projectName}
        </Text>

        {/* Tagline */}
        <Text
          fontSize="md"
          mt="2"
          opacity="0.9"
          textAlign="center"
          maxW="300px"
        >
          Empowering your journey with modern tools & a beautiful experience.
        </Text>

        {/* Decorative Image / Illustration */}
       
      </Flex>

      {/* Right Section (Auth Form) */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        h="100%"
        align="center"
        justify="center"
        bg={useColorModeValue("gray.50", "navy.900")}
        p="8"
      >
    
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
