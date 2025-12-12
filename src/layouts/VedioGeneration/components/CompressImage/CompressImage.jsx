import React, { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Spinner,
  useColorModeValue,
  useToast,
  Text,
  Button,
} from "@chakra-ui/react";
import { AddIcon, CloseIcon, ArrowUpIcon, DownloadIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";

const CompressImage = ({ selectedUser, compressdata, setcompressdata }) => {
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const toast = useToast();

  const panelBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.300", "gray.700");
  const overlayBg = useColorModeValue("rgba(255,255,255,0.6)", "rgba(0,0,0,0.4)");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage({ file, url: URL.createObjectURL(file) });
    setPreviewImage(null);
    setMessage("");
    setDownloadUrl("");
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewImage(null);
    setMessage("");
    setDownloadUrl("");
  };

const handleSubmit = async () => {
  if (!image) return;

  setLoading(true);
  setPreviewImage(null);
  setMessage("");
  setDownloadUrl("");

  const formData = new FormData();
  formData.append("image", image.file);
  formData.append("target_size_mb", compressdata.target_size_mb);
  formData.append("quality", compressdata.quality);
  formData.append("user_id", selectedUser?.user_id);

  try {
    const res = await axiosInstance.post(
      "/factory_compress_image_api/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (res.data.success) {
      // Success: show compressed image, download, and message
      const compressedUrl = res.data?.compressed_url;
      const downloadLink = res.data?.download_url;
      const backendMessage = res.data?.message || "Image compressed successfully!";

      setPreviewImage(compressedUrl);
      setMessage(backendMessage);
      setDownloadUrl(downloadLink);

      setcompressdata((prev) => ({
        ...prev,
        compressed_image: compressedUrl,
      }));

      toast({
        title: "Success",
        description: backendMessage,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      // Failure: show API error
      const errorMsg = res.data.error || "Image compression failed!";
      setMessage(errorMsg);

      toast({
        title: "Error",
        description: errorMsg,
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "top-right",
      });
    }
  } catch (error) {
  // Check if backend sent a proper error
  const errMsg =
    error.response?.data?.error || // use 'error' key from backend
    error.response?.data?.message || // fallback
    "Image compression failed!"; // default message

  setMessage(errMsg);

  toast({
    title: "Error",
    description: errMsg,
    status: "error",
    duration: 3500,
    isClosable: true,
    position: "top-right",
  });
}
  setLoading(false);
};



  return (
    <Flex direction="column" gap={4}>
      {/* ===========================
          COMPRESSED IMAGE PREVIEW
      ============================ */}
      <Box
        minH="350px"
        bg={panelBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
        flexDirection="column"
        gap={2}
        p={2}
      >
        {/* Loading Overlay */}
        {loading && (
          <Box
            position="absolute"
            inset="0"
            backdropFilter="blur(4px)"
            bg={overlayBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="10"
          >
            <Spinner size="xl" thickness="4px" color="blue.400" />
          </Box>
        )}

        {/* Show compressed image */}
        {previewImage && !loading && (
          <Image
            src={previewImage}
            maxH="100%"
            maxW="100%"
            width={"100%"}
            maxHeight={"300px"}
            objectFit="contain"
            borderRadius="md"
          />
        )}

        {/* Empty state */}
        {!previewImage && !loading && (
          <Box color="gray.500">Compressed image will appear here</Box>
        )}

        {/* Backend message */}
        {message && !loading && (
          <Text mt={2} color="green.400" fontSize="sm" textAlign="center">
            {message}
          </Text>
        )}

        {/* Download button */}
        {downloadUrl && !loading && (
          <Button
            as="a"
            href={downloadUrl}
            target="_blank"
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            size="sm"
            mt={2}
          >
            Download
          </Button>
        )}
      </Box>

      {/* ===========================
          ACTION BAR
      ============================ */}
      <Flex
        bg={panelBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        p={3}
        align="center"
        gap={3}
      >
        <label htmlFor="upload-image-compress">
          <IconButton
            as="span"
            icon={<AddIcon />}
            aria-label="Upload"
            bg="blue.500"
            color="white"
            size="sm"
            borderRadius="md"
            _hover={{ bg: "blue.600" }}
            isDisabled={loading}
          />
        </label>

        <input
          id="upload-image-compress"
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />

        {/* Thumbnail */}
        {image && (
          <Box position="relative">
            <Image
              src={image.url}
              boxSize="55px"
              objectFit="cover"
              borderRadius="sm"
              border="1px solid"
              borderColor={borderColor}
            />
            <IconButton
              icon={<CloseIcon boxSize={2} />}
              w="16px"
              h="16px"
              bg="red.500"
              color="white"
              borderRadius="full"
              size="xs"
              position="absolute"
              top="-5px"
              right="-5px"
              onClick={handleRemoveImage}
            />
          </Box>
        )}

        <Flex flex="1" />

        {/* Submit */}
        <IconButton
          icon={loading ? <Spinner size="sm" /> : <ArrowUpIcon />}
          aria-label="Compress"
          bg="green.500"
          color="white"
          size="sm"
          borderRadius="md"
          _hover={{ bg: "green.600" }}
          onClick={handleSubmit}
          isDisabled={!image || loading}
        />
      </Flex>
    </Flex>
  );
};

export default CompressImage;
