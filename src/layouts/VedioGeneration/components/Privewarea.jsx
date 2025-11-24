import React, { useState ,useEffect} from "react";
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
  Progress,Button
} from "@chakra-ui/react";
import { AddIcon, ArrowUpIcon,CloseIcon  } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";
import Swal from "sweetalert2";
import { ViewIcon } from "@chakra-ui/icons";
import { CheckIcon, } from "@chakra-ui/icons";
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
  imageToVideoSettings,
  selectedUser,
  generatedImage,
  setGeneratedImage,
  resizedImage,
  setResizedImage,generatedVideo,setGeneratedVideo,setActiveTab,setlastimagetovideo
}){
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
const [compositions, setCompositions] = useState([]); 
const [selectedCompositions, setSelectedCompositions] = useState([]);
const [backgroundMessage, setBackgroundMessage] = useState("");
// in which make the variable  step 1
  // const [generatedImage, setGeneratedImage] = useState("");
  // const [resizedImage, setResizedImage] = useState("");
  const [resizeDetails, setResizeDetails] = useState(null);
// const [generatedVideo, setGeneratedVideo] = useState(null);
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


const handleRemoveImage = (id) => {
  setImages((prev) => prev.filter((img) => img.id !== id));
};


const handleUseInImageToVideo = (imgUrl) => {
  if (!generatedImage && !resizedImage) return;
const id = Date.now() + Math.random();
  const newImage = {
    id,
    url: imgUrl,
    file: null, // no upload file needed
  };

  // console.log("newImage",newImage)
setImages([newImage]);
setlastimagetovideo(true)

// Auto-select it if needed
// setSelectedImage(newImage.url)
  // console.log(images)  // load image into Image-to-Video images[]
  setActiveTab("Image to Video"); // switch tab
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
          use_case:imageCreationSettings?.use_case,
          img_guideline_id: imageCreationSettings?.guidelineId,
          user_id: selectedUser?.user_id,
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
            user_id: selectedUser?.user_id,
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
          user_id: selectedUser?.user_id,
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
    project_id
  } = imageToVideoSettings || {};

  // 🧩 Generate unique IDs
  const generateUniqueId = () =>
    "PROD-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

  const product_ID = generateUniqueId().slice(0, 50); // ensure < 50 chars
  const customer_ID = `CRM-${selectedUser?.user_id}`;

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
    user_id: selectedUser?.user_id,
     project_id
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
const statusRes = await axiosInstance.get("/get_video_status/", {
  params: {
    creation_id: creationId,
    user_id: selectedUser?.user_id, // assuming selectedUser is an object
  },
});
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

const [submittingCompositions, setSubmittingCompositions] = useState(false);


useEffect(() => {
  if (!imageToVideoSettings?.lifestyle_id || !selectedUser?.user_id) return;

  setSubmittingCompositions(true);

  axiosInstance
    .get(
      `/get_lifestyle_compositions/?lifestyle_id=${imageToVideoSettings.lifestyle_id}&user_id=${selectedUser.user_id}`
    )
    .then((res) => {
      const comps = res.data.compositions || {};
      const formatted = Object.keys(comps).map((key) => ({
        id: comps[key].composition_id,
        url: comps[key].image_url,
      }));
      setCompositions(formatted);
    })
    .catch((err) => {
      console.log("Composition fetch error:", err);
      setCompositions([]); // ensure empty UI fallback
    })
    .finally(() => setSubmittingCompositions(false));
}, [imageToVideoSettings?.lifestyle_id, selectedUser?.user_id]);
;

const toggleComposition = (id) => {
  setSelectedCompositions(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};

const handleSubmitLifestyleVideo = async () => {
  if (selectedCompositions.length === 0) {
    toast({
      title: "No Images Selected!",
      description: "Please select at least one image to create a video.",
      status: "warning",
      duration: 4000,
      isClosable: true,
      position: "top-right",
    });
    return;
  }

  const payload = {
    user_id: selectedUser.user_id,
    lifestyle_id: imageToVideoSettings.lifestyle_id,
    composition_ids: selectedCompositions,
    ...imageToVideoSettings,
  };

  setSubmitting(true);

  try {
    const res = await axiosInstance.post(
      "/factory_videos_from_lifestyle_shots/",
      payload
    );

    const data = res?.data?.data;
    const total = data?.total_images || 0;
    const success = data?.successful_requests || 0;
    const failed = data?.failed_requests || 0;

    // 🛑 Case 1 — All Failed
    if (success === 0) {
      toast({
        title: "❌ Video Creation Failed",
        description:
          "All selected images did not match our quality rules.\nTry different images or guidelines.",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top-right",
      });

      setVideoStatus("failed");
      setGeneratedVideo(null);
      // setBackgroundMessage(
      //   "❌ No videos could be processed. Select different scene compositions and try again."
      // );
      setSubmitting(false);
      return;
    }

    // ⚠️ Case 2 — Partially Success
    if (failed > 0 && success > 0) {
      toast({
        title: "⚠️ Some Videos Couldn't Be Made",
        description: `🎬 ${success}/${total} are being created.\n❌ ${failed} images were not valid for video.`,
        status: "warning",
        duration: 6000,
        isClosable: true,
        position: "top-right",
      });

      setBackgroundMessage(
        `🎬 Your request is accepted!\n${success} video(s) are now processing in the background.\n\nNote: ${failed} image(s) were skipped due to validation rules.`
      );
    }

    // 🎉 Case 3 — All Good
    if (success === total) {
      toast({
        title: "🎉 Video Creation Started!",
        description: "Your videos are being created in background.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });

      setBackgroundMessage(
        `🎬 Great! All selected images are processing into videos.\nYou can check Video Assets after some time.`
      );
    }

    // Common Successful Flow
    setVideoStatus("background-processing");
    setGeneratedVideo(null);

  } catch (err) {
    toast({
      title: "🚫 Something Went Wrong",
      description:
        err?.response?.data?.message ||
        "We couldn't start video creation. Please try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });

    setVideoStatus("failed");
    setGeneratedVideo(null);
    setBackgroundMessage(
      "❌ Video request failed. Please try again in a few minutes."
    );
  }

  setSubmitting(false);
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



// console.log(images)

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
<Text
  color="gray.500"
  fontSize="md"
  fontWeight="medium"
  textAlign="center"
  whiteSpace="pre-line"
>
  {backgroundMessage ||
    `⏳ Processing your ${
      activeTab === "Image to Video" ? "video" : "image"
    }...`}
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

  <Flex align="center" gap={3}>
    {/* Upload Button */}
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

    {/* ⬅️ Image now appears directly after the + button */}
    {images[0] && (
      <Box position="relative">
        <Image
          src={images[0].url}
          alt="preview"
          boxSize="50px"
          objectFit="cover"
          borderRadius="sm"
          border="1px solid"
          borderColor={borderColor}
        />

        <IconButton
          icon={<CloseIcon boxSize={2} />}
          w="14px"
          h="14px"
          minW="14px"
          position="absolute"
          top="-4px"
          right="-4px"
          bg="red.500"
          color="white"
          borderRadius="full"
          onClick={() => handleRemoveImage(images[0].id)}
        />
      </Box>
    )}

    {/* Push Send button to the right */}
    <Flex flex="1" />

    <IconButton
      icon={submitting ? <Spinner size="sm" /> : <ArrowUpIcon />}
      aria-label="Send"
      bg="green.500"
      color="white"
      borderRadius="md"
      size="sm"
      ml="auto"
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
  {/* If Lifestyle based UI is Active */}
  {imageToVideoSettings?.lifestyle_id ? (
    <>
      <Text fontSize="sm" fontWeight="600" color="gray.300">
        Select compositions for video
      </Text>

      <Flex wrap="wrap" gap={3}>
        {submittingCompositions ? (
          <Spinner size="sm" />
        ) : compositions?.length > 0 ? (
          compositions.map((item) => (
            <Box
              key={item.id}
              position="relative"
              cursor="pointer"
              onClick={() => toggleComposition(item.id)}
            >
              <Image
                src={item.url}
                alt="composition-thumbnail"
                boxSize="80px"
                objectFit="cover"
                borderRadius="md"
                border={
                  selectedCompositions.includes(item.id)
                    ? "2px solid #00D26A"
                    : "2px solid transparent"
                }
                transition="0.2s"
                _hover={{ transform: "scale(1.05)" }}
              />

              {selectedCompositions.includes(item.id) && (
                <CheckIcon
                  position="absolute"
                  top="2px"
                  right="2px"
                  color="green.400"
                  bg="white"
                  borderRadius="full"
                  boxSize={4}
                  p="1px"
                />
              )}
            </Box>
          ))
        ) : (
          <Text fontSize="sm" color="gray.400">
            No images found for this lifestyle
          </Text>
        )}
      </Flex>

      <Button
        mt={3}
        colorScheme="green"
        size="sm"
        isDisabled={selectedCompositions.length === 0 || submitting}
        onClick={handleSubmitLifestyleVideo}
      >
        {submitting ? <Spinner size="sm" /> : "Generate Video"}
      </Button>
    </>
  ) : (
    <>
      {/* Normal Prompt + Upload UI */}
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
      />

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

        <Box
          flex="1"
          h="60px"
          display="flex"
          alignItems="center"
          gap={2}
          overflowX="auto"
          borderRadius="md"
          p={1}
        >
          {images.length > 0 ? (
            images.map((img) => (
              <Box key={img.id} position="relative">
                <Image
                  src={img.url}
                  alt="preview"
                  boxSize="50px"
                  objectFit="cover"
                  borderRadius="sm"
                />

                <IconButton
                  icon={<CloseIcon boxSize={2} />}
                  w="14px"
                  h="14px"
                  minW="14px"
                  position="absolute"
                  top="0"
                  right="0"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  onClick={() => handleRemoveImage(img.id)}
                />
              </Box>
            ))
          ) : (
            <Text fontSize="xs" color="gray.500">No image found</Text>
          )}
        </Box>

        <IconButton
          icon={submitting ? <Spinner size="sm" /> : <ArrowUpIcon />}
          aria-label="Generate Video"
          bg="green.500"
          color="white"
          borderRadius="md"
          size="sm"
          _hover={{ bg: "green.600" }}
          onClick={handleSubmit}
          isDisabled={submitting || uploading || images.length === 0}
        />
      </Flex>
    </>
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

<IconButton
  icon={<CloseIcon boxSize={2} />}
  w="14px"
  h="14px"
  minW="14px"
  position="absolute"
  top="0"
  right="0"
  bg="red.500"
  color="white"
  borderRadius="full"
  onClick={() => handleRemoveImage(img.id)}
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
        {(generatedImage || resizedImage) && activeTab !== "Image to Video" && (
  <Button
    mt={3}
    colorScheme="blue"
    size="sm"
    onClick={() => handleUseInImageToVideo(resizedImage || generatedImage)}
  >
    Use this image in Image to Video
  </Button>
)}

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
