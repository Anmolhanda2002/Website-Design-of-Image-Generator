// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AdminNavbarLinks from "components/navbar/NavbarLinksAdmin";

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const changeNavbar = () => {
      setScrolled(window.scrollY > 1);
    };
    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const { secondary, message } = props;

  // Extract path segments
  const pathSegments = location.pathname.split("/").filter(Boolean);
  let brandText =
    pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "Dashboard";

  // Optional: mapping for better names
  const nameMap = {
    default: "Dashboard",
    users: "Users",
    settings: "Settings",
  };
  brandText = nameMap[brandText] || brandText;

  // Chakra color tokens
  let mainText = useColorModeValue("navy.700", "white");
  let secondaryText = useColorModeValue("gray.700", "white");
  let navbarBg = useColorModeValue(
    "rgba(244, 247, 254, 0.8)",
    "rgba(11,20,55,0.8)"
  );

  return (
    <Box
      position="fixed"
      boxShadow={scrolled ? "sm" : "none"}
      bg={navbarBg}
      borderColor="transparent"
      backdropFilter="blur(20px)"
      borderRadius="16px"
      borderWidth="1.5px"
      transition="all 0.25s linear"
      display={secondary ? "block" : "flex"}
      minH="75px"
      mx="auto"
      right={{ base: "12px", md: "30px" }}
      top={{ base: "12px", md: "20px" }}
      w={{
        base: "calc(100vw - 6%)",
        md: "calc(100vw - 8%)",
        xl: "calc(100vw - 350px)",
        "2xl": "calc(100vw - 365px)"
      }}
      px={{ sm: "15px", md: "10px" }}
      py="8px"
    >
      <Flex
        w="100%"
        flexDirection={{ sm: "column", md: "row" }}
        alignItems="center"
      >
        {/* Left: Breadcrumb + Title */}
        <Box mb={{ sm: "8px", md: "0px" }}>
          <Breadcrumb>
            <BreadcrumbItem color={secondaryText} fontSize="sm">
              <BreadcrumbLink color={secondaryText}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem color={secondaryText} fontSize="sm">
              <BreadcrumbLink
                color={secondaryText}
                textTransform="capitalize"
              >
                {brandText}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Link
            color={mainText}
            href="#"
            bg="inherit"
            fontWeight="bold"
            fontSize={{ base: "24px", md: "30px" }} // responsive
            textTransform="capitalize"
            _hover={{ color: mainText }}
            _focus={{ boxShadow: "none" }}
          >
            {brandText}
          </Link>
        </Box>

        {/* Right: Navbar Links */}
        <Box ms="auto" w={{ sm: "100%", md: "unset" }}>
          <AdminNavbarLinks
            onOpen={props.onOpen}
            logoText={props.logoText}
            secondary={props.secondary}
            fixed={props.fixed}
            scrolled={scrolled}
          />
        </Box>
      </Flex>

      {secondary ? <Text color="white">{message}</Text> : null}
    </Box>
  );
}

AdminNavbar.propTypes = {
  brandText: PropTypes.string,
  variant: PropTypes.string,
  secondary: PropTypes.bool,
  fixed: PropTypes.bool,
  onOpen: PropTypes.func,
};
