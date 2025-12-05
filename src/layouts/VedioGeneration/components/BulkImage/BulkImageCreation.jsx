import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Spinner,
  Input,
  useToast,
  Button,
  useColorModeValue,Progress
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
  lifestyleSelected,
  IsOutsideLifestyleShot,
}) => {



  const toast = useToast();
const [uploadingCSV, setUploadingCSV] = useState(false);
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
  const [previewdata,setpreviewdata]=useState({})
const [isLoading, setIsLoading] = useState(false);
  // NEW STATES
  const [isFirstApiDone, setIsFirstApiDone] = useState(false);
  const [isLifestyleDone, setIsLifestyleDone] = useState(false);
  const [selecteddatauser,setselecteddatauser]=useState("")
    const { colorMode } = useColorMode();
const isDark = colorMode === "dark";
  // Background notice state — used when CSV submit returns status: true but no immediate images
  const [backgroundNotice, setBackgroundNotice] = useState(null);

  // color mode aware values (option A: Chakra default dark mode)
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("#e6ecf5", "gray.700");
  const subtleText = useColorModeValue("gray.500", "gray.300");
const [frontUploading, setFrontUploading] = useState(false);
const [backUploading, setBackUploading] = useState(false);
const [shotnameoutside,setshotnameoutside]=useState(null)
const [sessionStatus, setSessionStatus] = useState(null);
useEffect(() => {
  console.log(IsOutsideLifestyleShot, lifestyleSelected);
  if (IsOutsideLifestyleShot && lifestyleSelected?.image_url) {
    setPreviewImages([lifestyleSelected?.image_url]); // wrap in array
    setSelectedImage(lifestyleSelected?.image_url);
    setIsFirstApiDone(true) 
    setshotnameoutside(lifestyleSelected?.shot_name)
    setSessionId(lifestyleSelected?.session_id)
      // select the first image
  }
}, [IsOutsideLifestyleShot, lifestyleSelected]);
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
      const backendMessage =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Upload failed. Please try again.";

    toast({
      title: "Upload Failed",
      description: backendMessage,
      status: "error",
      duration: 4000,
      isClosable: true,
    });

    throw err;
  
    }
  };

const handleSingleImage = async (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  // ⭐ Set loader only for the image being uploaded
  if (type === "front") setFrontUploading(true);
  if (type === "back") setBackUploading(true);

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
    // ⭐ Stop loader only for the selected image
    if (type === "front") setFrontUploading(false);
    if (type === "back") setBackUploading(false);
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
    setPreviewImages([]);
    setBackgroundNotice(null);
    setsubmitloading(true);
 setSessionStatus(null)
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

    // Model-specific config
    if (bulkImageData.model === 456) {
      baseBody.model_config = {
        size: bulkImageData.size,
        watermark: false,
        sequential_image_generation: bulkImageData.sequential_image_generation,
        response_format: bulkImageData.response_format,
      };
    } else if (bulkImageData.model === 789) {
      baseBody.model_config = {
        image_size: bulkImageData.image_size,
        aspect_ratio: bulkImageData.aspect_ratio,
        thinking_level: bulkImageData.thinking_level,
        search_enabled: bulkImageData.search_enabled,
      };
    }

    // -----------------------------
    // Step 1: Start bulk generation
    // -----------------------------
    const res = await axiosInstance.post("/factory_bulk_generate_product_shots/", baseBody);
    const sessionId = res?.data?.session_id;

    toast({
      title: res?.data?.message || "Bulk generation started",
      status: "success",
    });

    if (!sessionId) {
      
      setIsProcessing(false);
      setsubmitloading(false);
      return;
    }

    setSessionId(sessionId);

    // -----------------------------
    // Step 2: Polling session status every 5 sec
    // -----------------------------
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await axiosInstance.post("/factory_get_bulk_session_status/", {
          session_id: sessionId,
        });

        const sessionData = statusRes?.data?.data?.session;
        const shots = statusRes?.data?.data?.shots || [];

        if (sessionData) {
          setSessionStatus(sessionData); // for progress bar and status
          setBackgroundNotice(
            `Processing ${sessionData.completed} / ${sessionData.total_requested} images...`
          );

          // Add completed shots to preview
   setpreviewdata((prev) => {
  const updated = { ...prev };

  shots.forEach((s) => {
    if (s.status === "completed" && s.image_url && s.shot_name) {
      updated[s.image_url] = s.shot_name;
    }
  });

  return updated;
});
          const completedImages = shots
            .filter((s) => s.status === "completed" && s.image_url)
            .map((s) => s.image_url);

          setPreviewImages((prev) => Array.from(new Set([...prev, ...completedImages])));
        }
 
        // Stop polling when done or failed
        if (["completed", "failed"].includes(sessionData?.status)) {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setBackgroundNotice(null);
          setsubmitloading(false);
            setIsFirstApiDone(true);
      setIsLifestyleDone(false);
          toast({
            title: sessionData?.status === "completed" ? "Bulk generation completed!" : "Bulk generation failed!",
            status: sessionData?.status === "completed" ? "success" : "error",
          });
        }
     
      } catch (pollErr) {
        console.error("Polling error:", pollErr);
      }
    }, 5000);
  } catch (err) {
    console.error(err);
    toast({
      title: err?.response?.data?.message || err?.message || "Submit Failed",
      status: "error",
    });
    setIsProcessing(false);
    setsubmitloading(false);
  }
};








  const handleImageSelect = (url) => {
  setSelectedImage(url);
setQaMode(false)
  // Find full image data from shotMapping or API response
  const selectedData = Object.entries(previewdata).find(
    ([imageUrl]) => imageUrl === url
  );
  console.log("asf",previewdata)
  const selectedShotName = previewdata[url]; 
console.log(selectedShotName)
  console.log(previewdata)
  if (selectedData) {
    const output = {
      image_url: selectedData[0],
      shot_name: selectedData[1],
      
    };
    setselecteddatauser(selectedData)
    // console.log("Selected Image Data:", output);
  } else {
    // console.log("Selected Image URL (no extra data):", url);
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
const [lifestyleProgress, setLifestyleProgress] = useState(0);

const startLifestylePolling = (lifestyleId) => {
  setLifestyleLoading(true);
  setIsProcessing(true);

  const interval = setInterval(async () => {
    try {
      const pollRes = await axiosInstance.get(
        "/factory_get_lifestyle_shot_status/",
        { params: { lifestyle_id: lifestyleId } }
      );

      const pollData = pollRes.data.data;

      // ✅ Set full preview data here
      setpreviewdata(pollData);

      const compositions = pollData.generated_compositions || {};
      const total = Object.keys(compositions).length;

      const completed = Object.values(compositions).filter(
        (i) => i?.image_url
      ).length;

      const urls = Object.values(compositions)
        .map((i) => i?.image_url)
        .filter(Boolean);

      if (urls.length > 0) {
        setPreviewImages(urls);
        setLifestyleImages(urls);
        setSelectedImage(urls[0]);
      }

      let progressValue = 0;
      switch (pollData.status) {
        case "analyzing":
          progressValue = 10;
          break;
        case "processing":
          progressValue = 20 + (completed / total) * 40;
          break;
        case "rendering":
          progressValue = 60 + (completed / total) * 35;
          break;
        case "completed":
          progressValue = 100;
          break;
        default:
          progressValue = completed > 0 ? (completed / total) * 60 : 5;
      }

      setSessionStatus({
        completed,
        total_requested: total,
        status: pollData.status,
        progressValue,
        success_rate: `${completed}/${total}`,
      });

      // Completed
      if (pollData.status === "completed") {
        clearInterval(interval);
        setIsLifestyleDone(true);
        setIsProcessing(false);
        setLifestyleLoading(false);

        toast({
          title: "Lifestyle Generation Completed",
          status: "success",
        });

        return;
      }

      // Failed
      if (pollData.status === "failed") {
        clearInterval(interval);

        setIsProcessing(false);
        setLifestyleLoading(false);

        // ❗ You already set previewdata above so remove extra call
        Swal.fire("Failed", pollData.message || "Generation failed", "error");
        return;
      }

    } catch (err) {
      clearInterval(interval);
      setIsProcessing(false);
      setLifestyleLoading(false);
      console.log("Polling Error:", err);
    }
  }, 3000);
};









console.log(selectedImage,"asdf",selecteddatauser)
const handleGenerateLifestyle = async () => {
   setSessionStatus(null)
  if (!selectedImage) {
    toast({ title: "Select an image first", status: "warning" });
    return;
  }

  const shotName = shotMapping[selectedImage] || selecteddatauser[1] || shotnameoutside;
  if (!shotName) {
    toast({ title: "No matching shot name found", status: "error" });
    return;
  }

  const isDark = colorMode === "dark";

  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .swal2-popup { background: ${isDark ? "#14225C" : "#fff"} !important; color: ${isDark ? "#fff" : "#000"} !important; border-radius: 12px; }
    .swal2-title { color: ${isDark ? "#fff" : "#000"} !important; }
    select, input { background: ${isDark ? "#2D3748" : "#fff"} !important; color: ${isDark ? "#fff" : "#000"} !important; padding: 6px; border-radius: 6px; }
  `;
  document.head.appendChild(styleTag);

  // LOAD GUIDELINES
  let guidelineOptions = ``;
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
    console.log("Guideline Load Error:", e);
  }

  // STEP 1 POPUP
  const firstPopup = await Swal.fire({
    title: "Lifestyle Settings",
    html: `
      <div style="width:100%; max-width:350px; margin:auto;">
        <label style="font-weight:600;">Guideline</label>
        <select id="guideline" style="width:100%; height:38px;">${guidelineOptions}</select>

        <br/><br/>

        <label style="font-weight:600;">Model</label>
        <select id="model" style="width:100%; height:38px;">
          <option value="123">Model Gem</option>
          <option value="456">Model Sed</option>
          <option value="789">Model Premium</option>
        </select>

      </div>
    `,
    width: 520,
    showCancelButton: true,
    confirmButtonText: "Next",
    preConfirm: () => {
      const guideline = document.getElementById("guideline").value;
      if (!guideline) Swal.showValidationMessage("Please select a guideline");
      return guideline;
    },
  });

  if (!firstPopup.value) return;

  const guideline = document.getElementById("guideline").value;
  const model = Number(document.getElementById("model").value);
  let modelConfig = null;

  // -------- MODEL 456 POPUP --------
  if (model === 456) {
    const popup456 = await Swal.fire({
      title: "Model 456 Settings",
      html: `
        <div style="width:100%; max-width:350px; margin:auto;">
          <label style="font-weight:600;">Size</label>
          <select id="size" style="width:100%; height:38px;">
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>

          <br/><br/>

          <label style="font-weight:600;">Response Format</label>
          <select id="responseFormat" style="width:100%; height:38px;">
            <option value="url">URL</option>
            <option value="base64">Base64</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Generate",
    });

    if (!popup456.value) return;

    modelConfig = {
      size: document.getElementById("size").value,
      response_format: document.getElementById("responseFormat").value,
    };
  }

  // -------- MODEL 789 POPUP --------
  if (model === 789) {
    const popup789 = await Swal.fire({
      title: "Model 789 Settings",
      html: `
        <div style="width:100%; max-width:350px; margin:auto;">
          <label>Image Size</label>
          <select id="imageSize789" style="width:100%; height:38px;">
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>

          <br/><br/>

          <label>Aspect Ratio</label>
          <select id="aspect789" style="width:100%; height:38px;">
            <option value="9:16">9:16</option>
            <option value="16:9">16:9</option>
            <option value="1:1">1:1</option>
            <option value="3:4">3:4</option>
            <option value="4:5">4:5</option>
          </select>

          <br/><br/>

          <label>Thinking Level</label>
          <select id="thinking789" style="width:100%; height:38px;">
            <option value="high">High</option>
          </select>

          <br/><br/>

          <label>Search Enabled</label>
          <select id="search789" style="width:100%; height:38px;">
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Generate",
    });

    if (!popup789.value) return;

    modelConfig = {
      image_size: document.getElementById("imageSize789").value,
      aspect_ratio: document.getElementById("aspect789").value,
      thinking_level: document.getElementById("thinking789").value,
      search_enabled: document.getElementById("search789").value === "true",
    };
  }

  // FINAL API BODY for Lifestyle
  const body = {
    user_id: selectedUser?.user_id,
    session_id: sessionId,
    source_shot: shotName,
    model,
    image_guideline_id: guideline,
    ...(modelConfig ? { model_config: modelConfig } : {}),
  };

  try {
    if (lifestyleController) lifestyleController.abort();
    lifestyleController = new AbortController();
    setLifestyleLoading(true);

    // LIFESTYLE API
    const res = await axiosInstance.post(
      "/factory_generate_bulk_lifestyle_shots/",
      body,
      { signal: lifestyleController.signal }
    );

    const data = res.data;
    const lifestyleId = data.lifestyle_id;
console.log("asf",lifestyleId)
    // Show whatever URLs API returns in first response
    // const urls = Object.values(data.image_urls || {}).filter(Boolean);

    // setLifestyleImages(urls);
    // setPreviewImages(urls);
    // setSelectedImage(urls[0] || null);
    setpreviewdata(data);

    // setIsLifestyleDone(false); // IMPORTANT → still running
setLifestyleLoading(false);
    // ---- START POLLING ----
    startLifestylePolling(lifestyleId);

  } catch (err) {
    if (err.name !== "CanceledError") {
      Swal.fire("Failed", err?.response?.data?.message || "Error", "error");
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
     setSessionStatus(null)

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
  console.log("pre",previewdata)
  if (!selectedImage) {
    Swal.fire("Error", "No image selected", "error");
    return;
  }

  console.log("pre",previewdata)
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
            <option value="123">Model Gem</option>
          <option value="456">Model Sed</option>
          <option value="789">Model Premium</option>
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
// const handleGenerateBulkImages = async () => {
//   const shotName = shotMapping[selectedImage];
//   if (!shotName) {
//     // toast({ title: "No matching shot name found", status: "error" });
//     return;
//   }

//   const body = {
//     user_id: selectedUser?.user_id,
//     session_id: sessionId,
//     source_shot: shotName,
//     model: 123, // You can allow user to select this dynamically too
//     image_guideline_id: guidelineToSend,
//   };

//   try {
//     setIsLoading(true);

//     const res = await axiosInstance.post("/factory_generate_bulk_lifestyle_shots/", body);
//     const data = res.data.data;

//     // Filter out only valid URLs
//     const lifestyleUrls = Object.values(data.image_urls).filter((url) => url);

//     setLifestyleImages(lifestyleUrls);
//     setPreviewImages(lifestyleUrls);
//     setSelectedImage(lifestyleUrls[0]);
//     setpreviewdata(data);
//     setIsLifestyleDone(true);

//     Swal.fire("Success!", "Lifestyle images generated successfully", "success");
//   } catch (err) {
//     console.error(err);
//     Swal.fire("Error", err?.response?.data?.message || "Failed to generate images", "error");
//   } finally {
//     setIsLoading(false);
//   }
// };


// code new 
const [qaLoading, setQaLoading] = useState(false);
const [qcrPreview, setQcrPreview] = useState(null);
const [qcrProgress, setQcrProgress] = useState(0);
let qualityController = null;


  {/* -----------------------------------------------------
         STATES YOU MUST ADD OUTSIDE THIS RETURN:
         ----------------------------------------------
    const [qaMode, setQaMode] = useState(false);
    const [selectedImagesForQA, setSelectedImagesForQA] = useState([]);
    ----------------------------------------------------- */}

  {/* Image toggle functions */}
  {/* SINGLE SELECT (video/edit) */}
    const [qaMode, setQaMode] = useState(false);
    const [selectedImagesForQA, setSelectedImagesForQA] = useState([]);

  {/* MULTI SELECT (quality analysis) */}
  const toggleMultiSelect = (url) => {
    setSelectedImagesForQA((prev) =>
      prev.includes(url)
        ? prev.filter((img) => img !== url) // remove
        : [...prev, url]                    // add
    );

  };

const handleQAMultiSelect = (imageUrl) => {
  setSelectedImagesForQA((prev) => {
    if (prev.includes(imageUrl)) {
      // remove if already selected
      return prev.filter((img) => img !== imageUrl);
    }
    // add new
    return [...prev, imageUrl];
  });

  console.log("asfd",)
};



  {/* QUALITY ANALYSIS ACTION */}
const handleQualityAnalysis = async () => {
  if (!selectedImagesForQA || selectedImagesForQA.length === 0) {
    toast({ title: "Select shots first", status: "warning" });
    return;
  }

  const isDark = colorMode === "dark";

  // Popup theme injection
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    .swal2-popup { background: ${isDark ? "#14225C" : "#fff"} !important; 
                   color: ${isDark ? "#fff" : "#000"} !important;
                   border-radius: 12px; }
    .swal2-title { color: ${isDark ? "#fff" : "#000"} !important; }
    select, input { background: ${isDark ? "#2D3748" : "#fff"} !important; 
                    color: ${isDark ? "#fff" : "#000"} !important;
                    padding: 6px; border-radius: 6px; }
  `;
  document.head.appendChild(styleTag);

  // -------------------- SETTINGS POPUP --------------------
  const popup = await Swal.fire({
    title: "Quality Analysis Settings",
    html: `
      <div style="width:100%; max-width:350px; margin:auto;">
        <label style="font-weight:600;">Auto Refine</label>
        <select id="autoRefine" style="width:100%; height:38px;">
          <option value="true">Enabled</option>
          <option value="false">Disabled</option>
        </select>

        <br /><br />

        <label style="font-weight:600;">Max Refinement Iterations</label>
        <select id="maxRefine" style="width:100%; height:38px;">
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>
    `,
    width: 520,
    showCancelButton: true,
    confirmButtonText: "Run QCR",
  });

  if (!popup.value) return;

  // read popup values
  const autoRefine = document.getElementById("autoRefine").value === "true";
  const maxRefine = Number(document.getElementById("maxRefine").value);
const analyzeShots = selectedImagesForQA.map((url) => previewdata[url]);

if (!analyzeShots.length) {
  toast({ title: "Shot names missing", status: "warning" });
  return;
}
  // --------------- API BODY ----------------
  const body = {
    user_id: selectedUser?.user_id,
    session_id: sessionId, // SAME as lifestyle
    analyze_shots: analyzeShots,
    auto_refine: autoRefine,
    max_refinement_iterations: maxRefine,
  };

  try {
    if (qualityController) qualityController.abort();
    qualityController = new AbortController();

    setQaLoading(true); // SAME AS OTHER FUNCTION

    
    // --------------- CALL ANALYSIS API ----------------
    const res = await axiosInstance.post(
      "/api/bulk-shots/quality-analysis/",
      body,
      { signal: qualityController.signal }
    );

    const result = res.data;
    const qcrSessionId = result?.data?.session_id;

    // first update to UI
    setQcrPreview(result.data);

    // --------------- START POLLING ----------------
    startQCRPolling(qcrSessionId);

  } catch (err) {
    if (err.name !== "CanceledError") {
      Swal.fire("Failed", err?.response?.data?.message || "Something went wrong", "error");
    }
  } finally {
    setQaLoading(false);
  }
};
const startQCRPolling = (sessionId) => {
  if (!sessionId) return;

  const interval = setInterval(async () => {
    try {
      const res = await axiosInstance.get("/api/bulk-shots/quality-status/", {
        params: { session_id: sessionId },
      });

      const data = res.data?.data;

      // Update UI on every poll
      setQcrPreview(data);

      // If API provides percentage
      if (data?.progress !== undefined) {
        setQcrProgress(data.progress); // 0-100%
      }

      // stop polling
      if (data?.status === "completed" || data?.status === "failed") {
        clearInterval(interval);
        setQaLoading(false);
      }

    } catch (e) {
      console.log("QCR polling error:", e);
      clearInterval(interval);
    }
  }, 3000); // polls every 3 seconds
};



  {/* CLEAR ALL */}
  const handleClearAll = () => {
    setSelectedImage(null);
    setSelectedImagesForQA([]);
    setQaMode(false);
    handleClear(); // your original clear function
  };

  useEffect(() => {
  setQaMode(bulkImageData?.quality_analysis === true);
}, [bulkImageData?.quality_analysis]);

  




  return (
    <Box w="100%" p={5}>
  {/* -----------------------------------------------------
         STATES YOU MUST ADD OUTSIDE THIS RETURN:
         ----------------------------------------------
    const [qaMode, setQaMode] = useState(false);
    const [selectedImagesForQA, setSelectedImagesForQA] = useState([]);
    ----------------------------------------------------- */}

  {/* Image toggle functions */}
  {/* SINGLE SELECT (video/edit) */}
  

  {/* MULTI SELECT (quality analysis) */}
 

  {/* QUALITY ANALYSIS ACTION */}
 

  return (
    <>
      {/* ------------------------------------------
            PREVIEW BOX
      ------------------------------------------- */}
     <Box
  w="100%"
  h="350px"
  bg={cardBg}
  borderRadius="xl"
  border={`1px solid ${borderColor}`}
  mt="-20px"
  p={4}
  overflow="hidden"
  position="relative"
>
  {/* ------------------------------------------
        Processing overlay with progress bar
  ------------------------------------------- */}
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
    gap={4}
    p={4}
  >
    <Spinner size="lg" />

    {sessionStatus ? (
      <Flex justify="center" align="center" flexDirection="column" w="100%" maxW="400px">
        <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
          {`Processing ${sessionStatus.completed} / ${sessionStatus.total_requested} images`}
        </Text>

        <Progress
          value={(sessionStatus.completed / sessionStatus.total_requested) * 100}
          size="lg"
          colorScheme="purple"
          borderRadius="md"
          width="100%"
          hasStripe
          isAnimated
        />

        <Text fontSize="sm" color={subtleText} mt={2}>
          {sessionStatus.status === "completed"
            ? `All images processed successfully (${sessionStatus.success_rate})`
            : "Please wait while your images are being generated..."}
        </Text>
      </Flex>
    ) : (
      <Text mt={3} fontSize="18px" fontWeight="600" color={textColor}>
        Your product shots are being generated. This may take 2–3 minutes.
      </Text>
    )}
  </Flex>
)}

{qaLoading && (
  <Box w="100%" mt={3}>
    <Progress value={qcrProgress} size="lg" isAnimated />
    <Text mt={2} fontSize="sm" textAlign="center">
      Processing... {qcrProgress}%
    </Text>
  </Box>
)}
  {/* ------------------------------------------
        Lifestyle loading
  ------------------------------------------- */}
  {lifestyleLoading && (
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
    gap={4}
    p={4}
  >
    <Spinner size="lg" />

    {sessionStatus ? (
      <Flex justify="center" align="center" flexDirection="column" w="100%" maxW="400px">
        <Text fontSize="lg" fontWeight="600" color={textColor} mb={2}>
          {`Processing ${sessionStatus.completed} / ${sessionStatus.total_requested} images`}
        </Text>

        <Progress
          value={(sessionStatus.completed / sessionStatus.total_requested) * 100}
          size="lg"
          colorScheme="purple"
          borderRadius="md"
          width="100%"
          hasStripe
          isAnimated
        />

        <Text fontSize="sm" color={subtleText} mt={2}>
          {sessionStatus.status === "completed"
            ? `All images processed successfully (${sessionStatus.success_rate})`
            : "Please wait while your images are being generated..."}
        </Text>
      </Flex>
    ) : (
      <Text mt={3} fontSize="18px" fontWeight="600" color={textColor}>
        Your product shots are being generated. This may take 2–3 minutes.
      </Text>
    )}
  </Flex>
  )}

  {/* ------------------------------------------
        CSV / Background notice
  ------------------------------------------- */}
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

  {/* ------------------------------------------
        Default Preview Placeholder
  ------------------------------------------- */}
  {!previewImages.length && !isProcessing && !backgroundNotice && (
    <Flex justify="center" align="center" h="100%">
      <Text fontSize="18px" color={subtleText}>
        Preview Area
      </Text>
    </Flex>
  )}

  {/* ------------------------------------------
        IMAGE PREVIEW CAROUSEL
  ------------------------------------------- */}
  {!!previewImages.length && (
    <Flex
      gap={3}
      overflowX="auto"
      h="90%"
      align="center"
      sx={{
        scrollBehavior: "smooth",
        scrollSnapType: "x mandatory",
        perspective: "1000px",
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {previewImages.map((url, index) => {
        const isSelected =
          qaMode
            ? selectedImagesForQA.includes(url) // multi-select mode
            : selectedImage === url;            // single-select

        return (
          <Box
            key={index}
            minW="220px"
            h="100%"
            position="relative"
            borderRadius="20px"
            overflow="hidden"
            cursor="pointer"
            onClick={() =>
              qaMode
                ? handleQAMultiSelect(url)
                : handleImageSelect(url)
            }
            transition="all 0.3s ease"
            border={
              isSelected
                ? "5px solid #3B82F6"
                : `2px solid ${borderColor}`
            }
          >
            {isSelected && (
              <Box
                position="absolute"
                inset="0"
                bg="rgba(59,130,246,0.12)"
                pointerEvents="none"
                transition="all 0.3s ease"
              />
            )}

            <Image
              src={url}
              w="100%"
              h="100%"
              objectFit="contain"
              borderRadius="md"
              transition="all 0.3s ease"
            />
          </Box>
        );
      })}
    </Flex>
  )}
</Box>


      {/* ------------------------------------------
            ACTION BUTTONS
      ------------------------------------------- */}
      <Flex mt={4} justify="center" gap={3}>
{isFirstApiDone && !isLifestyleDone && (
  <Flex flexDirection="column" alignItems="center" gap={2}>
    {/* Generate Lifestyle Button */}
    <Button
      colorScheme="purple"
      onClick={handleGenerateLifestyle}
      isLoading={lifestyleLoading}
      isDisabled={qaMode} // Disable if QA mode is active
    >
      Generate Lifestyle
    </Button>

    {/* Show message if QA mode is active */}
    {qaMode && (
      <Text fontSize="13px" color="red.400" textAlign="center">
        Disable QCR to generate Lifestyle
      </Text>
    )}
  </Flex>
)}

        
          {isFirstApiDone && !isLifestyleDone && (
           <Flex flexDirection="column" alignItems="center">
    
    {/* Quality Analysis Button */}
    <Button
      colorScheme="yellow"
      onClick={() => {
        setQaMode(true);
        handleQualityAnalysis();
      }}
      isDisabled={selectedImagesForQA.length === 0 && !qaMode}
      w="180px"
    >
      {qaMode ? "Run QCR" : "QCR"}
    </Button>

    {/* Show message when disabled */}
    {(selectedImagesForQA.length === 0 && !qaMode) && (
      <Text
        mt={2}
        fontSize="13px"
        color="red.400"
        textAlign="center"
      >
        Enable Quality Analysis from sidebar
      </Text>
    )}

  </Flex>
        )}

        {(isFirstApiDone || isLifestyleDone) && (
          <Button
            colorScheme="purple"
            onClick={handleCreateVideo}
            isDisabled={!selectedImage}
          >
            Create Video
          </Button>
        )}




        {(isFirstApiDone && isLifestyleDone) && (
          <Button colorScheme="blue" onClick={handleEdit}>
            Edit Image
          </Button>
        )}

        {(isFirstApiDone || isLifestyleDone) && (
          <Button colorScheme="red" onClick={handleClearAll}>
            Clear
          </Button>
        )}
      </Flex>

      {/* ------------------------------------------
            IMAGE / CSV INPUT AREA (unchanged from your code)
      ------------------------------------------- */}
      <Box mt={3}>

        {/* IMAGE MODE UPLOADS */}
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
                {frontUploading ? (
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
                    <Text mt={1} color={subtleText}>Front</Text>
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
                {backUploading ? (
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
                    <Text mt={1} color={subtleText}>Back</Text>
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

        {/* CSV MODE */}
        {bulkImageData.file_type === "csv" && (
          <Flex mt={4} justify="space-between" align="center" w="100%">
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
              {uploadingCSV ? (
                <Spinner />
              ) : bulkImageData.csv_file ? (
                <>
                  <FiUpload size={20} />
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

            <Button
              h="55px"
              w="55px"
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
      </Box>
    </>
  
</Box>

  );
};

export default BulkImageCreation;
