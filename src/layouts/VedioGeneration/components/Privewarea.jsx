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
import Swal from "sweetalert2";
import { ViewIcon } from "@chakra-ui/icons";
export default function PreviewArea({
  text,
  setText,
  images,
  setImages,
  model,
  duration,
  resolution,
  ratio,
  activeTab,
  imageCreationSettings,
  resizeImageSettings,
  imageToVideoSettings
}) {
  const previewBg = useColorModeValue("gray.50", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressMap, setProgressMap] = useState({}); // Track progress per image


// in which make the variable  step 1
  const [generatedImage, setGeneratedImage] = useState("");
  const [resizedImage, setResizedImage] = useState("");
  const [resizeDetails, setResizeDetails] = useState(null);

//step 2 resize image


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

  //Handle Single Image Selection 
  const handleImageChangeSingle = async (e) => {
  const file = e.target.files[0]; // ✅ only single file
  if (!file) return;

  setUploading(true);

  try {
    // 🧩 upload logic — adjust `handleImageUpload` to return uploaded image data (URL, etc.)
    const uploadedImage = await handleImageUpload(file);

    // ✅ Show SweetAlert2 popup after upload
    Swal.fire({
      title: "Image Uploaded Successfully 🎉",
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><b>File Name:</b> ${file.name}</p>
          <p><b>File Size:</b> ${(file.size / 1024).toFixed(2)} KB</p>
          <p><b>Type:</b> ${file.type}</p>
          ${uploadedImage?.url ? `<img src="${uploadedImage.url}" alt="preview" style="width:100%;max-width:300px;border-radius:8px;margin-top:10px;" />` : ""}
        </div>
      `,
      icon: "success",
      confirmButtonText: "Great!",
      confirmButtonColor: "#2563eb",
      width: "400px",
    });

  } catch (error) {
    console.error("Upload failed:", error);

    Swal.fire({
      title: "Upload Failed ❌",
      text: error?.message || "Something went wrong during image upload.",
      icon: "error",
      confirmButtonColor: "#e53e3e",
    });

  } finally {
    setUploading(false);
  }
};

  // Handle form submit
 const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (activeTab === "Image Creation") {
        const apiKey = localStorage.getItem("api_key") || "HYG-DD245233179797E6-870C";

        // 1️⃣ Call Image Creation API
        const res1 = await axiosInstance.post(
          "/factory_development_gemini_virtual_tryon_generate/",
          {
            api_key: apiKey,
            image_urls: images.map((img) => img.url),
            prompt: text,
            img_guideline_id: imageCreationSettings.guidelineId,
          }
        );

        const compositionId = res1?.data?.data?.composition_id;
        const generatedUrl = res1?.data?.data?.generated_image_url;
        setGeneratedImage(generatedUrl);

        const { targetWidth, targetHeight, resizeMethod, quality } = imageCreationSettings || {};
        const hasResizeSettings = targetWidth || targetHeight || resizeMethod || quality;

        // 2️⃣ Call Resize API if fields are provided
        if (hasResizeSettings) {
          const resizeApiKey = localStorage.getItem("api_key");

          const res2 = await axiosInstance.post(
            "/factory_development_resize_composition_image/",
            {
              api_key: resizeApiKey,
              composition_id: compositionId,
              target_width: targetWidth,
              target_height: targetHeight,
              resize_method: resizeMethod,
              quality: quality,
            }
          );

          setResizedImage(res2?.data?.data?.resized_image_url);
          setResizeDetails(res2?.data?.data);
        }

        toast({
          title: "Image generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
      }

      else if (activeTab === "Resize Image"){
           const { targetWidth, targetHeight, resizeMethod, quality } = resizeImageSettings || {};
             const hasResizeSettings = targetWidth || targetHeight || resizeMethod || quality;
             const resizeApiKey = localStorage.getItem("api_key");

          const res2 = await axiosInstance.post(
            "/factory_development_resize_direct_image/",
            {
              api_key: resizeApiKey,
              // composition_id: compositionId,
              image_url: images[0]?.url,
              target_width: targetWidth,
              target_height: targetHeight,
              resize_method: resizeMethod,
              quality: quality,
            }
          );

          setResizedImage(res2?.data?.data?.resized_image_url);
          setResizeDetails(res2?.data?.data);
        }

        toast({
          title: "Image generated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top-right",
        });
        

  

    } catch (err) {
      console.error("Submit failed:", err);
      toast({
        title: "Submission failed",
        description: err?.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = () => {
    if (!resizeDetails) return;

    Swal.fire({
      title: "Resize Image Details",
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><b>Composition ID:</b> ${resizeDetails.composition_id}</p>
          <p><b>Original Image:</b> <a href="${resizeDetails.original_image_url}" target="_blank">View</a></p>
          <p><b>Resized Image:</b> <a href="${resizeDetails.resized_image_url}" target="_blank">View</a></p>
          <p><b>Original Size:</b> ${resizeDetails.original_dimensions.width}x${resizeDetails.original_dimensions.height}</p>
          <p><b>Resized Size:</b> ${resizeDetails.resized_dimensions.width}x${resizeDetails.resized_dimensions.height}</p>
          <p><b>Resize Method:</b> ${resizeDetails.processing_info.resize_method}</p>
          <p><b>Quality:</b> ${resizeDetails.processing_info.quality}</p>
          <p><b>Compression:</b> ${resizeDetails.processing_info.compression_percentage}%</p>
          <p><b>Processing Time:</b> ${resizeDetails.processing_info.processing_time_seconds.toFixed(3)}s</p>
          <p><b>Storage Type:</b> ${resizeDetails.processing_info.storage_type}</p>
        </div>
      `,
      imageUrl: resizeDetails.resized_image_url,
      imageWidth: 300,
      imageAlt: "Resized Image",
      confirmButtonText: "Close",
    });
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
     <Box>
      <Flex
        minH="300px"
        bg={panelBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={borderColor}
        align="center"
        justify="center"
        position="relative"
        boxShadow="sm"
        p={4}
      >
        {submitting ? (
          <Spinner size="xl" color="blue.500" />
        ) : resizedImage || generatedImage ? (
          <Box w="100%" h="100%" textAlign="center">
            <Image
              src={resizedImage || generatedImage}
              alt="Generated Result"
              maxH="400px"
              objectFit="contain"
              mx="auto"
              borderRadius="lg"
            />
            {resizeDetails && (
              <IconButton
                icon={<ViewIcon />}
                aria-label="View Details"
                position="absolute"
                top="10px"
                right="10px"
                size="sm"
                colorScheme="blue"
                onClick={handleViewDetails}
              />
            )}
          </Box>
        ) : (
          <Text color="gray.500" fontSize="md">
            🎬 Image Preview
          </Text>
        )}
      </Flex>


    </Box>

      {/* Input + Images */}



{
  activeTab === "Resize Image" ? (
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
        <label htmlFor="file-upload-single">
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
          id="file-upload-single"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChangeSingle}
        />

        {/* Image Preview */}
        <Box
          flex="1"
          h="60px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {images[0] && (
            <Image
              src={images[0].url}
              alt="preview"
              boxSize="50px"
              objectFit="cover"
              borderRadius="sm"
              border="1px solid"
              borderColor={borderColor}
            />
          )}
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
  ) : (
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
        <label htmlFor="file-upload-multiple">
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
          id="file-upload-multiple"
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleImageChange}
        />

        {/* Image Previews */}
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
  )
}

      
  


    </Flex>
  );
}
