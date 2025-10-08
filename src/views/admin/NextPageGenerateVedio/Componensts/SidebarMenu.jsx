import React from "react";
import { Box, VStack, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { FaMagic, FaExchangeAlt, FaCube, FaVideo, FaVolumeUp } from "react-icons/fa";

const menuItems = [
  { label: "Template", icon: FaMagic },
  { label: "Transition", icon: FaExchangeAlt },
  { label: "Fusion", icon: FaCube },
  { label: "Extend", icon: FaVideo },
  { label: "Sound", icon: FaVolumeUp },
];

const SidebarMenu = ({ active, setActive }) => {
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.300");

  return (
    <Box w="80px" bg={useColorModeValue("white", "#1B254B")} p={4} borderRight="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")}>
      <VStack spacing={6}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <Flex
              key={item.label}
              direction="column"
              align="center"
              cursor="pointer"
              bg={isActive ? "blue.500" : "transparent"}
              _hover={{ bg: isActive ? "blue.600" : hoverBg }}
              color={isActive ? "white" : textColor}
              p={2}
              borderRadius="md"
              onClick={() => setActive(item.label)}
            >
              <Text fontSize="xs" mb={1}>{item.label}</Text>
              <Icon size={24} />
            </Flex>
          );
        })}
      </VStack>
    </Box>
  );
};

export default SidebarMenu;
