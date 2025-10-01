import React from "react";
import { Flex, Heading, Text, Button, useColorModeValue } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import illustration from "assets/img/auth/auth.png"; // replace with an unauthorized illustration if available

const Unauthorized = () => {
  const navigate = useNavigate();
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = useColorModeValue("gray.500", "gray.400");
  const bgColor = useColorModeValue("gray.50", "navy.800");

  return (
    <Flex
      w="100vw"
      h="100vh"
      bg={bgColor}
      justify="center"
      align="center"
      px={{ base: 4, md: 8 }}
      flexDirection={{ base: "column", md: "row" }}
    >
      <Flex
        direction="column"
        align="center"
        textAlign="center"
        maxW="500px"
        me={{ md: 20 }}
        mb={{ base: 8, md: 0 }}
      >
        <Heading fontSize={{ base: "6xl", md: "8xl" }} color={textColor}>
          401
        </Heading>
        <Text fontSize={{ base: "lg", md: "xl" }} color={textColorSecondary} mb={6}>
          You are not authorized to access this page.
        </Text>
        <Button
          colorScheme="brandScheme"
          size="lg"
          onClick={() => navigate("/")}
        >
          Go Home
        </Button>
      </Flex>
      <Flex>
        <img
          src={illustration}
          alt="Unauthorized illustration"
          style={{ maxWidth: "400px", width: "100%", height: "auto" }}
        />
      </Flex>
    </Flex>
  );
};

export default Unauthorized;
