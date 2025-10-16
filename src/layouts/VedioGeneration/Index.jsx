import React, { useState } from "react";
import {
  Flex,
  Box,
  Button,
  Text,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Panel from "./components/Panel";
import PreviewArea from "./components/Privewarea";
import Image from "assets/image.png"
export default function PixVerseLayout() {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const [activeTab, setActiveTab] = useState("Image Creation");
  const [model, setModel] = useState("V5");
  const [duration, setDuration] = useState("8s");
  const [resolution, setResolution] = useState("360P");
  const [ratio, setRatio] = useState("16:9");

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({});
  const [sending, setSending] = useState(false);

  const navbarBg = useColorModeValue("white", "gray.800");
  const isMobile = useBreakpointValue({ base: true, md: false });
const mobileTabBg = useColorModeValue("gray.100", "gray.700");
const contentBg = useColorModeValue("gray.50", "gray.900");
  return (
    <Flex direction="column" h="100vh" overflow="hidden">
      {/* ---------- Navbar ---------- */}
      <Flex
        h="70px"
        px={6}
        py={3}
        bg={navbarBg}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        flexShrink={0}
      >
        {/* Left Section */}
        <Flex align="center" gap={4}>
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            size="sm"
            bg={useColorModeValue("blue.500", "blue.400")}
            color="white"
            _hover={{ bg: useColorModeValue("blue.600", "blue.500") }}
            p={2}
            borderRadius="full"
          >
            <MdArrowBack size={18} />
          </Button>

          {/* Logo + Name */}
          <Flex align="center" gap={2}>
            <Box
              as="img"
              src={Image}
              alt="Hygaar Logo"
              boxSize="30px"
              borderRadius="md"
            />
            <Text fontSize="lg" fontWeight="bold">
              Hygaar
            </Text>
          </Flex>
        </Flex>

        {/* Mode Toggle */}
        <Button
          onClick={toggleColorMode}
          size="sm"
          variant="ghost"
          p={2}
          borderRadius="full"
        >
          {colorMode === "light" ? "🌙" : "☀️"}
        </Button>
      </Flex>

      {/* ---------- Body Layout ---------- */}
      {isMobile ? (
        /* ===== Mobile Layout ===== */
        <Flex direction="column" flex="1" overflow="auto" p={3} gap={4}>
          <PreviewArea
            text={text}
            setText={setText}
            images={images}
            setImages={setImages}
            loadingImages={loadingImages}
            setLoadingImages={setLoadingImages}
            sending={sending}
            setSending={setSending}
            model={model}
            duration={duration}
            resolution={resolution}
            ratio={ratio}
          />

          {/* Mobile Tabs */}
        <Flex
  justify="space-around"
  bg={mobileTabBg}
  borderRadius="md"
  py={2}
  boxShadow="sm"
>
  {["Template", "Transition", "Fusion", "Extend", "Sound"].map((tab) => (
    <Button
      key={tab}
      size="sm"
      variant={activeTab === tab ? "solid" : "ghost"}
      colorScheme="blue"
      onClick={() => setActiveTab(tab)}
    >
      {tab}
    </Button>
  ))}
</Flex>


          <Panel
            activeTab={activeTab}
            model={model}
            setModel={setModel}
            duration={duration}
            setDuration={setDuration}
            resolution={resolution}
            setResolution={setResolution}
            ratio={ratio}
            setRatio={setRatio}
          />
        </Flex>
      ) : (
        /* ===== Desktop Layout ===== */
        <Flex flex="1" overflow="hidden">
          {/* Sidebar (scrollable, hidden scrollbar) */}
          <Box
            w="100px"
            h="calc(100vh - 70px)"
            overflowY="auto"
            sx={{
              "::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </Box>

          {/* Main content area */}
          <Flex flex="1" overflow="hidden">
    {/* Panel (scrollable, no scrollbar visible) */}
    <Box
      w={{ base: "100%", md: "350px" }}
      h="calc(100vh - 70px)"
      overflowY="auto"
      p={4}
      sx={{
        "::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <Panel
        activeTab={activeTab}
        model={model}
        setModel={setModel}
        duration={duration}
        setDuration={setDuration}
        resolution={resolution}
        setResolution={setResolution}
        ratio={ratio}
        setRatio={setRatio}
      />
    </Box>

    {/* Preview Area (fixed full height) */}
    <Box
      flex="1"
      h="calc(100vh - 70px)"
      p={6}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <PreviewArea
        text={text}
        setText={setText}
        images={images}
        setImages={setImages}
        loadingImages={loadingImages}
        setLoadingImages={setLoadingImages}
        sending={sending}
        setSending={setSending}
        model={model}
        duration={duration}
        resolution={resolution}
        ratio={ratio}
      />
    </Box>
  </Flex>
        </Flex>
      )}
    </Flex>
  );
}
