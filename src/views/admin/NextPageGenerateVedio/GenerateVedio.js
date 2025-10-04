import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  VStack,
  useColorModeValue,
  useBreakpointValue,
  Input,
  FormControl,
  FormLabel,
  Select,
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
  const [projectName, setProjectName] = useState(""); // editable project name

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
      h="100vh"
      w="100%"
      direction={isMobile ? "column" : "row"}
      style={{ marginTop: "100px" }}
    >
      {/* Left Sidebar */}
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
        {/* Editable Project Name */}
        <Input
          textAlign="center"
          fontSize="2xl"
          fontWeight="bold"
          mb={4}
          variant="flushed"
          placeholder="Enter Project Name..."
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          _placeholder={{ color: useColorModeValue("gray.500", "gray.400") }}
          color={useColorModeValue("gray.800", "white")}
        />

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
            {projectName ? projectName : "No Project"} - {active} Preview Area
          </Text>
        </Flex>

        {/* Text Input */}
        <Box>
          <TextFieldComponent />
        </Box>
      </Flex>

      {/* Right Sidebar (only for Template) */}
      {active === "Template" && (
        <Box
          w={isMobile ? "100%" : "260px"}
          bg={bgSidebar}
          p={4}
          borderLeft={isMobile ? "none" : "1px solid"}
          borderTop={isMobile ? "1px solid" : "none"}
          borderColor={sidebarBorder}
        >
          <VStack align="stretch" spacing={4}>
            {/* Video Name */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                Video Name
              </FormLabel>
              <Input placeholder="Enter video name" />
            </FormControl>

            {/* Goal Option */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                Goal
              </FormLabel>
              <Select placeholder="Select goal">
                <option value="awareness">Awareness</option>
                <option value="engagement">Engagement</option>
                <option value="conversion">Conversion</option>
              </Select>
            </FormControl>

            {/* Sector Option */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                Sector
              </FormLabel>
              <Select placeholder="Select sector">
                <option value="education">Education</option>
                <option value="finance">Finance</option>
                <option value="health">Healthcare</option>
                <option value="tech">Technology</option>
              </Select>
            </FormControl>

            {/* Dimension Option */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                Dimension
              </FormLabel>
              <Select placeholder="Select dimension">
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="4:3">4:3 (Standard)</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="9:16">9:16 (Vertical)</option>
              </Select>
            </FormControl>
          </VStack>
        </Box>
      )}
    </Flex>
  );
};

export default DashboardPage;
