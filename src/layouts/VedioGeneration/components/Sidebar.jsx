import React from "react";
import { VStack, Button, Icon, Text, useColorModeValue, Box } from "@chakra-ui/react";
import {
  MdBrush,
  MdCrop,
  MdMovie,
  MdViewInAr,
  MdEdit,
  MdTextFields,
  MdVideoLibrary,
  MdPhotoLibrary,
  MdMergeType,
  MdVolumeUp,
} from "react-icons/md";

export default function Sidebar({ activeTab, setActiveTab }) {
  const sidebarItems = [
    { name: "Image Creation", icon: MdBrush },
    { name: "Resize Image", icon: MdCrop },
    { name: "Image to Video", icon: MdMovie },
    { name: "Creatomate", icon: MdViewInAr },
    { name: "Edit Video", icon: MdEdit },
    { name: "Caption Segment", icon: MdTextFields },
    { name: "Captioned Edit", icon: MdVideoLibrary },
    { name: "Collage Video", icon: MdPhotoLibrary },
    { name: "Merge Video", icon: MdMergeType },
    { name: "Resize Merge", icon: MdCrop },
    { name: "Add Music", icon: MdVolumeUp },
  ];

  const sidebarBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const activeBg = useColorModeValue("blue.500", "blue.400");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      w="100%" // smaller width
      h="calc(100vh - 70px)"
      bg={sidebarBg}
      borderRight="1px solid"
      borderColor={borderColor}
      position="sticky"
      top="70px"
      overflowY="auto"
      overflowX="hidden"
      sx={{
        "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
        "-ms-overflow-style": "none",
        "scrollbar-width": "none",
      }}
    >
      <VStack spacing={1} align="stretch" p={1}>
        {sidebarItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            onClick={() => setActiveTab(item.name)}
            bg={activeTab === item.name ? activeBg : "transparent"}
            color={activeTab === item.name ? "white" : inactiveColor}
            w="100%"
            h="50px" // smaller height
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            p={1}
            _hover={{ bg: activeTab === item.name ? activeBg : hoverBg }}
          >
            <Icon as={item.icon} boxSize={4} mb={0.5} /> {/* smaller icon */}
            <Text fontSize="xx-small" textAlign="center" noOfLines={2}>
              {item.name}
            </Text>
          </Button>
        ))}
      </VStack>
    </Box>
  );
}
