import React, { useState } from "react";
import {
  Box,
  Flex,
  VStack,
  Button,
  Text,
  Select,
  RadioGroup,
  Radio,
  Stack,
  Icon,
  Textarea,
  IconButton,
  Spinner,
  Image,
  SimpleGrid,
  useColorMode,
  useColorModeValue, useBreakpointValue,
} from "@chakra-ui/react";
import {
  MdBrush,
  MdSwapHoriz,
  MdViewInAr,
  MdVideoLibrary,
  MdVolumeUp,
  MdArrowBack,
} from "react-icons/md";
import { AddIcon, ArrowUpIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

/* ---------- Sidebar Component ---------- */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const sidebarItems = [
    { name: "Template", icon: MdBrush },
    { name: "Transition", icon: MdSwapHoriz },
    { name: "Fusion", icon: MdViewInAr },
    { name: "Extend", icon: MdVideoLibrary },
    { name: "Sound", icon: MdVolumeUp },
  ];

  // Chakra color values
  const sidebarBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const activeBg = useColorModeValue("blue.500", "blue.400");
  const inactiveColor = useColorModeValue("gray.600", "gray.300");
  const activeColor = "white";

  return (
    <VStack
      w="80px"
      bg={sidebarBg}
      p={4}
      spacing={6}
      align="center"
      borderRight="1px solid"
      borderColor={borderColor}
    >
      {sidebarItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={() => setActiveTab(item.name)}
          bg={activeTab === item.name ? activeBg : "transparent"}
          color={activeTab === item.name ? activeColor : inactiveColor}
          w="60px"
          h="60px"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          borderRadius="md"
          _hover={{
            bg: activeTab === item.name ? activeBg : hoverBg,
          }}
        >
          <Icon as={item.icon} boxSize={6} />
          <Text fontSize="xs" mt={1}>
            {item.name}
          </Text>
        </Button>
      ))}
    </VStack>
  );
};

/* ---------- Panel Component ---------- */
const Panel = ({ activeTab, model, setModel, duration, setDuration, resolution, setResolution, ratio, setRatio }) => {
  const panelBg = useColorModeValue("white", "gray.800");

  const handleChange = (field, value) => console.log(`${field}: ${value}`);

  const renderContent = () => {
    switch (activeTab) {
      case "Template":
        return (
          <>
            <Box>
              <Text fontWeight="bold">Model</Text>
              <Select
                value={model}
                onChange={(e) => { setModel(e.target.value); handleChange("Model", e.target.value); }}
                mt={2}
                bg={panelBg}
              >
                <option value="V5">V5</option>
                <option value="V4">V4</option>
                <option value="Custom">Custom</option>
              </Select>
            </Box>
            <Box>
              <Text fontWeight="bold">Duration</Text>
              <RadioGroup value={duration} onChange={(val) => { setDuration(val); handleChange("Duration", val); }}>
                <Stack direction="row" mt={2}>
                  <Radio value="5s">5s</Radio>
                  <Radio value="8s">8s</Radio>
                  <Radio value="10s">10s</Radio>
                </Stack>
              </RadioGroup>
            </Box>
            <Box>
              <Text fontWeight="bold">Resolution</Text>
              <Select
                value={resolution}
                onChange={(e) => { setResolution(e.target.value); handleChange("Resolution", e.target.value); }}
                mt={2}
                bg={panelBg}
              >
                <option value="360P">360P</option>
                <option value="540P">540P</option>
                <option value="720P">720P</option>
                <option value="1080P">1080P</option>
              </Select>
            </Box>
            <Box>
              <Text fontWeight="bold">Ratio</Text>
              <RadioGroup value={ratio} onChange={(val) => { setRatio(val); handleChange("Ratio", val); }}>
                <Stack direction="row" mt={2}>
                  <Radio value="16:9">16:9</Radio>
                  <Radio value="4:3">4:3</Radio>
                  <Radio value="1:1">1:1</Radio>
                  <Radio value="9:16">9:16</Radio>
                </Stack>
              </RadioGroup>
            </Box>
          </>
        );
      case "Transition": return <Text>⚡ Transition Settings</Text>;
      case "Fusion": return <Text>🧩 Fusion Settings</Text>;
      case "Extend": return <Text>🎥 Extend Settings</Text>;
      case "Sound": return <Text>🔊 Sound Settings</Text>;
      default: return <Text>Select a menu item</Text>;
    }
  };

  return <VStack w="300px" bg={panelBg} p={6} borderRadius="lg" align="stretch" spacing={6}>{renderContent()}</VStack>;
};

/* ---------- Preview Area Component ---------- */
const PreviewArea = ({
  text,
  setText,
  images,
  setImages,
  loadingImages,
  setLoadingImages,
  sending,
  setSending,
  model,
  duration,
  resolution,
  ratio,
}) => {
  // ✅ Put all useColorModeValue calls here
  const previewBg = useColorModeValue("gray.200", "gray.700");
  const panelBg = useColorModeValue("white", "gray.800");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const uploadBtnBg = useColorModeValue("blue.500", "blue.500");
  const uploadBtnHover = useColorModeValue("blue.400", "blue.400");
  const sendBtnBg = useColorModeValue("green.500", "green.500");
  const sendBtnHover = useColorModeValue("green.400", "green.400");
  const loadingBorder = useColorModeValue("gray.300", "gray.500");
  const extraBoxBg = useColorModeValue("gray.300", "gray.600");
  const borderColor = useColorModeValue("gray.300", "gray.500");
  const videoTextColor = useColorModeValue("gray.500", "gray.400");

  const allImagesCount = images.length + Object.keys(loadingImages).length;
  const combinedImages = [...images, ...Object.values(loadingImages)];
  const visibleImages = combinedImages.slice(0, 5);
  const extraCount = allImagesCount - 5;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, idx) => ({
      id: Date.now() + idx,
      file,
      preview: URL.createObjectURL(file),
    }));

    newImages.forEach((img) => {
      setLoadingImages((prev) => ({ ...prev, [img.id]: img }));
      setTimeout(() => {
        setLoadingImages((prev) => {
          const updated = { ...prev };
          delete updated[img.id];
          return updated;
        });
        setImages((prev) => [...prev, img]);
      }, 1000);
    });
  };

  const handleSubmit = () => {
    if (!text && images.length === 0) return;

    // Log all video data
    console.log({
      text,
      images,
      settings: { model, duration, resolution, ratio },
    });

    setSending(true);
    setTimeout(() => {
      setText("");
      setImages([]);
      setLoadingImages({});
      setSending(false);
    }, 1000);
  };

  return (
    <Box
      flex="1"
      p={4}
      bg={previewBg}
      borderRadius="lg"
      display="flex"
      flexDirection="column"
    >
      {/* Video Preview Placeholder */}
      <Flex
        h="400px"
        mb={4}
        bg={panelBg}
        borderRadius="md"
        align="center"
        justify="center"
        border="1px solid"
        borderColor={borderColor}
      >
        <Text color={videoTextColor}>🎬 Video Preview</Text>
      </Flex>

      {/* Textarea */}
      <Textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        resize="none"
        mb={3}
        bg={panelBg}
        borderRadius="md"
        borderColor={borderColor}
        _placeholder={{ color: placeholderColor }}
      />

      {/* Upload + Send */}
      <Flex justify="space-between" align="center" mb={3}>
        <label htmlFor="file-upload">
          <IconButton
            as="span"
            icon={<AddIcon />}
            aria-label="Upload"
            bg={uploadBtnBg}
            _hover={{ bg: uploadBtnHover }}
            color="white"
            borderRadius="full"
          />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        <IconButton
          icon={sending ? <Spinner size="sm" /> : <ArrowUpIcon />}
          aria-label="Send"
          bg={sendBtnBg}
          _hover={{ bg: sendBtnHover }}
          color="white"
          borderRadius="full"
          onClick={handleSubmit}
          isDisabled={sending}
        />
      </Flex>

      {/* Image Preview Grid */}
      {combinedImages.length > 0 && (
        <SimpleGrid columns={{ base: 3, sm: 4, md: 5 }} spacing={3}>
          {visibleImages.map((img) => {
            const isLoading = Object.keys(loadingImages).includes(
              img.id.toString()
            );
            return isLoading ? (
              <Flex
                key={img.id}
                boxSize="80px"
                align="center"
                justify="center"
                border="2px dashed"
                borderColor={loadingBorder}
                borderRadius="md"
                bg={panelBg}
              >
                <Spinner />
              </Flex>
            ) : (
              <Image
                key={img.id}
                src={img.preview}
                alt="preview"
                boxSize="80px"
                objectFit="cover"
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              />
            );
          })}
          {extraCount > 0 && (
            <Flex
              boxSize="80px"
              align="center"
              justify="center"
              bg={extraBoxBg}
              borderRadius="md"
            >
              <Text fontWeight="bold">+{extraCount}</Text>
            </Flex>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
};

/* ---------- Main Layout ---------- */
export default function PixVerseLayout() {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  const [activeTab, setActiveTab] = useState("Template");
  const [model, setModel] = useState("V5");
  const [duration, setDuration] = useState("8s");
  const [resolution, setResolution] = useState("360P");
  const [ratio, setRatio] = useState("16:9");

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({});
  const [sending, setSending] = useState(false);

  const bgColor = useColorModeValue("gray.100", "gray.900");
  const navbarBg = useColorModeValue("white", "gray.800");

  // Detect mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex direction="column" h="100vh" >
      {/* Navbar */}
   <Flex
  h="70px"
  px={6}
  py={3}
  bg={navbarBg}
  align="center"
  justify="space-between"
  borderBottom="1px solid"
  borderColor={useColorModeValue("gray.200", "gray.700")}
>
  {/* Left section: Back + Logo + Title */}
  <Flex align="center" gap={4}>
    {/* Back Icon Button */}
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

    {/* Logo + Text */}
    <Flex align="center" gap={2}>
      <Box
        as="img"
        src="/logo.png"   // 🔹 replace with your logo image path
        alt="Hygaar Logo"
        boxSize="30px"
        borderRadius="md"
      />
      <Text fontSize="lg" fontWeight="bold">
        Hygaar
      </Text>
    </Flex>
  </Flex>

  {/* Dark/Light Mode Icon Only */}
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


      {/* Body */}
      {isMobile ? (
        // ===== Mobile Layout =====
        <Flex direction="column" flex="1" p={3} gap={4}>
          {/* Preview on top */}
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

          {/* Tabs like in your screenshot */}
          <Flex justify="space-around" bg="gray.800" borderRadius="md" py={2}>
            {["Template", "Transition", "Fusion", "Extend", "Sound"].map(
              (tab) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeTab === tab ? "solid" : "ghost"}
                  colorScheme="blue"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </Button>
              )
            )}
          </Flex>

          {/* Panel under preview */}
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
        // ===== Desktop Layout =====
        <Flex flex="1">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <Flex flex="1" p={6} gap={6}>
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
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}