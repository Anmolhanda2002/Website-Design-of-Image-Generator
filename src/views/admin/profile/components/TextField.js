import React, { useState } from "react";
import {
  Box,
  Textarea,
  IconButton,
  Flex,
  useColorModeValue,
  Spinner,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { AddIcon, ArrowUpIcon } from "@chakra-ui/icons";

const TextFieldComponent = ({ onSubmit }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({});
  const [sending, setSending] = useState(false);

  const boxBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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

  return (
    <Box
      w="100%"
      maxW="800px"
      mx="auto"
      mt={6}
      p={4}
      bg={boxBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      boxShadow="sm"
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
            variant="outline"
            colorScheme="blue"
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
          colorScheme="blue"
          aria-label="Send"
          borderRadius="full"
          onClick={handleSubmit}
          isDisabled={sending}
        />
      </Flex>

      {/* Image Preview Grid */}
      {(images.length > 0 || Object.keys(loadingImages).length > 0) && (
        <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} spacing={3} mt={4}>
          {Object.keys(loadingImages).map((id) => (
            <Flex
              key={id}
              boxSize="80px"
              align="center"
              justify="center"
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
            >
              <Spinner />
            </Flex>
          ))}

          {images.map((img) => (
            <Image
              key={img.id}
              src={img.preview}
              alt="preview"
              boxSize="80px"
              objectFit="cover"
              borderRadius="md"
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default TextFieldComponent;
