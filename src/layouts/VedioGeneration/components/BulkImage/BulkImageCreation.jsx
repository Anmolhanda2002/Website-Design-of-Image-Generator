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
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUpload, FiSend } from "react-icons/fi";
import axiosInstance from "utils/AxiosInstance";

const BulkImageCreation = ({
  selectedUser,
  bulkImageData,
  setBulkImageData,
  setImages,
  setlastimagetovideo,
  setActiveTab,
}) => {
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const [previewImages, setPreviewImages] = useState([]);
  const [lifestyleImages, setLifestyleImages] = useState([]);
  const [shotMapping, setShotMapping] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // general processing overlay
  const [lifestyleLoading, setLifestyleLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitloading, setsubmitloading] = useState(false);

  // NEW STATES
  const [isFirstApiDone, setIsFirstApiDone] = useState(false);
  const [isLifestyleDone, setIsLifestyleDone] = useState(false);

  // Background notice state — used when CSV submit returns status: true but no immediate images
  const [backgroundNotice, setBackgroundNotice] = useState(null);

  // color mode aware values (option A: Chakra default dark mode)
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("#e6ecf5", "gray.700");
  const subtleText = useColorModeValue("gray.500", "gray.300");

  /* ------------------------------------------
      IMAGE UPLOAD
  ------------------------------------------- */
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

  /* ------------------------------------------
      GENERATE PRODUCT ID
  ------------------------------------------- */
  const generateShortUUID = () => {
    return (
      "SKU-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36)
    ).slice(0, 48);
  };

  /* ------------------------------------------
      IMAGE SUBMIT API
  ------------------------------------------- */
  const handleSubmitImage = async () => {
    try {
      setIsProcessing(true);
      setLifestyleImages([]);
      setPreviewImages([]);
      setBackgroundNotice(null);
      setsubmitloading(true);

      const updatedData = {
        ...bulkImageData,
        model: Number(bulkImageData.model),
        user_id: selectedUser?.user_id,
        customer_id: `CRM-${selectedUser?.user_id}`,
        product_id: generateShortUUID(),
      };

      const res = await axiosInstance.post(
        "/factory_bulk_generate_product_shots/",
        updatedData
      );

      const apiData = res?.data?.data;

      if (!apiData) {
        // if server returns status true but no data, show a notice
        if (res?.data?.status === true) {
          setBackgroundNotice(
            res?.data?.message ||
              "Processing started in background. Results will appear here when ready."
          );
        } else {
          toast({ title: "Submit failed", status: "error" });
        }
        return;
      }

      // same processing as before
      setSessionId(apiData.session_id);

      const finalImages = Array.from(
        new Set([
          apiData.base_shot?.image_url,
          ...((apiData.generated_shots || []).map((shot) => shot.image_url) || []),
        ].filter(Boolean))
      );

      const mapping = {};
      (apiData.generated_shots || []).forEach((s) => {
        mapping[s.image_url] = s.shot_name;
      });

      setShotMapping(mapping);
      setPreviewImages(finalImages);
      setSelectedImage(finalImages[0]);

      setIsFirstApiDone(true);
      setIsLifestyleDone(false);

      toast({ title: "Submitted Successfully", status: "success" });
    } catch (err) {
      toast({ title: "Submit Failed", status: "error" });
    } finally {
      setIsProcessing(false);
      setsubmitloading(false);
    }
  };

  /* ------------------------------------------
      CSV UPLOAD API
      (upload CSV file and set bulkImageData.csv_file)
  ------------------------------------------- */
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    // use "file" as key based on prior examples
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await axiosInstance.post("/upload_csv_file/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // expected response: { status: true, message: "...", file_url: "..." }
      const csvURL = res.data.file_url || res.data?.data?.file_url;

      if (!csvURL) {
        toast({ title: "CSV upload returned no URL", status: "error" });
        setUploading(false);
        return;
      }

      setBulkImageData((prev) => ({
        ...prev,
        csv_file: csvURL,
      }));

      toast({ title: "CSV Uploaded", status: "success" });
    } catch (err) {
      toast({ title: "CSV Upload Failed", status: "error" });
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------------------
      CSV SUBMIT API
      Response is expected to match image submit structure when there are images.
      If server returns status true but no image data, show a background notice
  ------------------------------------------- */
  const handleSubmitCSV = async () => {
    if (!bulkImageData.csv_file) {
      toast({ title: "Upload CSV first", status: "warning" });
      return;
    }

    try {
      setIsProcessing(true);
      setLifestyleImages([]);
      setPreviewImages([]);
      setBackgroundNotice(null);
      setsubmitloading(true);

      const body = {
        user_id: selectedUser?.user_id,
        model: Number(bulkImageData.model),
        image_guideline_id: bulkImageData.image_guideline_id,
        project_name: bulkImageData.product_name,
        shot_type: bulkImageData.shot_type,
        product_type: bulkImageData.product_type,
        product_name: bulkImageData.product_name,
        csv_url: bulkImageData.csv_file,
        product_id: generateShortUUID(),
        customer_id: `CRM-${selectedUser?.user_id}`,
      };

      const res = await axiosInstance.post("/bulk_generate_product_shots_csv/", body);

      // If API indicates success but returns no data, show a background notification.
      if (res?.data?.status === true && !res?.data?.data) {
        setBackgroundNotice(
          res?.data?.message ||
            "CSV accepted. Processing is running in background — results will appear here when ready."
        );
        setsubmitloading(false);
        return;
      }

      const apiData = res?.data?.data;
      if (!apiData) {
        toast({ title: "CSV Submit returned unexpected response", status: "error" });
        setsubmitloading(false);
        return;
      }

      // process images same as image submit
      setSessionId(apiData.session_id);

      const finalImages = Array.from(
        new Set([
          apiData.base_shot?.image_url,
          ...((apiData.generated_shots || []).map((shot) => shot.image_url) || []),
        ].filter(Boolean))
      );

      const mapping = {};
      (apiData.generated_shots || []).forEach((s) => {
        mapping[s.image_url] = s.shot_name;
      });

      setShotMapping(mapping);
      setPreviewImages(finalImages);
      setSelectedImage(finalImages[0]);

      setIsFirstApiDone(true);
      setIsLifestyleDone(false);

      toast({ title: "CSV Submitted Successfully", status: "success" });
    } catch (err) {
      toast({ title: "CSV Submit Failed", status: "error" });
    } finally {
      setIsProcessing(false);
      setsubmitloading(false);
    }
  };

  /* ------------------------------------------
      LIFESTYLE API (shared for both modes)
  ------------------------------------------- */
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
      image_guideline_id: bulkImageData.image_guideline_id,
    };

    try {
      const res = await axiosInstance.post(
        "/factory_generate_bulk_lifestyle_shots/",
        body
      );

      const data = res.data.data;
      const lifestyleUrls = Object.values(data.image_urls).filter((url) => url !== null);

      setLifestyleImages(lifestyleUrls);
      setPreviewImages(lifestyleUrls);
      setSelectedImage(lifestyleUrls[0]);

      setIsLifestyleDone(true);

      toast({ title: "Lifestyle Generated!", status: "success" });
    } catch (err) {
      toast({ title: "Lifestyle Generation Failed", status: "error" });
    } finally {
      setLifestyleLoading(false);
    }
  };

  /* ------------------------------------------
      CLEAR ALL
  ------------------------------------------- */
  const handleClear = () => {
    setPreviewImages([]);
    setLifestyleImages([]);
    setSelectedImage(null);
    setShotMapping({});
    setSessionId(null);

    setIsFirstApiDone(false);
    setIsLifestyleDone(false);

    setBulkImageData((prev) => ({
      ...prev,
      product_images: { front: "", back: "" },
      csv_file: "",
    }));

    setBackgroundNotice(null);
  };

  /* ------------------------------------------
      Create Video using selected image
  ------------------------------------------- */
  const handleCreateVideo = () => {
    if (!selectedImage) {
      toast({ title: "Select an image first", status: "warning" });
      return;
    }

    setImages([
      {
        id: Date.now(),
        url: selectedImage,
      },
    ]);
    setlastimagetovideo(true);
    setActiveTab("Image to Video");
  };

  /* ------------------------------------------
      MAIN submit: choose CSV or Image based on file_type
  ------------------------------------------- */
  const handleSubmit = async () => {
    if (bulkImageData.file_type === "csv") {
      return handleSubmitCSV();
    } else {
      return handleSubmitImage();
    }
  };

  return (
    <Box w="100%" p={5}>
      {/* ------------------------------------------
            PREVIEW BOX (same for both CSV & IMAGE)
      ------------------------------------------- */}
      <Box
        w="100%"
        h="350px"
        bg={cardBg}
        borderRadius="xl"
        border={`1px solid ${borderColor}`}
        mt="-20px"
        overflow="hidden"
        position="relative"
      >
        {/* Processing overlay for live generation */}
        {isProcessing && (
          <Flex
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            backdropFilter="blur(6px)"
            bg="rgba(255,255,255,0.06)"
            zIndex="10"
            justify="center"
            align="center"
            flexDirection="column"
          >
            <Spinner size="lg" />
            <Text mt={3} fontSize="18px" fontWeight="600" color={textColor}>
              Generating Product Shots...
            </Text>
          </Flex>
        )}

        {/* Lifestyle loading footer */}
        {lifestyleLoading && (
          <Flex
            position="absolute"
            bottom="0"
            left="0"
            w="100%"
            h="60px"
            bg={useColorModeValue("rgba(255,255,255,0.9)", "rgba(0,0,0,0.6)")}
            justify="center"
            align="center"
          >
            <Spinner size="md" />
            <Text ml={3} color={textColor}>
              Generating lifestyle...
            </Text>
          </Flex>
        )}

        {/* If backgroundNotice is set (CSV accepted, background processing) show message */}
        {backgroundNotice && !previewImages.length && !isProcessing && (
          <Flex justify="center" align="center" h="100%" p={4}>
            <Box textAlign="center">
              <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
                {backgroundNotice}
              </Text>
              <Text fontSize="sm" color={subtleText}>
                This process may take a few minutes. Check back later or refresh to see results.
              </Text>
            </Box>
          </Flex>
        )}

        {/* Default "Preview Area" if no images and no processing */}
        {!previewImages.length && !isProcessing && !backgroundNotice && (
          <Flex justify="center" align="center" h="100%">
            <Text fontSize="18px" color={subtleText}>
              Preview Area
            </Text>
          </Flex>
        )}

        {/* Image previews when available */}
        {!!previewImages.length && (
          <Flex
            gap={3}
            overflowX="auto"
            h="100%"
            align="center"
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {previewImages.map((url, index) => (
              <Box
                key={index}
                minW="220px"
                h="100%"
                borderRadius="lg"
                overflow="hidden"
                cursor="pointer"
                border={selectedImage === url ? "3px solid #3182CE" : `2px solid ${borderColor}`}
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

      {/* ------------------------------------------
            MODE ACTIONS (Generate Lifestyle / Create Video / Clear)
      ------------------------------------------- */}
      <Flex mt={4} justify="center" gap={3}>
        {isFirstApiDone && !isLifestyleDone && (
          <Button colorScheme="purple" onClick={handleGenerateLifestyle} isLoading={lifestyleLoading}>
            Generate Lifestyle
          </Button>
        )}

        {(isFirstApiDone || isLifestyleDone) && (
          <Button colorScheme="purple" onClick={handleCreateVideo} isDisabled={!selectedImage}>
            Create Video
          </Button>
        )}

        {(isFirstApiDone || isLifestyleDone) && (
          <Button colorScheme="red" onClick={handleClear}>
            Clear
          </Button>
        )}
      </Flex>

      {/* ------------------------------------------
            BOTTOM AREA:
            image mode: front/back uploads + submit
            csv mode: left csv upload + right submit
      ------------------------------------------- */}
      <Box mt={3}>
        {/* IMAGE MODE (front/back + submit) */}
        {!isFirstApiDone && bulkImageData.file_type === "image" && (
          <Flex gap={5} alignItems="center" mt={2}>
            <Flex flex="3" gap={4}>
              {/* FRONT */}
              <Box
                flex="1"
                h="80px"
                maxW="80px"
                bg={cardBg}
                borderRadius="xl"
                border={`1px solid ${borderColor}`}
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
                    <Text mt={1} color={subtleText}>
                      Front
                    </Text>
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
                bg={cardBg}
                borderRadius="xl"
                border={`1px solid ${borderColor}`}
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
                    <Text mt={1} color={subtleText}>
                      Back
                    </Text>
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

            {/* SUBMIT IMAGE */}
            <Button
              flex="1"
              h="55px"
              maxW="55px"
              bg="green.500"
              borderRadius="xl"
              onClick={handleSubmit}
              isLoading={submitloading}
              isDisabled={submitloading}
            >
              <FiSend size={20} color="white" />
            </Button>
          </Flex>
        )}

        {/* CSV Mode: left CSV upload + right CSV submit (appears when file_type === 'csv') */}
        {bulkImageData.file_type === "csv" && (
          <Flex mt={4} justify="space-between" align="center" w="100%">
            {/* CSV UPLOAD BOX (LEFT) */}
            <Box
              h="80px"
              w="80px"
              bg={cardBg}
              borderRadius="xl"
              border={`1px solid ${borderColor}`}
              display="flex"
              justifyContent="center"
              alignItems="center"
              flexDirection="column"
              cursor="pointer"
              p={2}
              onClick={() => document.getElementById("csvInput").click()}
            >
              {uploading ? (
                <Spinner />
              ) : bulkImageData.csv_file ? (
                <>
                  <FiUpload size={20} color="#3182CE" />
                  <Text
                    mt={1}
                    fontSize="9px"
                    textAlign="center"
                    noOfLines={2}
                    maxW="70px"
                    color={subtleText}
                  >
                    {bulkImageData.csv_file.split("/").pop()}
                  </Text>
                </>
              ) : (
                <>
                  <FiUpload size={22} color="#3182CE" />
                  <Text fontSize="10px" mt={1} color={subtleText}>
                    CSV
                  </Text>
                </>
              )}

              <Input
                id="csvInput"
                type="file"
                display="none"
                accept=".csv"
                onChange={handleCSVUpload}
              />
            </Box>

            {/* SUBMIT ICON BUTTON (RIGHT) */}
            <Button
              h="55px"
              w="55px"
              bg="green.500"
              borderRadius="xl"
              display="flex"
              justifyContent="center"
              alignItems="center"
              cursor="pointer"
              onClick={handleSubmit}
              isLoading={submitloading}
              isDisabled={submitloading}
            >
              <FiSend size={20} color="white" />
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default BulkImageCreation;
