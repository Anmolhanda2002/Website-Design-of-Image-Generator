import React, { useContext } from "react";

// Chakra imports
import {
  Box,
  Flex,
  Drawer,
  DrawerBody,
  Icon,
  useColorModeValue,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import Content from "components/sidebar/components/Content";
import {
  renderThumb,
  renderTrack,
  renderView,
} from "components/scrollbar/Scrollbar";
import { Scrollbars } from "react-custom-scrollbars-2";
import PropTypes from "prop-types";

// Assets
import { IoMenuOutline } from "react-icons/io5";
import { SidebarContext } from "contexts/SidebarContext";

function Sidebar(props) {
  const { routes } = props;

  console.log("routes",routes)

  let variantChange = "0.2s linear";
  let shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.08)",
    "unset"
  );
  let sidebarBg = useColorModeValue("white", "navy.800");
  let sidebarMargins = "0px";

  // Desktop Sidebar
  return (
    <Box
      display={{ base: "none", xl: "block" }}
      w="100%"
      position="fixed"
      minH="100%"
    >
      <Box
        bg={sidebarBg}
        transition={variantChange}
        w="300px"
        h="100vh"
        m={sidebarMargins}
        minH="100%"
        overflowX="hidden"
        boxShadow={shadow}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <Content routes={routes} />
        </Scrollbars>
      </Box>
    </Box>
  );
}

// Responsive Sidebar (Drawer)
export function SidebarResponsive(props) {
  const { routes } = props;
  const sidebarBackgroundColor = useColorModeValue("white", "navy.800");
  const menuColor = useColorModeValue("gray.400", "white");

  // Access SidebarContext
  const { toggleSidebar, setToggleSidebar } = useContext(SidebarContext);

  return (
    <Flex display={{ base: "flex", xl: "none" }} alignItems="center">
      {/* Hamburger Button */}
      <Flex
        w="max-content"
        h="max-content"
        onClick={() => setToggleSidebar(true)}
      >
        <Icon
          as={IoMenuOutline}
          color={menuColor}
          my="auto"
          w="20px"
          h="20px"
          me="10px"
          _hover={{ cursor: "pointer" }}
        />
      </Flex>

      {/* Drawer */}
      <Drawer
        isOpen={toggleSidebar}
        onClose={() => setToggleSidebar(false)}
        placement={document.documentElement.dir === "rtl" ? "right" : "left"}
      >
        <DrawerOverlay />
        <DrawerContent w="285px" maxW="285px" bg={sidebarBackgroundColor}>
          <DrawerCloseButton
            zIndex="3"
            onClick={() => setToggleSidebar(false)}
            _focus={{ boxShadow: "none" }}
            _hover={{ boxShadow: "none" }}
          />
          <DrawerBody maxW="285px" px="0rem" pb="0">
            <Scrollbars
              autoHide
              renderTrackVertical={renderTrack}
              renderThumbVertical={renderThumb}
              renderView={renderView}
            >
              <Content routes={routes} />
            </Scrollbars>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}

Sidebar.propTypes = {
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  variant: PropTypes.string,
};

export default Sidebar;
