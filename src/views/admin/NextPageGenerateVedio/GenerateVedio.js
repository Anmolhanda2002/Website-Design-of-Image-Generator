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
  const [active, setActive] = useState("Template");
  const [projectName, setProjectName] = useState("");

  const bgSidebar = useColorModeValue("white", "#1B254B");
  const sidebarBorder = useColorModeValue("gray.200", "gray.700");

  const bgMain = useColorModeValue("gray.50", "#111936");
  const cardBg = useColorModeValue("white", "#1B254B");
  const cardText = useColorModeValue("gray.600", "gray.300");

  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

  const menuItems = [
    { label: "Template", icon: FaMagic },
    { label: "Transition", icon: FaExchangeAlt },
    { label: "Fusion", icon: FaCube },
    { label: "Extend", icon: FaVideo },
    { label: "Sound", icon: FaVolumeUp },
  ];

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      h="100vh"
      w="100%"
      direction={isMobile ? "column" : "row"}
      style={{ marginTop: "100px" }}
    >
      {/* Left Navbar */}
      <Box
        w={isMobile ? "100%" : "80px"}
        bg={bgSidebar}
        color={useColorModeValue("gray.800", "white")}
        p={4}
        borderRight={isMobile ? "none" : "1px solid"}
        borderBottom={isMobile ? "1px solid" : "none"}
        borderColor={sidebarBorder}
      >
        <VStack spacing={4} align="center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.label;
            return (
              <Flex
                key={item.label}
                direction="column"
                align="center"
                justify="center"
                w="60px"
                h="60px"
                borderRadius="md"
                cursor="pointer"
                bg={isActive ? "blue.500" : "transparent"}
                _hover={{ bg: isActive ? "blue.600" : hoverBg }}
                color={isActive ? "white" : textColor}
                onClick={() => setActive(item.label)}
              >
                <Icon size={24} />
                <Text fontSize="xs" mt={1} textAlign="center">
                  {item.label}
                </Text>
              </Flex>
            );
          })}
        </VStack>
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

        {/* Preview Box */}
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

      {/* Right Sidebar (Template only) */}
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
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="bold">
                Video Name
              </FormLabel>
              <Input placeholder="Enter video name" />
            </FormControl>

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
