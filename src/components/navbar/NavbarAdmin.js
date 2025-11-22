// Chakra Imports
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import AdminNavbarLinks from "components/navbar/NavbarLinksAdmin";
import routes from "routes.js";

export default function AdminNavbar(props) {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const changeNavbar = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const { secondary, message } = props;

  const getRouteName = (pathname) => {
    const cleanPath = pathname
      .replace(/\/admin/, "")
      .replace(/\/auth/, "")
      .replace(/\/videocreate/, "");

    const matchRoute = routes.find((route) =>
      cleanPath.startsWith(route.path.split("/:")[0])
    );

    return matchRoute ? matchRoute.name : "Dashboard";
  };

  const generateBreadcrumbs = () => {
    const pathParts = location.pathname.split("/").filter(Boolean);

    let linkPath = "";
    return pathParts.map((part, index) => {
      linkPath += "/" + part;
      const name = getRouteName(linkPath);

      return (
        <BreadcrumbItem key={index}>
          <BreadcrumbLink
            as={RouterLink}
            to={linkPath}
            textTransform="capitalize"
          >
            {name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    });
  };

  const brandText = getRouteName(location.pathname);

  let mainText = useColorModeValue("navy.700", "white");
  let secondaryText = useColorModeValue("gray.600", "gray.300");
  let navbarBg = useColorModeValue("rgba(244,247,254,0.8)", "rgba(11,20,55,0.8)");

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
        "2xl": "calc(100vw - 365px)",
      }}
      px={{ sm: "15px", md: "10px" }}
      py="8px"
    >
      <Flex
        w="100%"
        flexDirection={{ sm: "column", md: "row" }}
        alignItems="center"
      >
        <Box mb={{ sm: "8px", md: "0px" }}>
          {/* Breadcrumb */}
          <Breadcrumb color={secondaryText} fontSize="sm">
            {/* <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/admin/default">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem> */}
            {generateBreadcrumbs()}
          </Breadcrumb>

          {/* Page Heading */}
          <Link
            color={mainText}
            href="#"
            fontWeight="bold"
            fontSize={{ base: "24px", md: "30px" }}
            textTransform="capitalize"
            _hover={{ color: mainText }}
          >
            {brandText}
          </Link>
        </Box>

        {/* Right Side */}
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
