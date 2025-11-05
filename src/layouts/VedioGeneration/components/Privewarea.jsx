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
  imageToVideoSettings,selectedUser
}) {
  const previewBg = useColorModeValue("gray.50", "gray.900");
  const panelBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
    const bgColor = useColorModeValue("gray.200", "gray.700");
   const lineargradientbg= useColorModeValue(
            "linear(to-r, gray.200, gray.100, gray.200)",
            "linear(to-r, gray.700, gray.600, gray.700)"
          )
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressMap, setProgressMap] = useState({}); // Track progress per image
const [isPreviewLoading, setIsPreviewLoading] = useState(false);

// in which make the variable  step 1
  const [generatedImage, setGeneratedImage] = useState("");
  const [resizedImage, setResizedImage] = useState("");
  const [resizeDetails, setResizeDetails] = useState(null);
const [generatedVideo, setGeneratedVideo] = useState(null);
const [videoStatus, setVideoStatus] = useState("");
//step 2 resize image


  // Upload single image
// Assuming Swal, axiosInstance, setProgressMap, setImages, setUploading, and toast are in scope.

/**
 * Handles the async upload of a single file.
 * Returns an array of uploaded image objects: [{ id: number, url: string }, ...]
 */
const handleImageUpload = async (file) => {
    const id = Date.now() + Math.random();
    // It's crucial to use startTransition if setProgressMap uses it, but here, we stick to standard React state.
    setProgressMap((prev) => ({ ...prev, [id]: 0 })); 

    const formData = new FormData();
    // Note: The backend API expects the field name "image_urls". 
    // If the file is a single object, this is correct for direct file upload.
    formData.append("image_urls", file); 

    try {
        const res = await axiosInstance.post("/upload_direct_image/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (event) => {
                const percent = Math.round((event.loaded * 100) / event.total);
                setProgressMap((prev) => ({ ...prev, [id]: percent }));
            },
        });

        // The API returns { image_url: ["url1", "url2", ...] }
        const urls = res.data.image_url || [];
        const uploadedImages = urls.map((url) => ({ id, url }));

        // Update the main image list state
        setImages((prev) => [...prev, ...uploadedImages]);
        
        // Cleanup progress map
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

        return uploadedImages; // Returns an ARRAY of uploaded image objects
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
        throw err; // Re-throw the error so handleImageChangeSingle can catch it
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


// Handle Single Image Selection (FIXED LOGIC)
const handleImageChangeSingle = async (e) => {
    const file = e.target.files[0]; // ✅ get single file
    if (!file) return;

    setUploading(true);

    try {
        // 1. Call handleImageUpload which returns an ARRAY of uploaded image objects: [{ id, url }]
        const uploadedImagesArray = await handleImageUpload(file);

        // 2. Extract the FIRST (and only expected) uploaded image object
        const uploadedImage = uploadedImagesArray[0]; 

        if (!uploadedImage || !uploadedImage.url) {
            throw new Error("Upload succeeded, but no URL was returned by the server.");
        }

        // ✅ Show SweetAlert2 popup after upload
        Swal.fire({
            title: "Image Uploaded Successfully 🎉",
            html: `
              <div style="text-align:left; font-size:14px;">
                <p><b>File Name:</b> ${file.name}</p>
                <p><b>File Size:</b> ${(file.size / 1024).toFixed(2)} KB</p>
                <p><b>Type:</b> ${file.type}</p>
                <img src="${uploadedImage.url}" alt="preview" style="width:100%;max-width:300px;border-radius:8px;margin-top:10px;" />
              </div>
            `,
            icon: "success",
            confirmButtonText: "Great!",
            confirmButtonColor: "#2563eb",
            width: "400px",
        });

    } catch (error) {
        console.error("Single Upload failed:", error);

        // Use the error message from the caught error object
        const errorMessage = error.response?.data?.message || error.message || "Something went wrong during image upload.";
        
        Swal.fire({
            title: "Upload Failed ❌",
            text: errorMessage,
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
  setIsPreviewLoading(true);

  // Reset all visuals initially
  setGeneratedVideo(null);
  setGeneratedImage(null);
  setResizedImage(null);
  setVideoStatus(null);

  try {

    if (activeTab === "Image Creation") {
      const res1 = await axiosInstance.post(
        "/factory_development_gemini_virtual_tryon_generate/",
        {
  
          image_urls: images.map((img) => img.url),
          prompt: text,
          img_guideline_id: imageCreationSettings?.guidelineId,
          user_id: selectedUser,
        }
      );

      const compositionId = res1?.data?.data?.composition_id;
      const generatedUrl = res1?.data?.data?.generated_image_url;

      if (!generatedUrl) throw new Error("Failed to generate image.");

      setGeneratedImage(generatedUrl);
      setVideoStatus("completed");

      const { targetWidth, targetHeight, resizeMethod, quality } = imageCreationSettings || {};
      const hasResizeSettings = targetWidth || targetHeight || resizeMethod;

      if (hasResizeSettings) {
        const res2 = await axiosInstance.post(
          "/factory_development_resize_composition_image/",
          {
      
            composition_id: compositionId,
            target_width: targetWidth,
            target_height: targetHeight,
            resize_method: resizeMethod,
            quality,
            user_id: selectedUser,
          }
        );

        setResizedImage(res2?.data?.data?.resized_image_url || null);
        setResizeDetails(res2?.data?.data || {});
      }

      toast({
        title: "Image generated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }

    else if (activeTab === "Resize Image") {
      const { targetWidth, targetHeight, resizeMethod, quality } = resizeImageSettings || {};
      const hasResizeSettings = targetWidth || targetHeight || resizeMethod || quality;

      const res2 = await axiosInstance.post(
        "/factory_development_resize_direct_image/",
        {
         
          image_url: images[0]?.url,
          target_width: targetWidth,
          target_height: targetHeight,
          resize_method: resizeMethod,
          quality,
          user_id: selectedUser,
        }
      );

      const resizedUrl = res2?.data?.data?.resized_image_url;
      if (!resizedUrl) throw new Error("Failed to resize image.");

      setResizedImage(resizedUrl);
      setResizeDetails(res2?.data?.data || {});

      toast({
        title: "Image resized successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }

else if (activeTab === "Image to Video") {
  const {
    video_type,
    customSize,
    customWidth,
    customHeight,
    layover_text,
    project_name,
    tags,
    sector,
    goal,
    key_instructions,
    consumer_message,
    M_key,
    resize,
    resize_width,
    resize_height,
  } = imageToVideoSettings || {};

  // 🧩 Generate unique IDs
  const generateUniqueId = () =>
    "PROD-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

  const product_ID = generateUniqueId().slice(0, 50); // ensure < 50 chars
  const customer_ID = `CRM-${selectedUser}`;

  setVideoStatus("processing");

  const res1 = await axiosInstance.post("/factory_development_gen_video/", {
    image_urls: images.map((img) => img.url),
    customer_ID,
    product_ID,
    layover_text,
    project_name,
    tags,
    sector,
    goal,
    key_instructions: text,
    consumer_message,
    M_key,
    resize,
    resize_width,
    resize_height,
    user_id: selectedUser,
  });

  const creationId = res1?.data?.creation_id;
  if (!creationId) throw new Error("Failed to start video generation.");

  toast({
    title: "Video generation started",
    description: "Your video is being processed...",
    status: "info",
    duration: 3000,
    isClosable: true,
    position: "top-right",
  });

  // Poll for status
  let retryCount = 0;
  const interval = setInterval(async () => {
    try {
      retryCount++;
      const statusRes = await axiosInstance.get(`/get_video_status/?creation_id=${creationId}`);
      const videoStatus = statusRes?.data?.video_status;
      const videoUrls = statusRes?.data?.video_urls;

      if (videoUrls?.raw && !generatedVideo) setGeneratedVideo(videoUrls.raw);

      if (videoStatus === "completed" && videoUrls?.raw) {
        clearInterval(interval);
        setGeneratedVideo(videoUrls.raw);
        setVideoStatus("completed");
        toast({
          title: "Video ready!",
          description: "Video generation completed successfully.",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      } else if (videoStatus === "failed" || retryCount >= 30) {
        clearInterval(interval);
        setVideoStatus("failed");
        toast({
          title: videoStatus === "failed" ? "Video generation failed" : "Video not ready yet",
          status: videoStatus === "failed" ? "error" : "warning",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err) {
      clearInterval(interval);
      setVideoStatus("failed");
      toast({
        title: "Error checking video status",
        description: err?.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, 5000);
}


    setIsPreviewLoading(false);
  } catch (err) {
    console.error("Submit failed:", err);

    // Reset everything if error
    setGeneratedVideo(null);
    setGeneratedImage(null);
    setResizedImage(null);
    setVideoStatus(null);

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
    setIsPreviewLoading(false);
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
  {/* Video / Image Preview */}
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
    {/* 🌀 Shimmer Loader */}
    {isPreviewLoading || (videoStatus === "processing" && !generatedVideo && !generatedImage && !resizedImage) ? (
      <Box
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDir="column"
        gap={3}
      >
        <Box
          w="80%"
          h="200px"
          borderRadius="lg"
          bgGradient={lineargradientbg}
          animation="loadingShimmer 1.5s infinite linear"
          backgroundSize="400px 100%"
          sx={{
            "@keyframes loadingShimmer": {
              "0%": { backgroundPosition: "-200px 0" },
              "100%": { backgroundPosition: "200px 0" },
            },
          }}
          filter="blur(12px)"
          opacity={0.9}
        />
        <Text color="gray.500" fontWeight="medium">
          ⏳ Processing your {activeTab === "Image to Video" ? "video" : "image"}...
        </Text>
      </Box>
    ) : generatedVideo ? (
      // 🎬 Video preview
      <Box w="100%" h="100%" textAlign="center" position="relative">
        <iframe
          src={generatedVideo}
          title="Generated Video Preview"
          allow="autoplay; fullscreen; encrypted-media"
          style={{
            width: "100%",
            height: "400px",
            border: "none",
            borderRadius: "10px",
            margin: "auto",
            display: "block",
          }}
        />
        {videoStatus !== "completed" && (
          <Text
            position="absolute"
            bottom="10px"
            left="50%"
            transform="translateX(-50%)"
            bg="rgba(0,0,0,0.5)"
            color="white"
            px={3}
            py={1}
            borderRadius="md"
            fontSize="sm"
          >
            Processing… preview may be low quality
          </Text>
        )}
      </Box>
    ) : resizedImage || generatedImage ? (
      // 🖼️ Image preview (with fade-in)
      <Box position="relative" w="100%" textAlign="center">
        <Box
          as="img"
          src={resizedImage || generatedImage}
          alt="Generated Preview"
          maxW="100%"
          maxH="400px"
          borderRadius="lg"
          objectFit="contain"
          mx="auto"
          display="block"
          boxShadow="md"
          opacity={0}
          transition="opacity 0.6s ease-in-out"
          onLoad={(e) => (e.target.style.opacity = 1)}
        />
      </Box>
    ) : (
      <Text color="gray.500" fontSize="md">
        🎬 Preview Area
      </Text>
    )}
  </Flex>
</Box>




  {/* Input + Images */}
  {activeTab === "Resize Image" ? (
    // 🔹 Resize Image Section
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
      <Textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        resize="none"
        bg={bgColor}
        borderColor={borderColor}
        fontSize="sm"
        p={2}
        _focus={{
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px #4299E1",
        }}
      />

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

        <Box flex="1" h="60px" display="flex" alignItems="center" justifyContent="center">
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
  ) : activeTab === "Image to Video" ? (
    // 🎥 Image to Video Section
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
        placeholder="Enter video prompt or instructions..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        resize="none"
        bg={bgColor}
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
        <label htmlFor="file-upload-video">
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
          id="file-upload-video"
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
              background: {bgColor},
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
          aria-label="Generate Video"
          bg="green.500"
          color="white"
          borderRadius="md"
          size="sm"
          _hover={{ bg: "green.600" }}
          onClick={handleSubmit}
          isDisabled={submitting || uploading}
        />
      </Flex>

      {/* 🎬 Response Field */}
      {videoStatus ? (
        <Text
          fontSize="sm"
          color={
            videoStatus === "completed"
              ? "green.400"
              : videoStatus === "processing"
              ? "orange.400"
              : "red.400"
          }
        >
          {videoStatus === "completed"
            ? "✅ Video generation completed!"
            : videoStatus === "processing"
            ? ""
            : `❌ ${videoStatus}`}
        </Text>
      ) : (
        !generatedVideo && (
          <Text fontSize="sm" color="gray.500">
            
          </Text>
        )
      )}
    </Flex>
  ) : (
    // 🖼️ Default Section
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
      <Textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        resize="none"
        bg={bgColor}
        borderColor={borderColor}
        fontSize="sm"
        p={2}
        _focus={{
          borderColor: "blue.400",
          boxShadow: "0 0 0 1px #4299E1",
        }}
      />

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
              background:{bgColor},
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
  )}
</Flex>

  );
}
