import React, { useState } from "react";
import {
  Box,
  Textarea,
  IconButton,
  Flex,
  Spinner,
  Image,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { AddIcon, ArrowUpIcon } from "@chakra-ui/icons";

const TextFieldComponent = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({});
  const [sending, setSending] = useState(false);

  const mainBg = "#1B254B"; // Dark mode background
  const cardBg = "#111936"; // Slightly darker cards
  const borderColor = "rgba(255,255,255,0.1)";
  const textColor = "white";

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, idx) => {
      const id = Date.now() + idx;
      return { id, file, preview: URL.createObjectURL(file) };
    });

    newImages.forEach((img) => {
      setLoadingImages((prev) => ({ ...prev, [img.id]: true }));
      setTimeout(() => {
        setLoadingImages((prev) => {
          const updated = { ...prev };
          delete updated[img.id];
          return updated;
        });
        setImages((prev) => [...prev, img]);
      }, 1500);
    });
  };

  // Handle send
  const handleSubmit = async () => {
    if (!text && images.length === 0) return;
    setSending(true);

    setTimeout(() => {
      setSending(false);
      if (onSubmit) {
        onSubmit({ text, images });
      }
      setText("");
      setImages([]);
    }, 1500);
  };

  // Limit displayed images
  const visibleImages = images.slice(0, 5);
  const extraCount = images.length - 5;

  return (
    <Box
      w="100%"
      maxW="800px"
      mx="auto"
      mt={6}
      p={4}
      bg={mainBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="lg"
      color={textColor}
    >
      {/* Textarea field */}
      <Textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        resize="none"
        borderRadius="lg"
        mb={3}
        bg={cardBg}
        borderColor={borderColor}
        color={textColor}
        _placeholder={{ color: "gray.400" }}
      />

      {/* Action row: + and ↑ */}
      <Flex justify="space-between" align="center">
        {/* Upload Button */}
        <label htmlFor="file-upload">
          <IconButton
            as="span"
            icon={<AddIcon />}
            aria-label="Upload"
            borderRadius="full"
            variant="solid"
            bg="blue.500"
            _hover={{ bg: "blue.400" }}
            color="white"
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

        {/* Send Arrow */}
        <IconButton
          icon={sending ? <Spinner size="sm" /> : <ArrowUpIcon />}
          bg="green.500"
          _hover={{ bg: "green.400" }}
          color="white"
          aria-label="Send"
          borderRadius="full"
          onClick={handleSubmit}
          isDisabled={sending}
        />
      </Flex>

      {/* Image Preview Grid */}
      {(images.length > 0 || Object.keys(loadingImages).length > 0) && (
        <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} spacing={3} mt={4}>
          {/* Show loading placeholders */}
          {Object.keys(loadingImages).map((id) => (
            <Flex
              key={id}
              boxSize="80px"
              align="center"
              justify="center"
              border="2px dashed"
              borderColor="gray.500"
              borderRadius="md"
              bg={cardBg}
            >
              <Spinner color="white" />
            </Flex>
          ))}

          {/* Show up to 5 images */}
          {visibleImages.map((img) => (
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
          ))}

          {/* Show +X box if more images exist */}
          {extraCount > 0 && (
            <Flex
              boxSize="80px"
              align="center"
              justify="center"
              bg="gray.600"
              borderRadius="md"
            >
              <Text fontWeight="bold" color="white">
                +{extraCount}
              </Text>
            </Flex>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default TextFieldComponent;
