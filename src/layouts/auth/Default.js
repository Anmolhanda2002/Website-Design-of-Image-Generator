// Chakra imports
import { Box, Flex } from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Custom components
import Footer from "components/footer/FooterAuth";
import FixedPlugin from "components/fixedPlugin/FixedPlugin";
import AuthLayout from "./SignUpLayout";

function AuthIllustration(props) {
  const { children, illustrationBackground } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    // don't render anything while checking
    return null;
  }

  return (
    <Flex position="relative" h="max-content">
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
        {children}
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
      </Flex>
      <FixedPlugin />
    </Flex>
  );
}

AuthIllustration.propTypes = {
  illustrationBackground: PropTypes.string,
  image: PropTypes.any,
};

export default AuthIllustration;
