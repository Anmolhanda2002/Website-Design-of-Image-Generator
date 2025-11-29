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
import Swal from "sweetalert2";
import { useColorMode } from "@chakra-ui/react";

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
  const [previewdata,setpreviewdata]=useState([])
const [isLoading, setIsLoading] = useState(false);
  // NEW STATES
  const [isFirstApiDone, setIsFirstApiDone] = useState(false);
  const [isLifestyleDone, setIsLifestyleDone] = useState(false);
    const { colorMode } = useColorMode();
const isDark = colorMode === "dark";
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

    const userId = selectedUser?.user_id;

    const baseBody = {
      user_id: userId,
      model: Number(bulkImageData.model),
      image_guideline_id: bulkImageData.image_guideline_id,
      customer_id: `CRM-${userId}`,
      product_id: generateShortUUID(),
      product_name: bulkImageData.product_name,
      product_type: bulkImageData.product_type,
      shot_type: "studio_shots",
      product_images: bulkImageData.product_images,
    };

    // ------------------------------------------
    // 🔥 MODEL 456 → ADD model_config
    // ------------------------------------------
    if (bulkImageData.model === 456) {
      baseBody.model_config = {
        image_size: bulkImageData.image_size,
        aspect_ratio: bulkImageData.aspect_ratio,
        thinking_level: bulkImageData.thinking_level,
        search_enabled: bulkImageData.search_enabled,
      };
    }

    console.log("FINAL BODY SENT:", baseBody);

    const res = await axiosInstance.post(
      "/factory_bulk_generate_product_shots/",
      baseBody
    );

    const apiData = res?.data?.data;

    if (!apiData) {
      setBackgroundNotice(
        res?.data?.message ||
          "Processing started in background. Results will appear here."
      );
      return;
    }

    setSessionId(apiData.session_id);

    const finalImages = Array.from(
      new Set([
        apiData.base_shot?.image_url,
        ...((apiData.generated_shots || []).map((s) => s.image_url) || []),
      ].filter(Boolean))
    );

    const mapping = {};
    apiData.generated_shots?.forEach((s) => {
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



  const handleImageSelect = (url) => {
  setSelectedImage(url);

  // Find full image data from shotMapping or API response
  const selectedData = Object.entries(previewdata).find(
    ([imageUrl]) => imageUrl === url
  );

  console.log(previewdata)
  if (selectedData) {
    const output = {
      image_url: selectedData[0],
      shot_name: selectedData[1],
    };
    console.log("Selected Image Data:", output);
  } else {
    console.log("Selected Image URL (no extra data):", url);
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
setpreviewdata([])
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
let lifestyleController = null;

const handleGenerateLifestyle = async () => {
  if (!selectedImage) {
    toast({ title: "Select an image first", status: "warning" });
    return;
  }

  const shotName = shotMapping[selectedImage];
  if (!shotName) {
    toast({ title: "No matching shot name found", status: "error" });
    return;
  }

  // Detect App Theme (Chakra's color mode)
  const isDark = colorMode === "dark";

  // Common Swal Style for Dark/Light Mode
  const swalStyles = `
    .swal2-popup {
      background: ${isDark ? "#14225C" : "#fff"} !important;
      color: ${isDark ? "#fff" : "#000"} !important;
      border-radius: 12px;
    }

    .swal2-title {
      color: ${isDark ? "#fff" : "#000"} !important;
    }

    .swal2-html-container {
      color: ${isDark ? "#fff" : "#000"} !important;
    }

    select, input {
      background: ${isDark ? "#2D3748;" : "#fff"} !important;
      color: ${isDark ? "#fff" : "#000"} !important;
      border: 1px solid ${isDark ? "#2D3748;" : "#ccc"} !important;
      border-radius: 6px;
      padding: 6px;
    }

    .swal2-confirm {
      background-color: ${isDark ? "#4d6bff" : "#1a66ff"} !important;
      color: white !important;
      border-radius: 6px !important;
    }

    .swal2-cancel {
      background-color: ${isDark ? "#333" : "#d3d3d3"} !important;
      color: ${isDark ? "#fff" : "#000"} !important;
      border-radius: 6px !important;
    }
  `;

  // Inject Dark/Light Mode Styles into HTML Head
  const styleTag = document.createElement("style");
  styleTag.innerHTML = swalStyles;
  document.head.appendChild(styleTag);

  // ===================================================
  // LOAD GUIDELINES
  // ===================================================
  let guidelineOptions = `<option value="">Default (Current Guideline)</option>`;

  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const selected = JSON.parse(localStorage.getItem("selected_user"));
    const userId = selected?.user_id || user?.user_id;

    const guidelineRes = await axiosInstance.get(
      "/list_active_image_guidelines/",
      { params: { name: "", user_id: userId, limit: 50, page: 1 } }
    );

    (guidelineRes.data?.results || []).forEach((gd) => {
      guidelineOptions += `<option value="${gd.guideline_id}">${gd.name}</option>`;
    });
  } catch (e) {
    console.log("Error loading guidelines:", e);
  }

  // ===================================================
  // STEP 1 POPUP
  // ===================================================
  const firstPopup = await Swal.fire({
    title: "Lifestyle Settings",
    html: `
      <div style="width:100%; max-width:350px; margin:auto;">

        <label style="font-weight:600; margin-bottom:6px;">Guideline</label>
        <select id="guideline" style="width:100%; height:38px;">
          ${guidelineOptions}
        </select>

        <br/><br/>

        <label style="font-weight:600; margin-bottom:6px;">Model</label>
        <select id="model" style="width:100%; height:38px;">
          <option value="123">Model 123 (Default)</option>
          <option value="456">Model 456</option>
        </select>

      </div>
    `,
    width: 520,
    customClass: { popup: "no-scroll-popup" },
    background: isDark ? "#14225C" : "#fff",
    color: isDark ? "#fff" : "#000",
    showCancelButton: true,
    confirmButtonText: "Next",
  });

  if (!firstPopup.value) return;

  const guideline = document.getElementById("guideline").value;
  const model = Number(document.getElementById("model").value);

  // ===================================================
  // STEP 2 POPUP (MODEL 456)
  // ===================================================
  let extraConfig = null;

  if (model === 456) {
    const secondPopup = await Swal.fire({
      title: "Model 456 Settings",
      html: `
        <div style="width:100%; max-width:350px; margin:auto;">

          <label style="font-weight:600;">Image Size</label>
          <select id="imageSize" style="width:100%; height:38px;">
            <option value="4K">4K</option>
            <option value="2K">2K</option>
            <option value="1080p">1080p</option>
          </select>

          <br/><br/>

          <label style="font-weight:600;">Aspect Ratio</label>
          <select id="aspect" style="width:100%; height:38px;">
            <option value="9:16">9:16</option>
            <option value="16:9">16:9</option>
            <option value="1:1">1:1</option>
          </select>

        </div>
      `,
      width: 520,
      background: isDark ? "#14225C" : "#fff",
      color: isDark ? "#fff" : "#000",
      showCancelButton: true,
      confirmButtonText: "Generate",
    });

    if (!secondPopup.value) return;

    extraConfig = {
      image_size: document.getElementById("imageSize").value,
      aspect_ratio: document.getElementById("aspect").value,
    };
  }

  // ===================================================
  // FINAL API BODY
  // ===================================================
  const body = {
    user_id: selectedUser?.user_id,
    session_id: sessionId,
    source_shot: shotName,
    model,
    image_guideline_id: guideline || bulkImageData?.image_guideline_id,
    ...(model === 456
      ? {
          model_config: {
            ...extraConfig,
            search_enabled: true,
            media_resolution: "media_resolution_high",
          },
        }
      : {}),
  };

  try {
    if (lifestyleController) lifestyleController.abort();
    lifestyleController = new AbortController();
    setLifestyleLoading(true);

    const res = await axiosInstance.post(
      "/factory_generate_bulk_lifestyle_shots/",
      body,
      { signal: lifestyleController.signal }
    );

    const data = res.data.data;
    const lifestyleUrls = Object.values(data.image_urls).filter(Boolean);

    setLifestyleImages(lifestyleUrls);
    setPreviewImages(lifestyleUrls);
    setSelectedImage(lifestyleUrls[0]);
    setpreviewdata(data);
    setIsLifestyleDone(true);
  } catch (err) {
    if (err.name !== "CanceledError") {
      Swal.fire("Failed", err?.response?.data?.message, "error");
    }
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
setLifestyleLoading(false);
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



// Handle editing a selected image
const handleEdit = async () => {
  if (!selectedImage) {
    Swal.fire("Error", "No image selected", "error");
    return;
  }

  if (!previewdata || !previewdata.generated_variations) {
    Swal.fire("Error", "No generated variations available", "error");
    return;
  }

  // --- IMPORTANT ---
  // Find the selected variation by URL
  const selectedImageData =
    previewdata.generated_variations.find(
      (item) => item.image_url === selectedImage
    ) ||
    previewdata.generated_variations.find(
      (item) => item.edited_image_url === selectedImage
    );

  if (!selectedImageData) {
    Swal.fire("Error", "Selected image data missing", "error");
    return;
  }

  // Swal ask user for edit prompt
  const { value: editData } = await Swal.fire({
    title: "Edit Lifestyle Image",
    html: `
      <div style="display:flex; flex-direction:column; gap:10px; text-align:left;">
        <label style="font-weight:bold;">Prompt</label>
        <textarea id="editPrompt" class="swal2-textarea" rows="4" placeholder="Enter edit instructions"></textarea>

        <label style="font-weight:bold;">Model</label>
        <select id="editModel" class="swal2-select">
          <option value="123">123 - Nano Banana</option>
          <option value="789" selected>789 - Pro</option>
        </select>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Submit",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      const prompt = document.getElementById("editPrompt").value.trim();
      const model = Number(document.getElementById("editModel").value);
      if (!prompt) {
        Swal.showValidationMessage("Prompt cannot be empty");
        return false;
      }
      return { prompt, model };
    },
  });

  if (!editData) return;

  // Loading Swal
  Swal.fire({
    title: "Processing...",
    html: "Editing image... This may take 2–3 minutes.",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    // Sending API request
    const body = {
      user_id: selectedUser?.user_id,
      lifestyle_id: previewdata.lifestyle_id,

      // IMPORTANT: If edited_composition_id exists → use that for next edit
      composition_id:
        selectedImageData.edited_composition_id ||
        selectedImageData.composition_id,

      prompt: editData.prompt,
      model: editData.model || 789,
    };

    const res = await axiosInstance.post(
      "/factory_edit_lifestyle_composition/",
      body
    );

    const editedImageUrl = res.data?.data?.edited_image_url;
    const editedCompositionId = res.data?.data?.edited_composition_id;
    const originalCompositionId = res.data?.data?.original_composition_id;

    if (!editedImageUrl || !editedCompositionId) {
      Swal.close();
      Swal.fire("Error", "Invalid API response", "error");
      return;
    }

    Swal.close();

    // Preview Swal
    const { isConfirmed } = await Swal.fire({
      title: "Edited Image Preview",
      html: `<img src="${editedImageUrl}" style="width:100%;border-radius:8px;" />`,
      showCancelButton: true,
      confirmButtonText: "Use this Image",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    // Add this new edited image as NEW VARIATION ✔
    setpreviewdata((prev) => ({
      ...prev,
      generated_variations: [
        ...prev.generated_variations,
        {
          image_url: editedImageUrl,
          composition_id: editedCompositionId,
          original_composition_id: originalCompositionId,
          is_edited: true,
        },
      ],
    }));

    // Add to preview list
    setPreviewImages((prev) => [...prev, editedImageUrl]);

    // Select the new edited image
    setSelectedImage(editedImageUrl);

    Swal.fire("Success!", "Image edited successfully!", "success");
  } catch (err) {
    Swal.close();
    Swal.fire(
      "Error",
      err?.response?.data?.message ||
        err.message ||
        "Failed to edit image",
      "error"
    );
  }
};



// Generate bulk lifestyle images
const handleGenerateBulkImages = async () => {
  const shotName = shotMapping[selectedImage];
  if (!shotName) {
    // toast({ title: "No matching shot name found", status: "error" });
    return;
  }

  const body = {
    user_id: selectedUser?.user_id,
    session_id: sessionId,
    source_shot: shotName,
    model: 123, // You can allow user to select this dynamically too
    image_guideline_id: guidelineToSend,
  };

  try {
    setIsLoading(true);

    const res = await axiosInstance.post("/factory_generate_bulk_lifestyle_shots/", body);
    const data = res.data.data;

    // Filter out only valid URLs
    const lifestyleUrls = Object.values(data.image_urls).filter((url) => url);

    setLifestyleImages(lifestyleUrls);
    setPreviewImages(lifestyleUrls);
    setSelectedImage(lifestyleUrls[0]);
    setpreviewdata(data);
    setIsLifestyleDone(true);

    Swal.fire("Success!", "Lifestyle images generated successfully", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", err?.response?.data?.message || "Failed to generate images", "error");
  } finally {
    setIsLoading(false);
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
  Your product shots are being generated. This may take 2–3 minutes.
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
  Creating lifestyle visuals… Estimated time: 2–3 minutes.
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
                onClick={() => handleImageSelect(url)}
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
         {(isFirstApiDone && isLifestyleDone) && (
          <Button
  colorScheme="blue"
  onClick={handleEdit}
>
  Edit Image
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
