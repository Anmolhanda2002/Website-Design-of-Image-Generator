import React from "react";
import { Flex, Box, Text, Image, useColorModeValue } from "@chakra-ui/react";
import Logo from "../../assets/image.png"; // Replace with your actual logo path

const AuthLayout = ({ children, projectName = "Hygaar" }) => {
  const textColor = useColorModeValue("white", "white");
  const rightBg = useColorModeValue("gray.50", "navy.900");

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
        {/* Logo Image */}
        <Box
          mt={-20}
          w="120px"
          h="120px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb="6"
          borderRadius="full"
          bg="white"
          boxShadow="lg"
        >
          <Image
            src={Logo}
            alt={`${projectName} Logo`}
            borderRadius="full"
            objectFit="cover"
          />
        </Box>

        {/* Welcome Message */}
        <Text
          fontSize="3xl"
          fontWeight="bold"
          mb="2"
          textAlign="center"
          fontFamily="var(--chakra-fonts-heading)"
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

        {/* Optional Decorative Image */}
        {/* <Image
          src="https://undraw.co/api/illustrations/login.svg" // Replace with your illustration if needed
          alt="Welcome Illustration"
          mt={8}
          maxW="250px"
        /> */}
      </Flex>

      {/* Right Section (Auth Form) */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        h="100%"
        align="center"
        justify="center"
        bg={rightBg}
        p="8"
      >
        {children} {/* Render login/signup forms here */}
      </Flex>
    </Flex>
  );
};

export default AuthLayout;
