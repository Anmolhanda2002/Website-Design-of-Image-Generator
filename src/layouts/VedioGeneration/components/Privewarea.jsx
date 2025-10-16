import React, { useState } from "react";
import {
  Box,
  Flex,
  Textarea,
  IconButton,
  Spinner,
  Text,
  Image,
  useColorModeValue,
  useToast,
  Progress,
} from "@chakra-ui/react";
import { AddIcon, ArrowUpIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";

export default function PreviewArea({
  text,
  setText,
  images,
  setImages,
  model,
  duration,
  resolution,
  ratio,
}) {
  const previewBg = useColorModeValue("gray.50", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressMap, setProgressMap] = useState({}); // Track progress per image

  // Upload single image
  const handleImageUpload = async (file) => {
    const id = Date.now() + Math.random();
    setProgressMap((prev) => ({ ...prev, [id]: 0 }));

    const formData = new FormData();
    formData.append("image_urls", file);

    try {
      const res = await axiosInstance.post("/upload_direct_image/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);
          setProgressMap((prev) => ({ ...prev, [id]: percent }));
        },
      });

      const urls = res.data.image_url || [];
      const uploadedImages = urls.map((url) => ({ id, url }));

      setImages((prev) => [...prev, ...uploadedImages]);
      setProgressMap((prev) => {
        const copy = { ...prev };
        delete copy[id]; // Remove progress after upload
        return copy;
      });

      toast({
        title: "Image Uploaded",
        description: file.name,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      return uploadedImages;
    } catch (err) {
      console.error("Upload failed:", err);
      setProgressMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      toast({
        title: "Upload failed",
        description: file.name,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return [];
    }
  };

  // Handle multiple image selection
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    for (let file of files) {
      await handleImageUpload(file);
    }
    setUploading(false);
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (!text && images.length === 0) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("🎬 Video Data Submitted:", {
        text,
        images,
        settings: { model, duration, resolution, ratio },
      });

      toast({
        title: "Submitted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      setText("");
      setImages([]);
    } catch (err) {
      console.error("Submit failed:", err);
      toast({
        title: "Submission failed",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Flex
      direction="column"
      bg={previewBg}
      h="100%"
      overflowY="auto"
      gap={3}
      p={2}
      sx={{ "&::-webkit-scrollbar": { width: "0px" } }}
    >
      {/* Video Preview */}
      <Flex
        minH="300px"
        bg={panelBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        align="center"
        justify="center"
        boxShadow="sm"
      >
        <Text color="gray.500" fontSize="md">
          🎬 Video Preview
        </Text>
      </Flex>

      {/* Input + Images */}
      <Flex
        direction="column"
        bg={panelBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        p={3}
        gap={3}
      >
        {/* Text Input */}
        <Textarea
          placeholder="Write something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          resize="none"
          bg={useColorModeValue("gray.100", "gray.700")}
          borderColor={borderColor}
          fontSize="sm"
          p={2}
          _focus={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 1px #4299E1",
          }}
        />

        {/* Upload + Send */}
        <Flex justify="space-between" align="center" gap={2}>
          <label htmlFor="file-upload">
            <IconButton
              as="span"
              icon={uploading ? <Spinner size="sm" /> : <AddIcon />}
              aria-label="Upload"
              bg="blue.500"
              color="white"
              borderRadius="md"
              size="sm"
              _hover={{ bg: "blue.600" }}
              isDisabled={uploading}
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

          {/* Horizontal Image Preview */}
          <Box
            flex="1"
            h="60px"
            overflowX="auto"
            display="flex"
            alignItems="center"
            gap={2}
            borderRadius="md"
            p={1}
            sx={{
              "&::-webkit-scrollbar": { height: "4px" },
              "&::-webkit-scrollbar-thumb": {
                background: useColorModeValue("gray.300", "gray.600"),
                borderRadius: "2px",
              },
            }}
          >
            {images.map((img) => (
              <Box key={img.id} position="relative">
                <Image
                  src={img.url}
                  alt="preview"
                  boxSize="50px"
                  objectFit="cover"
                  borderRadius="sm"
                  border="1px solid"
                  borderColor={borderColor}
                />
                {progressMap[img.id] !== undefined && (
                  <Progress
                    size="xs"
                    value={progressMap[img.id]}
                    position="absolute"
                    bottom="0"
                    left="0"
                    width="100%"
                    borderRadius="0 0 2px 2px"
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Send Button */}
          <IconButton
            icon={submitting ? <Spinner size="sm" /> : <ArrowUpIcon />}
            aria-label="Send"
            bg="green.500"
            color="white"
            borderRadius="md"
            size="sm"
            _hover={{ bg: "green.600" }}
            onClick={handleSubmit}
            isDisabled={submitting || uploading}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
