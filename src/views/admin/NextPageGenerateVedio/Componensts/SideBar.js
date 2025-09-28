import { Box, VStack, IconButton, useColorModeValue } from "@chakra-ui/react";
import { FiHome, FiLayers, FiSettings, FiBell, FiUser } from "react-icons/fi";

const Sidebar = () => {
  const sidebarBg = useColorModeValue("gray.100", "gray.900");

  return (
    <Box
      w="70px"
      bg={sidebarBg}
      py={4}
      px={2}
      borderRight="1px solid"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      overflowY="auto"
      h="100vh"
    >
      <VStack spacing={4}>
        <IconButton aria-label="Home" icon={<FiHome />} size="lg" variant="ghost" />
        <IconButton aria-label="Projects" icon={<FiLayers />} size="lg" variant="ghost" />
        <IconButton aria-label="Notifications" icon={<FiBell />} size="lg" variant="ghost" />
        <IconButton aria-label="Users" icon={<FiUser />} size="lg" variant="ghost" />
        <IconButton aria-label="Settings" icon={<FiSettings />} size="lg" variant="ghost" />
      </VStack>
    </Box>
  );
};

export default Sidebar;
