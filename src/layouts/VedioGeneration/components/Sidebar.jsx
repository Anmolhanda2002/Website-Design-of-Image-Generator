import React from "react";
import {
  VStack,
  Button,
  Icon,
  Text,
  useColorModeValue,
  Box,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import {
  MdBrush,
  MdCrop,
  MdMovie,
  MdEdit,
  MdTextFields,
  MdVideoLibrary,
  MdMergeType,
  MdVolumeUp,
  MdMenu,
MdPhotoLibrary
} from "react-icons/md";
// import { MdPhotoLibrary } from "react-icons/md";
// ✅ Sidebar Items
export const sidebarItems = [
  { name: "Bulk Image", icon: MdPhotoLibrary },
  { name: "Image Creation", icon: MdBrush },
  { name: "Resize Image", icon: MdCrop },
  { name: "Image to Video", icon: MdMovie },
  { name: "Edit Video", icon: MdEdit },
  { name: "Caption Segment", icon: MdTextFields },
  { name: "Captioned Edit", icon: MdVideoLibrary },
  { name: "Merge Video", icon: MdMergeType },
  { name: "Add Music", icon: MdVolumeUp },
];

// ✅ DESKTOP SIDEBAR
export default function Sidebar({ activeTab, setActiveTab }) {
  const sidebarBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const activeBg = useColorModeValue("blue.500", "blue.400");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem("activeTab", tabName);
  };

  return (
    <Box
      w="100%"
      h="calc(100vh - 70px)"
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor={borderColor}
      overflowY="auto"
      overflowX="hidden"
      sx={{
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <VStack spacing={1} align="stretch" p={2}>
        {sidebarItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => handleTabChange(item.name)}
            bg={activeTab === item.name ? activeBg : "transparent"}
            color={activeTab === item.name ? "white" : inactiveColor}
            w="100%"
            h="65px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            transition="all 0.2s ease"
            _hover={{
              bg: activeTab === item.name ? activeBg : hoverBg,
              color: activeTab === item.name ? "white" : "inherit",
            }}
            _active={{ bg: activeBg }}
          >
            <Icon as={item.icon} boxSize={5} mb={1} />
            <Text
              fontSize="10px"
              textAlign="center"
              lineHeight="1.2"
              noOfLines={2}
              fontWeight={activeTab === item.name ? "semibold" : "normal"}
            >
              {item.name}
            </Text>
          </Button>
        ))}
      </VStack>
    </Box>
  );
}

// ✅ MOBILE MENU BUTTON (Top Navbar)
export function MobileMenuButton({ onOpen }) {
  const iconColor = useColorModeValue("blue.500", "blue.400");
  const hoverColor = useColorModeValue("blue.600", "blue.300");

  return (
    <IconButton
      icon={<MdMenu size={22} />}
      onClick={onOpen}
      aria-label="Open Menu"
      size="md"
      variant="ghost"
      color={iconColor}
      _hover={{ color: hoverColor }}
      display={{ base: "flex", md: "none" }} // show only on mobile
    />
  );
}

// ✅ MOBILE SIDEBAR ITEMS (Used inside Drawer)
export function MobileSidebarItems({ activeTab, setActiveTab, onClose }) {
  const activeBg = useColorModeValue("blue.500", "blue.400");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const inactiveColor = useColorModeValue("gray.700", "gray.200");

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    localStorage.setItem("activeTab", tabName);
    if (onClose) onClose();
  };

  return (
    <VStack spacing={1.5} align="stretch" p={4}>
      {sidebarItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={() => handleTabClick(item.name)}
          bg={activeTab === item.name ? activeBg : "transparent"}
          color={activeTab === item.name ? "white" : inactiveColor}
          justifyContent="flex-start"
          borderRadius="md"
          p={3}
          h="50px"
          fontWeight={activeTab === item.name ? "semibold" : "medium"}
          transition="all 0.2s ease"
          _hover={{
            bg: activeTab === item.name ? activeBg : hoverBg,
            color: activeTab === item.name ? "white" : "inherit",
          }}
        >
          <HStack spacing={3}>
            <Icon as={item.icon} boxSize={5} />
            <Text>{item.name}</Text>
          </HStack>
        </Button>
      ))}
    </VStack>
  );
}
