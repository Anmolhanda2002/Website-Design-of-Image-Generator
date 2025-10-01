import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FaMagic,
  FaExchangeAlt,
  FaCube,
  FaVolumeUp,
  FaVideo,
} from "react-icons/fa";
import TextFieldComponent from "../profile/components/TextField";

const DashboardPage = () => {
  const [active, setActive] = useState("Template"); // default selected

  // Sidebar colors
  const bgSidebar = useColorModeValue("white", "#1B254B");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");

  // Main content colors
  const bgMain = useColorModeValue("gray.50", "#111936");
  const cardBg = useColorModeValue("white", "#1B254B");
  const cardText = useColorModeValue("gray.600", "gray.300");

  // Colors for sidebar items
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

  const menuItems = [
    { label: "Template", icon: FaMagic },
    { label: "Transition", icon: FaExchangeAlt },
    { label: "Fusion", icon: FaCube },
    { label: "Extend", icon: FaVideo },
    { label: "Sound", icon: FaVolumeUp },
  ];

  // Detect small screen to switch sidebar layout
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      h="80vh"
      w="100%"
      direction={isMobile ? "column" : "row"}
      style={{ marginTop: "100px" }}
    >
      {/* Sidebar */}
      <Box
        w={isMobile ? "100%" : "200px"}
        bg={bgSidebar}
        color={useColorModeValue("gray.800", "white")}
        p={4}
        borderRight={isMobile ? "none" : "1px solid"}
        borderBottom={isMobile ? "1px solid" : "none"}
        borderColor={sidebarBorder}
      >
        <Flex direction={isMobile ? "row" : "column"} overflowX="auto">
          <VStack
            align={isMobile ? "center" : "start"}
            spacing={isMobile ? 0 : 3}
            w="full"
            flexDirection={isMobile ? "row" : "column"}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.label;
              return (
                <Flex
                  key={item.label}
                  align="center"
                  gap={2}
                  px={isMobile ? 2 : 3}
                  py={isMobile ? 1 : 2}
                  borderRadius="md"
                  cursor="pointer"
                  bg={isActive ? "blue.500" : "transparent"}
                  _hover={{
                    bg: isActive ? "blue.600" : hoverBg,
                  }}
                  color={isActive ? "white" : textColor}
                  onClick={() => setActive(item.label)}
                >
                  <Icon />
                  {!isMobile && (
                    <Text fontWeight={isActive ? "bold" : "normal"}>
                      {item.label}
                    </Text>
                  )}
                </Flex>
              );
            })}
          </VStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex flex="1" direction="column" p={4} bg={bgMain} overflowY="auto">
        {/* Video Preview Box */}
        <Flex
          flex="1"
          justify="center"
          align="center"
          bg={cardBg}
          borderRadius="md"
          boxShadow="md"
          mb={4}
          minH="200px"
        >
          <Text fontSize="lg" color={cardText}>
            {active} Preview Area
          </Text>
        </Flex>

        {/* Text Input */}
        <Box>
          <TextFieldComponent />
        </Box>
      </Flex>
    </Flex>
  );
};

export default DashboardPage;
