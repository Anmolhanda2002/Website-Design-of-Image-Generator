// Chakra imports
import { Box, Flex, Text, Image, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Custom components
import FixedPlugin from "components/fixedPlugin/FixedPlugin";
import Logo from "../../assets/image.png"; // replace with your logo
import AuthLayout from "./SignUpLayout"; // kept for large screens

function AuthIllustration({ children }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Detect if screen is large (≥ 950px)
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });

  const textColor = useColorModeValue("white", "white");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      // Redirect based on role
      if (user.roles?.includes("Administrator")) navigate("/admin/dashboard", { replace: true });
      else if (user.roles?.includes("User") || user.role === "Standard User") navigate("/user/dashboard", { replace: true });
      else navigate("/", { replace: true });
    } else {
      setLoading(false); // allow rendering of auth layout if no user
    }
  }, [navigate]);

  if (loading) return null;

  return (
    <Flex position="relative" h="max-content" direction="column">
      <Flex
        h={{ sm: "initial", md: "unset", lg: "100vh", xl: "97vh" }}
        w="100%"
        maxW={{ md: "66%", lg: "1313px" }}
        mx="auto"
        pt={{ sm: "50px", md: "0px" }}
        px={{ lg: "30px", xl: "0px" }}
        ps={{ xl: "70px" }}
        justifyContent="start"
        direction="column"
      >
        {/* Show logo + welcome above children for small screens */}
        {!isLargeScreen && (
          <Flex
            direction="column"
            align="center"
            mb={6}
            textAlign="center"
            w="100%"
          >
            <Box
              w="120px"
              h="120px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={4}
              borderRadius="full"
              bg="white"
              boxShadow="lg"
            >
              <Image src={Logo} alt="Hygaar Logo" borderRadius="full" objectFit="cover" />
            </Box>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Welcome to Hygaar
            </Text>
          </Flex>
        )}

        {children}

        {/* Show AuthLayout only on large screens */}
        {isLargeScreen && (
          <Box
            display={{ base: "none", md: "block" }}
            h="100%"
            minH="100vh"
            w={{ lg: "50vw", "2xl": "44vw" }}
            position="absolute"
            right="0px"
          >
            <AuthLayout />
          </Box>
        )}
      </Flex>

      <FixedPlugin />
    </Flex>
  );
}

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
  children: PropTypes.node,
};

export default AuthIllustration;
