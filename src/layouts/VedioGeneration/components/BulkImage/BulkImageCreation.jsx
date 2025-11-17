import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Spinner,
  Input,
  useToast,
  Button,
} from "@chakra-ui/react";
import { FiUpload, FiSend } from "react-icons/fi";
import axiosInstance from "utils/AxiosInstance";

const BulkImageCreation = ({ selectedUser, bulkImageData, setBulkImageData }) => {
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [lifestyleImages, setLifestyleImages] = useState([]);
  const [shotMapping, setShotMapping] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lifestyleLoading, setLifestyleLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  /* ---------------- IMAGE UPLOAD ---------------- */
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

      const uploadedUrl = res.data.image_url?.[0];

      setProgressMap((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      return uploadedUrl;
    } catch (err) {
      toast({ title: "Upload failed", status: "error" });
      throw err;
    }
  };

  const handleSingleImage = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const uploadedUrl = await handleImageUpload(file);

      setBulkImageData((prev) => ({
        ...prev,
        user_id: selectedUser,
        product_images: {
          ...prev.product_images,
          [type]: uploadedUrl,
        },
      }));

      toast({ title: `${type} image uploaded`, status: "success" });
    } catch (err) {
      toast({ title: "Upload Failed", status: "error" });
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- GENERATE RANDOM PRODUCT ID ---------------- */
  const generateShortUUID = () => {
    return (
      "SKU-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36)
    ).slice(0, 48);
  };

  /* ---------------- SUBMIT MAIN API ---------------- */
  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setLifestyleImages([]);
      setPreviewImages([]);

      const updatedData = {
        ...bulkImageData,
        model:Number(bulkImageData.model),
        user_id: selectedUser?.user_id,
        customer_id: `CRM-${selectedUser?.user_id}`,
        product_id: generateShortUUID(),
      };

      const res = await axiosInstance.post(
        "/factory_bulk_generate_product_shots/",
        updatedData
      );

      const apiData = res?.data?.data;
      setSessionId(apiData.session_id);

      // Fix: Remove duplicate images
      const finalImages = Array.from(
        new Set([
          apiData.base_shot.image_url,
          ...apiData.generated_shots.map((shot) => shot.image_url),
        ])
      );

      const mapping = {};
      apiData.generated_shots.forEach((s) => {
        mapping[s.image_url] = s.shot_name;
      });

      setShotMapping(mapping);
      setPreviewImages(finalImages);
      setSelectedImage(finalImages[0]);

      toast({ title: "Submitted Successfully", status: "success" });
    } catch (err) {
      toast({ title: "Submit Failed", status: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  /* ---------------- LIFESTYLE API ---------------- */
  const handleGenerateLifestyle = async () => {
    if (!selectedImage) {
      toast({ title: "Select an image first", status: "warning" });
      return;
    }

    setLifestyleLoading(true);

    const shotName = shotMapping[selectedImage];

    if (!shotName) {
      toast({ title: "No matching shot name found", status: "error" });
      setLifestyleLoading(false);
      return;
    }

    const body = {
      user_id: selectedUser?.user_id,
      session_id: sessionId,
      source_shot: shotName,
      model: 123,
      image_guideline_id: "938c2102-a810-4a92-9792-8ead76d4f06f",
    };

    try {
      const res = await axiosInstance.post(
        "/factory_generate_bulk_lifestyle_shots/",
        body
      );

      const data = res.data.data;

      const lifestyleUrls = Object.values(data.image_urls).filter(
        (url) => url !== null
      );

      setLifestyleImages(lifestyleUrls);
      setPreviewImages(lifestyleUrls);
      setSelectedImage(lifestyleUrls[0]);

      toast({ title: "Lifestyle Generated!", status: "success" });
    } catch (err) {
      toast({ title: "Lifestyle Generation Failed", status: "error" });
    } finally {
      setLifestyleLoading(false);
    }
  };

  return (
    <Box w="100%" p={5}>

      {/* ⭐ PREVIEW SECTION ⭐ */}
      <Box
        w="100%"
        h="260px"
        bg="white"
        borderRadius="xl"
        border="1px solid #e6ecf5"
        p={3}
        overflow="hidden"
        position="relative"
      >
        {isProcessing && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            backdropFilter="blur(6px)"
            bg="rgba(255,255,255,0.6)"
            zIndex="10"
            justify="center"
            align="center"
            flexDirection="column"
          >
            <Spinner size="lg" />
            <Text mt={3} fontSize="18px" fontWeight="600">
              Generating Product Shots...
            </Text>
          </Flex>
        )}

        {lifestyleLoading && (
          <Flex
            position="absolute"
            bottom="0"
            left="0"
            w="100%"
            h="60px"
            bg="rgba(255,255,255,0.9)"
            justify="center"
            align="center"
          >
            <Spinner size="md" />
            <Text ml={3}>Generating lifestyle...</Text>
          </Flex>
        )}

        {!previewImages.length && !isProcessing ? (
          <Flex justify="center" align="center" h="100%">
            <Text fontSize="18px" color="gray.500">Preview Area</Text>
          </Flex>
        ) : (
          <Flex gap={3} overflowX="auto" h="100%" align="center">
            {previewImages.map((url, index) => (
              <Box
                key={index}
                minW="150px"
                h="100%"
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                border={selectedImage === url ? "3px solid #3182CE" : "2px solid #e2e8f0"}
                onClick={() => setSelectedImage(url)}
                _hover={{ transform: "scale(1.03)" }}
                transition="0.2s"
              >
                <Image src={url} w="100%" h="100%" objectFit="cover" />
              </Box>
            ))}
          </Flex>
        )}
      </Box>

      {/* ⭐ GENERATE LIFESTYLE BUTTON ⭐ */}
      {selectedImage && (
        <Flex mt={4} justify="center">
          <Button
            colorScheme="purple"
            onClick={handleGenerateLifestyle}
            isLoading={lifestyleLoading}
          >
            Generate Lifestyle
          </Button>
        </Flex>
      )}

      {/* ⭐ LIFESTYLE GRID ⭐ */}
      {/* {lifestyleImages.length > 0 && (
        <Box mt={6}>
          <Text fontSize="20px" fontWeight="700">Lifestyle Results</Text>

          <Flex wrap="wrap" gap={4} mt={3}>
            {lifestyleImages.map((url, index) => (
              <Box
                key={index}
                w="200px"
                h="260px"
                borderRadius="xl"
                border="1px solid #e2e8f0"
                overflow="hidden"
                cursor="pointer"
                onClick={() => setSelectedImage(url)}
                _hover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}
              >
                <Image src={url} w="100%" h="100%" objectFit="cover" />
              </Box>
            ))}
          </Flex>
        </Box>
      )} */}

      {/* ⭐ FRONT | BACK | SUBMIT ⭐ */}
      <Flex gap={5} alignItems="center" mt={8}>
        <Flex flex="3" gap={4}>
          {/* FRONT */}
          <Box
            flex="1"
            h="80px"
            maxW="80px"
            bg="white"
            borderRadius="xl"
            border="1px solid #d0d7e3"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            onClick={() => document.getElementById("frontInput").click()}
          >
            {uploading ? (
              <Spinner />
            ) : bulkImageData.product_images.front ? (
              <Image
                src={bulkImageData.product_images.front}
                h="100%"
                w="100%"
                objectFit="cover"
                borderRadius="xl"
              />
            ) : (
              <>
                <FiUpload size={22} color="#3182CE" />
                <Text mt={1}>Front</Text>
              </>
            )}

            <Input
              id="frontInput"
              type="file"
              display="none"
              accept="image/*"
              onChange={(e) => handleSingleImage(e, "front")}
            />
          </Box>

          {/* BACK */}
          <Box
            flex="1"
            h="80px"
            maxW="80px"
            bg="white"
            borderRadius="xl"
            border="1px solid #d0d7e3"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            onClick={() => document.getElementById("backInput").click()}
          >
            {uploading ? (
              <Spinner />
            ) : bulkImageData.product_images.back ? (
              <Image
                src={bulkImageData.product_images.back}
                h="100%"
                w="100%"
                objectFit="cover"
                borderRadius="xl"
              />
            ) : (
              <>
                <FiUpload size={22} color="#805AD5" />
                <Text mt={1}>Back</Text>
              </>
            )}

            <Input
              id="backInput"
              type="file"
              display="none"
              accept="image/*"
              onChange={(e) => handleSingleImage(e, "back")}
            />
          </Box>
        </Flex>

        {/* SUBMIT */}
        <Box
          flex="1"
          h="55px"
          maxW="55px"
          bg="green.500"
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          onClick={handleSubmit}
        >
          <FiSend size={20} color="white" />
        </Box>
      </Flex>
    </Box>
  );
};

export default BulkImageCreation;
