import React ,{useRef,useCallback} from "react";
import {
    Box,
    VStack,
    Text,
    Select,
    RadioGroup,
    Radio,
    Stack,
    Input,
    useColorModeValue,
    Textarea,
    useToast,
    Spinner,
    HStack,
    SimpleGrid,
    Icon,
    Button,Switch,
    Flex,Progress,
   
} from "@chakra-ui/react";
import { useState, useEffect, startTransition } from "react";
import axiosInstance from "utils/AxiosInstance";
import { MdAccessTime, MdMovieEdit } from "react-icons/md";
import { MdCrop169, MdCropPortrait, MdCropSquare } from "react-icons/md";
import { useColorMode } from "@chakra-ui/react";
export default function Panel({
    activeTab,
    model,
    setModel,
    duration,
    setDuration,
    resolution,
    setResolution,
    ratio,
    setRatio,
    onDataChange,
    imageCreationSettings,
    setImageCreationSettings,
    resizeImageSettings,
    setResizeImageSettings,
    imageToVideoSettings,
    setImageToVideoSettings,
    captionData,
    setCaptionData,
    MergeData,
    setMergeData,
    selectedUser, bulkImageData, setBulkImageData,MusicData,SetMusicData
}) {
    const panelBg = useColorModeValue("white", "gray.800");
const textcolor = useColorModeValue("black", "white");
const file = useColorModeValue("white","gray.700")

    const { colorMode } = useColorMode();
    // console.log(bulkImageData)

    // We keep this simple logger, no need for transition
    // const handleChange = (field, value) => {
    //     console.log(`[${activeTab}] ${field}:`, value);
    // };

    const [searchTerm, setSearchTerm] = useState("");
    const [guidelines, setGuidelines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [useCases, setUseCases] = useState([]);
const [loadingUseCase, setLoadingUseCase] = useState(false);
const [projects, setProjects] = useState([]);
const [projectSearch, setProjectSearch] = useState("");
const [loadingProjects, setLoadingProjects] = useState(false);
 const [lifestyleIds, setLifestyleIds] = useState([]);
    const toast = useToast();
   // ✅ get context
  const prevUserIdRef = useRef(null);
// console.log(selectedUser)
    const [dropdownData, setDropdownData] = useState({
        video_dimensions_choices: {},
        sector_choices: [],
        M_key: {},
    });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ✅ upload video function
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video_files", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const res = await axiosInstance.post("/upload_direct_video/", formData, {
        headers: { "Content-Type": "multipart/form-data" },

        // ✅ Progress bar updater
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 100) / p.total);
          setUploadProgress(percent);
        },
      });

      const url = res.data?.video_urls?.[0];

      if (url) {
        // ✅ Auto-fill Brand Outro URL
        startTransition(() =>
          setMergeData({
            ...MergeData,
            brand_outro_video_url: url,
          })
        );

        toast({
          title: "Video Uploaded Successfully",
          description: "Brand outro URL filled automatically.",
          status: "success",
          duration: 2000,
        });
      }
    } catch (err) {
      toast({
        title: "Upload Failed",
        status: "error",
        duration: 2500,
      });
    } finally {
      setUploading(false);
    }
  };



  

    // 🔍 Fetch Guidelines from API (Debounced using useEffect)
    const searchTimeout = useRef(null);
const loadAllGuidelines = useCallback(async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const selected = JSON.parse(localStorage.getItem("selected_user"));
      const userId = selected?.user_id || user?.user_id;

      const res = await axiosInstance.get("/list_active_image_guidelines/", {
        params: {
          name: "",
          user_id: userId,
          limit: 50,
          page: 1,
        },
      });

      const result =
        Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
          ? res.data
          : [];

      setGuidelines(result);
    } catch (err) {
      console.error("Error fetching guidelines:", err);
    } finally {
      setLoading(false);
    }
  }, []);


const fetchProjects = useCallback(async (searchTerm) => {
  try {
    setLoadingProjects(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const selected = JSON.parse(localStorage.getItem("selected_user"));
    const userId = selected?.user_id || user?.user_id;

    const res = await axiosInstance.get("/saved_projects/", {
      params: {
        user_id: userId,
        project_name: searchTerm,
      },
    });

    const result = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    setProjects(result);
  } catch (err) {
    console.error("Error fetching projects:", err);
    setProjects([]);
  } finally {
    setLoadingProjects(false);
  }
}, []);


  // ✅ Only refetch when selected user changes
  useEffect(() => {
    const currentUserId = selectedUser?.user_id;
    if (!currentUserId) return;

    // skip on first mount
    if (prevUserIdRef.current === null) {
      prevUserIdRef.current = currentUserId;
      return;
    }

    if (currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId;
      loadAllGuidelines();
      fetchProjects() // 👈 refetch when user changes
    }
  }, [selectedUser, loadAllGuidelines]);
useEffect(() => {
  if (!searchTerm.trim()) {
    loadAllGuidelines();
    fetchProjects()   // ✅ When search is empty → show all again
    return;
  }

  if (searchTimeout.current) clearTimeout(searchTimeout.current);

  searchTimeout.current = setTimeout(() => {
    loadAllGuidelines();
    fetchProjects()    // ✅ Run search
  }, 400);
}, [searchTerm]);

 useEffect(() => {
    // ✔ Only run when active tab is "image_to_video"
    if (activeTab !== "Image to Video") return;

    if (!selectedUser?.user_id) return;

    axiosInstance
      .get(`/get_lifestyle_ids/?user_id=${selectedUser.user_id}`)
      .then((res) => {
        setLifestyleIds(res.data.lifestyle_ids || []);
      })
      .catch((err) => {
        console.error("Error fetching lifestyle IDs", err);
      });
  }, [activeTab, selectedUser]);



    // Section for image to video (Dropdown fetches)
    const generateShortUUID = () => {
        return (
            "PRD-" +
            Math.random().toString(36).substring(2, 10) +
            "-" +
            Date.now().toString(36)
        ).slice(0, 48);
    };


    const fetchUseCases = useCallback(async () => {
    try {
      setLoadingUseCase(true);
      const res = await axiosInstance.get("/get_image_guideline_choices");

      const data = res.data?.data?.use_case_choices || {};
      const formatted = Object.entries(data).map(([label, value]) => ({
        label,
        value,
      }));

      setUseCases(formatted);
    } catch (err) {
      console.error("Error fetching use case choices:", err);
    } finally {
      setLoadingUseCase(false);
    }
  }, []);
// console.log("Current QA value:", bulkImageData.quality_analysis);
  // ✅ Re-fetch ONLY when selected user changes AND tab = "Image Creation"
  useEffect(() => {
    if (activeTab !== "Image Creation") return;


    // 🔹 On first mount
    
   
      fetchUseCases();
 


  }, [activeTab, selectedUser?.user_id, fetchUseCases]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true); // Set loading while fetching dropdowns
            try {
                const res = await axiosInstance.get("/get_creation_dropdowns/");
                if (res.data.status === "success") {
                    setDropdownData(res.data.data);
                }
            } catch (err) {
                toast({
                    title: "Error fetching dropdown data",
                    description: err.message,
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
            } finally {
                setLoading(false);
            }
        };

        // Get user_id from localStorage for default settings
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.user_id) {
            setImageToVideoSettings((prev) => ({
                ...prev,
                customer_ID: `CRM-${user.user_id}`,
                product_ID: generateShortUUID(),
            }));
        }

        fetchDropdowns();
    }, []);

    // Ensure initial loading is handled
    if (loading && !dropdownData.sector_choices.length) return <Spinner size="lg" mt={5} />;

    const { video_dimensions_choices, sector_choices, M_key } = dropdownData;


    const renderPanelContent = () => {
        switch (activeTab) {
case "Studio Shot":
  return (
    <VStack align="stretch" spacing={4}>
      
      {/* 🔍 Search Image Guidelines */}
      <Box>
        <Text fontWeight="bold">Search Image Guidelines</Text>
        <Input
          placeholder="Enter guideline name..."
          value={searchTerm}
          _placeholder={{color:textcolor}}
color={textcolor}
          onChange={(e) => {
            const value = e.target.value;
            startTransition(() => setSearchTerm(value));
          }}
          mt={2}
        />
      </Box>

      {/* 🧩 Select Guideline */}
      <Box mt={3}>
        <Text fontWeight="bold">Select Guideline</Text>

        {loading ? (
          <Spinner mt={3} />
        ) : (
          <Select
            placeholder="Select guideline"
            value={bulkImageData.image_guideline_id}
            onChange={(e) =>
              setBulkImageData((prev) => ({
                ...prev,
                image_guideline_id: e.target.value,
              }))
            }
            mt={2}
             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}

  
          >
            {guidelines.length > 0 ? (
              guidelines.map((g) => (
                <option key={g.guideline_id} value={g.guideline_id}>
                  {g.name}
                </option>
              ))
            ) : (
              <option disabled>No guidelines found</option>
            )}
          </Select>
        )}
      </Box>
      <Box mt={4}>
  <Text fontWeight="bold">Quality Analysis</Text>

  <Select
    sx={{
      "& option": {
        backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
        color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
      },
    }}
    value={bulkImageData?.quality_analysis ? "true" : "false"}
    onChange={(e) =>
      setBulkImageData((prev) => ({
        ...prev,
        quality_analysis: e.target.value == "true",
      }))
    }
    mt={2}
  >
    <option value="false">Disabled</option>
    <option value="true">Enabled</option>
  </Select>
</Box>

      <Box mt={4}>
  <Text fontWeight="bold">Upload File Type</Text>
  <Select
     sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
    value={bulkImageData.file_type}
    onChange={(e) =>
      setBulkImageData((prev) => ({
        ...prev,
        file_type: e.target.value,
      }))
    }
    mt={2}
  >
    <option value="image">Image</option>
    <option value="csv">CSV</option>
  </Select>
</Box>

      {/* 🎯 Select Shot Type */}
      <Box>
        <Text fontWeight="bold">Shot Type</Text>
        <Select
          placeholder="Select shot type"
          value={bulkImageData.shot_type}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              shot_type: e.target.value,
            }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="studio_shots">Studio Shots</option>
          {/* <option value="lifestyle_shots">Lifestyle Shots</option>
          <option value="flat_lay">Flat Lay</option> */}
        </Select>
      </Box>

      {/* 👕 Product Type */}
      <Box>
  <Text fontWeight="bold">Product Type</Text>
  <Select
    placeholder="Select product type"
    value={bulkImageData.product_type}
    onChange={(e) =>
      setBulkImageData((prev) => ({
        ...prev,
        product_type: e.target.value,
      }))
    }
    mt={2}
     sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
  >
    <option value="top">Top</option>
     <option value="bottom">Bottom</option>
      <option value="ethnic">Ethnic</option>
       <option value="dress">Dress</option>
       <option value="innerwear">Innerwear</option>
    {/* <option value="jeans">Jeans</option>
    <option value="tshirt">T-Shirt</option>
    <option value="kurti">Kurti</option>
    <option value="shirt">Shirt</option>
    <option value="dress">Dress</option>
    <option value="hoodie">Hoodie</option>
    <option value="shorts">Shorts</option>
    <option value="saree">Saree</option> */}
  </Select>
</Box>


      {/* 🏷️ Product Name */}
      <Box>
        <Text fontWeight="bold">Product Name</Text>
        <Input
          placeholder="Product name"
          value={bulkImageData.product_name}
          _placeholder={{color:textcolor}}
color={textcolor}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              product_name: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* 🖼️ Front Image URL */}
      {/* <Box>
        <Text fontWeight="bold">Front Image URL</Text>
        <Input
          placeholder="Enter front image URL"
          value={bulkImageData.product_images.front}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              product_images: {
                ...prev.product_images,
                front: e.target.value,
              },
            }))
          }
          mt={2}
        />
      </Box> */}

      {/* 🖼️ Back Image URL */}
      {/* <Box>
        <Text fontWeight="bold">Back Image URL</Text>
        <Input
          placeholder="Enter back image URL"
          value={bulkImageData.product_images.back}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              product_images: {
                ...prev.product_images,
                back: e.target.value,
              },
            }))
          }
          mt={2}
        />
      </Box> */}

      {/* 🆔 Product ID */}
      {/* <Box>
        <Text fontWeight="bold">Product ID</Text>
        <Input
          placeholder="SKU / product id"
          value={bulkImageData.product_id}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              product_id: e.target.value,
            }))
          }
          mt={2}
        />
      </Box> */}

      {/* 👤 Customer ID */}
      {/* <Box>
        <Text fontWeight="bold">Customer ID</Text>
        <Input
          placeholder="Customer id"
          value={bulkImageData.customer_id}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              customer_id: e.target.value,
            }))
          }
          mt={2}
        />
      </Box> */}

      {/* 👤 User ID */}
      {/* <Box>
        <Text fontWeight="bold">User ID</Text>
        <Input
          placeholder="User id"
          value={bulkImageData.user_id}
          onChange={(e) =>
            setBulkImageData((prev) => ({
              ...prev,
              user_id: e.target.value,
            }))
          }
          mt={2}
        />
      </Box> */}

      {/* 🔢 Model */}
<Box>
  <Text fontWeight="bold">Model ID</Text>

  <Select
    placeholder="Select Model"
    value={bulkImageData.model}
    onChange={(e) =>
      setBulkImageData((prev) => ({
        ...prev,
        model: Number(e.target.value), // ALWAYS NUMBER
      }))
    }
    mt={2}
    sx={{
      "& option": {
        backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
        color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
      },
    }}
  >
    <option value="123">Model Gem</option>
    <option value="456">Model Sed</option>
    <option value="789">Model Premium</option>
    <option value="10">Model Sed Premium</option>
  </Select>
</Box>

{/* ================================
   EXTRA FIELDS FOR MODEL 456
   ================================ */}
{/* ================================
     EXTRA FIELDS FOR MODEL 789
================================ */}
{bulkImageData.model == 789 && (
  <>
    {/* SIZE */}
    <Box mt={4}>
      <Text fontWeight="bold">Image Size</Text>
      <Select
        value={bulkImageData.image_size || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            image_size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box>

    {/* ASPECT RATIO */}
    <Box mt={4}>
      <Text fontWeight="bold">Aspect Ratio</Text>
      <Select
        value={bulkImageData.aspect_ratio || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            aspect_ratio: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select Aspect Ratio"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="9:16">9:16</option>
        <option value="16:9">16:9</option>
        <option value="1:1">1:1</option>
        <option value="3:4">3:4</option>
        <option value="4:5">4:5</option>
      </Select>
    </Box>

    {/* THINKING LEVEL */}
    <Box mt={4}>
      <Text fontWeight="bold">Thinking Level</Text>
      <Select
        value={bulkImageData.thinking_level || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            thinking_level: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option disabled value="low">Low (disabled)</option>
        <option disabled value="medium">Medium(disabled)</option>
        <option value="high">High</option>
      </Select>
    </Box>

    {/* SEARCH ENABLED */}
    <Box mt={4}>
      <Text fontWeight="bold">Search Enabled</Text>
      <Select
        value={bulkImageData.search_enabled ? "true" : "false"}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            search_enabled: e.target.value === "true",
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="false">Disabled</option>
        <option value="true">Enabled</option>
      </Select>
    </Box>
  </>
)}

{bulkImageData.model === 10 && (
  <>
    {/* SIZE */}
    <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={bulkImageData.size || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box>

    {/* Aspect Ratio GENERATION */}
    <Box mt={4}>
      <Text fontWeight="bold">Aspect Ratio</Text>
      <Select
        value={bulkImageData.aspect_ratio || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            aspect_ratio: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select Aspect Ratio"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="9:16">9:16</option>
        <option value="16:9">16:9</option>
        <option value="1:1">1:1</option>
        <option value="3:4">3:4</option>
        <option value="4:5">4:5</option>
      </Select>
    </Box>

    {/* RESPONSE FORMAT */}
    <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={bulkImageData.response_format || "url"}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            response_format: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box>
  </>
)}

{bulkImageData.model === 456 && (
  <>
    {/* SIZE */}
    <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={bulkImageData.size || ""}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box>

    {/* SEQUENTIAL IMAGE GENERATION */}
    <Box mt={4}>
      <Text fontWeight="bold">Sequential Image Generation</Text>
      <Select
        value={bulkImageData.sequential_image_generation || "disabled"}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            sequential_image_generation: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="disabled">Disabled</option>
        <option value="enabled">Enabled</option>
      </Select>
    </Box>

    {/* RESPONSE FORMAT */}
    <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={bulkImageData.response_format || "url"}
        onChange={(e) =>
          setBulkImageData((prev) => ({
            ...prev,
            response_format: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box>
  </>
)}


    </VStack>
  );


case "Image Creation":
  return (
    <VStack align="stretch" spacing={4}>

      {/* 🔍 Search Guidelines */}
      <Box>
        <Text fontWeight="bold">Search Image Guidelines</Text>
        <Input
          placeholder="Enter guideline name..."
          value={searchTerm}
          _placeholder={{ color: textcolor }}
          color={textcolor}
          onChange={(e) => {
            const value = e.target.value;
            startTransition(() => setSearchTerm(value));
          }}
          mt={2}
        />
      </Box>

      {/* 🧩 Select Guideline */}
      <Box mt={4}>
        <Text fontWeight="bold">Select Guideline</Text>

        {loading ? (
          <Spinner mt={3} />
        ) : (
          <Select
            placeholder="Select a guideline"
            value={imageCreationSettings.guidelineId || ""}
            onChange={(e) =>
              setImageCreationSettings((prev) => ({
                ...prev,
                guidelineId: e.target.value,
              }))
            }
            mt={2}
             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
          >
            {guidelines.length > 0 ? (
              guidelines.map((g) => (
                <option key={g.guideline_id} value={g.guideline_id}>
                  {g.name}
                </option>
              ))
            ) : (
              <option disabled>No guidelines found</option>
            )}
          </Select>
        )}
      </Box>

      {/* 🧠 Use Case */}
      <Box mt={4}>
        <Text fontWeight="bold">Select Use Case</Text>

        {loadingUseCase ? (
          <Spinner mt={3} />
        ) : (
          <Select
            placeholder="Select a use case"
            value={imageCreationSettings.use_case || ""}
            onChange={(e) =>
              setImageCreationSettings((prev) => ({
                ...prev,
                use_case: e.target.value,
              }))
            }
            mt={2}
             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
          >
            {useCases.length > 0 ? (
              useCases.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))
            ) : (
              <option disabled>No use cases found</option>
            )}
          </Select>
        )}
      </Box>



     {/* Model */}
<Box>
  <Text fontWeight="bold">Model</Text>
  <Select
    placeholder="Select Model"
    value={imageCreationSettings.model}
    onChange={(e) =>
      setImageCreationSettings((prev) => ({
        ...prev,
        model: e.target.value
      }))
    }
    mt={2}
    sx={{
      "& option": {
        backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
        color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
      }
    }}
  >
    <option value="123">Model Gem</option>
    <option value="456">Model Sed</option>
    <option value="789">Model Premium</option>
      <option value="10">Model Sed Premium</option>
  </Select>
</Box>

{/* ================================
   SHOW FIELDS ONLY FOR MODEL 456 or 789
   ================================= */}
{/* {["456", "789"].includes(imageCreationSettings.model) && (
  <>
    {/* SIZE */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={imageCreationSettings.size || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            size: e.target.value
          }))
        }
        mt={2}
        placeholder="Select size"
         sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box> */}

    {/* WATERMARK */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Watermark</Text>
      <Select
        value={imageCreationSettings.watermark || "false"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            watermark: e.target.value === "true"
          }))
        }
        mt={2}
         sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
      >
        <option value="false">Disable</option>
        <option value="true">Enable</option>
      </Select>
    </Box> */}

    {/* SEQUENTIAL IMAGE GENERATION */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Sequential Image Generation</Text>
      <Select
        value={imageCreationSettings.sequential_image_generation || "disabled"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            sequential_image_generation: e.target.value
          }))
        }
        mt={2}
         sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
      >
        <option value="disabled">Disabled</option>
        <option value="enabled">Enabled</option>
      </Select>
    </Box> */}

    {/* RESPONSE FORMAT */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={imageCreationSettings.response_format || "url"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            response_format: e.target.value
          }))
        }
        mt={2}
         sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box> */}
  {/* </>
)} */}

{/* differet different model config field  */}
{imageCreationSettings.model === "456" && (
  <>
    {/* SIZE */}
    <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={imageCreationSettings.size || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box>

    {/* WATERMARK */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Watermark</Text>
      <Select
        value={imageCreationSettings.watermark ? "true" : "false"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            watermark: e.target.value === "true",
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="false">Disable</option>
        <option value="true">Enable</option>
      </Select>
    </Box> */}

    {/* SEQUENTIAL IMAGE GENERATION */}
    <Box mt={4}>
      <Text fontWeight="bold">Sequential Image Generation</Text>
      <Select
        value={imageCreationSettings.sequential_image_generation || "disabled"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            sequential_image_generation: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="disabled">Disabled</option>
        <option value="enabled">Enabled</option>
      </Select>
    </Box>

    {/* RESPONSE FORMAT */}
    <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={imageCreationSettings.response_format || "url"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            response_format: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box>
  </>
)}

{imageCreationSettings.model === "789" && (
  <>
    {/* IMAGE SIZE */}
    <Box mt={4}>
      <Text fontWeight="bold">Image Size</Text>
      <Select
        value={imageCreationSettings.image_size || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            image_size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select image size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
        <option value="8K">8K</option>
      </Select>
    </Box>

    {/* ASPECT RATIO */}
    <Box mt={4}>
      <Text fontWeight="bold">Aspect Ratio</Text>
      <Select
        value={imageCreationSettings.aspect_ratio || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            aspect_ratio: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select ratio"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="1:1">1:1</option>
        <option value="4:5">4:5</option>
        <option value="16:9">16:9</option>
        <option value="9:16">9:16</option>
      </Select>
    </Box>

    {/* THINKING LEVEL */}
    <Box mt={4}>
      <Text fontWeight="bold">Thinking Level</Text>
      <Select
        value={imageCreationSettings.thinking_level || "low"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            thinking_level: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
    </Box>

    {/* SEARCH ENABLED */}
    <Box mt={4}>
      <Text fontWeight="bold">Search Enabled</Text>
      <Select
        value={imageCreationSettings.search_enabled ? "true" : "false"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            search_enabled: e.target.value === "true",
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="false">Disabled</option>
        <option value="true">Enabled</option>
      </Select>
    </Box>
  </>
)}

{imageCreationSettings.model === "10" && (
  <>
    {/* SIZE */}
   <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={imageCreationSettings.size || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            size: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select size"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box>

    {/* ASPECT RATIO */}
    <Box mt={4}>
      <Text fontWeight="bold">Aspect Ratio</Text>
      <Select
        value={imageCreationSettings.aspect_ratio || ""}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            aspect_ratio: e.target.value,
          }))
        }
        mt={2}
        placeholder="Select ratio"
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="1:1">1:1</option>
        <option value="4:5">4:5</option>
        <option value="16:9">16:9</option>
        <option value="9:16">9:16</option>
      </Select>
    </Box>

    {/* THINKING LEVEL */}
  <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={imageCreationSettings.response_format || "url"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            response_format: e.target.value,
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box>

 {/* <Box mt={4}>
      <Text fontWeight="bold">Watermark</Text>
      <Select
        value={imageCreationSettings.watermark ? "true" : "false"}
        onChange={(e) =>
          setImageCreationSettings((prev) => ({
            ...prev,
            watermark: e.target.value === "true",
          }))
        }
        mt={2}
        sx={{
          "& option": {
            backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
            color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
          },
        }}
      >
        <option value="false">Disable</option>
        <option value="true">Enable</option>
      </Select>
    </Box> */}
  
  </>
)}



      {/* 🎯 IMAGE SETTINGS TOGGLE */}
      <Box>
        <Text fontWeight="bold">Pro Version For Resizing</Text>
        <Select
          value={imageCreationSettings.targetMethod}
          onChange={(e) => {
            const value = e.target.value;

            setImageCreationSettings((prev) => ({
              ...prev,
              targetMethod: value,

              ...(value === "disable" && {
                targetWidth: "",
                targetHeight: "",
                target_aspect_ratio: "",
                resizeMethod: "",
                quality: "",
                fill_method: "",
                toggle: "false",
              }),
            }));
          }}
          mt={2}
          placeholder="Select option"
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="enable">Enable</option>
          <option value="disable">Disable</option>
        </Select>
      </Box>




      {/* ===================================================== */}
      {/* 🔹 WHEN DISABLE → ONLY ASPECT RATIO SHOW              */}
      {/* ===================================================== */}
      {/* {imageCreationSettings.targetMethod === "enable" && (
        <Box>
          <Text fontWeight="bold">Aspect Ratio</Text>
          <Select
            placeholder="Select Aspect Ratio"
            value={imageCreationSettings.target_aspect_ratio}
            onChange={(e) =>
              setImageCreationSettings((prev) => ({
                ...prev,
                target_aspect_ratio: e.target.value,
                targetWidth: "",
                targetHeight: "",
              }))
            }
            mt={2}
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="4:5">4:5 (Portrait)</option>
            <option value="3:4">3:4 (Portrait)</option>
            <option value="9:16">9:16 (Vertical)</option>
          </Select>
        </Box>
      )} */}

      {/* ===================================================== */}
      {/* 🔹 WHEN ENABLE → SHOW ALL FIELDS + TOGGLE LOGIC       */}
      {/* ===================================================== */}
      {imageCreationSettings.targetMethod === "enable" && (
        <>

          {/* 🔀 TOGGLE BETWEEN ASPECT RATIO & WIDTH/HEIGHT */}
          <Box>
            <Text fontWeight="bold">Choose Mode</Text>
            <Select
              value={imageCreationSettings.toggle}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  toggle: e.target.value,

                  ...(e.target.value === "true"
                    ? { target_aspect_ratio: "" }
                    : { targetWidth: "", targetHeight: "" }),
                }))
              }
              mt={2}
               sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
            >
              <option value="false">Aspect Ratio</option>
              <option value="true">Width & Height</option>
            </Select>
          </Box>

          {/* ========================== */}
          {/* 🔹 MODE: ASPECT RATIO      */}
          {/* ========================== */}
          {imageCreationSettings.toggle === "false" && (
            <Box>
              <Text fontWeight="bold">Aspect Ratio</Text>
              <Select
                placeholder="Select Aspect Ratio"
                value={imageCreationSettings.target_aspect_ratio}
                onChange={(e) =>
                  setImageCreationSettings((prev) => ({
                    ...prev,
                    target_aspect_ratio: e.target.value,
                    targetWidth: "",
                    targetHeight: "",
                  }))
                }
                mt={2}
                 sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
              >
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Portrait)</option>
                <option value="3:4">3:4 (Portrait)</option>
                <option value="9:16">9:16 (Vertical)</option>
              </Select>
            </Box>
          )}



   {/* Model */}



          {/* ========================== */}
          {/* 🔹 MODE: WIDTH + HEIGHT    */}
          {/* ========================== */}
          {imageCreationSettings.toggle === "true" && (
            <>
              {/* WIDTH */}
              <Box>
                <Text fontWeight="bold">Target Width (px)</Text>
                <Input
                  type="number"
                  placeholder="Enter width (px)"
                  value={imageCreationSettings.targetWidth}
                  onChange={(e) =>
                    setImageCreationSettings((prev) => ({
                      ...prev,
                      targetWidth: e.target.value,
                      target_aspect_ratio: "",
                    }))
                  }
                  mt={2}
                />
              </Box>

              {/* HEIGHT */}
              <Box>
                <Text fontWeight="bold">Target Height (px)</Text>
                <Input
                  type="number"
                  placeholder="Enter height (px)"
                  value={imageCreationSettings.targetHeight}
                  onChange={(e) =>
                    setImageCreationSettings((prev) => ({
                      ...prev,
                      targetHeight: e.target.value,
                      target_aspect_ratio: "",
                    }))
                  }
                  mt={2}
                />
              </Box>
            </>
          )}

          {/* ========================== */}
          {/*   REMAINING FIELDS         */}
          {/* ========================== */}

          {/* FILL METHOD */}
          <Box>
            <Text fontWeight="bold">Fill Method</Text>
            <Select
              placeholder="Select Fill Method"
              value={imageCreationSettings.fill_method}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  fill_method: e.target.value,
                }))
              }
              mt={2}
               sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
            ><option value="gen_ai">Gen Ai</option>
              <option value="blur">Blur</option>
              <option value="solid_color">Solid Color</option>
              
            </Select>
          </Box>

          {/* RESIZE METHOD */}
          {/* <Box>
            <Text fontWeight="bold">Resize Method</Text>
            <Select
              placeholder="Select resize method"
              value={imageCreationSettings.resizeMethod}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  resizeMethod: e.target.value,
                }))
              }
              mt={2}
               sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
            >
              <option value="maintain_aspect">Maintain Aspect Ratio</option>
              <option value="crop">Crop</option>
              <option value="stretch">Stretch</option>
            </Select>
          </Box> */}

          {/* QUALITY */}
          <Box>
            <Text fontWeight="bold">Quality (1–100)</Text>
            <Input
              type="number"
              min="1"
              max="100"
              placeholder="85"
              value={imageCreationSettings.quality}
              _placeholder={{ color: textcolor }}
              color={textcolor}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  quality: e.target.value,
                }))
              }
              mt={2}
            />
          </Box>

        </>
      )}
    </VStack>
  );





case "Resize Image":
  return (
    <VStack align="stretch" spacing={4}>

      {/* Mode Select (Aspect Ratio or Width/Height) */}
      <Box>
        <Text fontWeight="bold">Resize Mode</Text>
        <Select
          mt={2}
          value={resizeImageSettings.mode}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              mode: e.target.value,
              // Reset values when switching modes
              target_aspect_ratio: e.target.value === "aspect_ratio" ? prev.target_aspect_ratio : "",
              targetWidth: e.target.value === "width_height" ? prev.targetWidth : "",
              targetHeight: e.target.value === "width_height" ? prev.targetHeight : ""
            }))
          }
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
            },
          }}
        >
          <option value="aspect_ratio">Aspect Ratio</option>
          <option value="width_height">Width & Height</option>
        </Select>
      </Box>

      {/* --- If Mode = Aspect Ratio → Show Aspect Ratio Dropdown --- */}
      {resizeImageSettings.mode === "aspect_ratio" && (
        <Box>
          <Text fontWeight="bold">Target Aspect Ratio</Text>
          <Select
            placeholder="Select aspect ratio"
            value={resizeImageSettings.target_aspect_ratio}
            onChange={(e) =>
              setResizeImageSettings((prev) => ({
                ...prev,
                target_aspect_ratio: e.target.value
              }))
            }
            mt={2}
            sx={{
              "& option": {
                backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
                color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
              },
            }}
          >
            <option value="1:1">1:1</option>
            <option value="4:5">4:5</option>
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
          </Select>
        </Box>
      )}

      {/* --- If Mode = Width & Height → Show Inputs --- */}
      {resizeImageSettings.mode === "width_height" && (
        <>
          {/* Target Width */}
          <Box>
            <Text fontWeight="bold">Target Width (px)</Text>
            <Input
              type="number"
              placeholder="Enter width in px"
              _placeholder={{ color: textcolor }}
              color={textcolor}
              value={resizeImageSettings.targetWidth}
              onChange={(e) =>
                setResizeImageSettings((prev) => ({
                  ...prev,
                  targetWidth: e.target.value
                }))
              }
              mt={2}
            />
          </Box>

          {/* Target Height */}
          <Box>
            <Text fontWeight="bold">Target Height (px)</Text>
            <Input
              type="number"
              placeholder="Enter height in px"
              _placeholder={{ color: textcolor }}
              color={textcolor}
              value={resizeImageSettings.targetHeight}
              onChange={(e) =>
                setResizeImageSettings((prev) => ({
                  ...prev,
                  targetHeight: e.target.value
                }))
              }
              mt={2}
            />
          </Box>
        </>
      )}

      {/* Resize Method */}
      {/* <Box>
        <Text fontWeight="bold">Resize Method</Text>
        <Select
          placeholder="Select resize method"
          value={resizeImageSettings.resizeMethod}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              resizeMethod: e.target.value
            }))
          }
          mt={2}
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
            },
          }}
        >
          <option value="maintain_aspect">Maintain Aspect</option>
          <option value="crop">Crop</option>
          <option value="stretch">Stretch</option>
        </Select>
      </Box> */}

      {/* Fill Method */}
      <Box>
        <Text fontWeight="bold">Fill Method</Text>
        <Select
          placeholder="Select fill method"
          value={resizeImageSettings.fill_method}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              fill_method: e.target.value
            }))
          }
          mt={2}
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
            }
          }}
        >
         <option value="gen_ai">Gen Ai</option>
          <option value="blur">Blur</option>
              <option value="solid_color">Solid Color</option>
        </Select>
      </Box>

      {/* Model */}
      {/* Model */}
{/* <Box>
  <Text fontWeight="bold">Model</Text>
  <Select
    placeholder="Select Model"
    value={resizeImageSettings.model}
    onChange={(e) =>
      setResizeImageSettings((prev) => ({
        ...prev,
        model: e.target.value
      }))
    }
    mt={2}
    sx={{
      "& option": {
        backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
        color: colorMode === "dark" ? "#FFFFFF" : "#14225C"
      }
    }}
  >
     <option value="123">Model Gem</option>
    <option value="456">Model Sed</option>
    <option value="789">Model Premium</option>
  </Select>
</Box> */}

{/* ================================
   SHOW FIELDS ONLY FOR MODEL 456 or 789
   ================================= */}
{["456", "789"].includes(resizeImageSettings.model) && (
  <>
    {/* SIZE */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Size</Text>
      <Select
        value={resizeImageSettings.size || ""}
        onChange={(e) =>
          setResizeImageSettings((prev) => ({
            ...prev,
            size: e.target.value
          }))
        }
        mt={2}
        placeholder="Select size"
      >
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </Select>
    </Box> */}

    {/* WATERMARK */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Watermark</Text>
      <Select
        value={resizeImageSettings.watermark || "false"}
        onChange={(e) =>
          setResizeImageSettings((prev) => ({
            ...prev,
            watermark: e.target.value === "true"
          }))
        }
        mt={2}
      >
        <option value="false">Disable</option>
        <option value="true">Enable</option>
      </Select>
    </Box> */}

    {/* SEQUENTIAL IMAGE GENERATION */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Sequential Image Generation</Text>
      <Select
        value={resizeImageSettings.sequential_image_generation || "disabled"}
        onChange={(e) =>
          setResizeImageSettings((prev) => ({
            ...prev,
            sequential_image_generation: e.target.value
          }))
        }
        mt={2}
      >
        <option value="disabled">Disabled</option>
        <option value="enabled">Enabled</option>
      </Select>
    </Box> */}

    {/* RESPONSE FORMAT */}
    {/* <Box mt={4}>
      <Text fontWeight="bold">Response Format</Text>
      <Select
        value={resizeImageSettings.response_format || "url"}
        onChange={(e) =>
          setResizeImageSettings((prev) => ({
            ...prev,
            response_format: e.target.value
          }))
        }
        mt={2}
      >
        <option value="url">URL</option>
        <option value="base64">Base64</option>
      </Select>
    </Box> */}
  </>
)}



      {/* Quality */}
      <Box>
        <Text fontWeight="bold">Quality (1–100)</Text>
        <Input
          type="number"
          min="1"
          max="100"
          placeholder="85"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={resizeImageSettings.quality}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              quality: e.target.value
            }))
          }
          mt={2}
        />
      </Box>
    </VStack>
  );



           case "Image to Video":
  return (
    <VStack align="stretch" spacing={4}>
      {/* Layover Text */}
      <Box>
        <Text fontWeight="bold">Layover Text</Text>
        <Input
          placeholder="Enter layover text (e.g. Limited Time Offer!)"
          value={imageToVideoSettings.layover_text || ""}
          _placeholder={{color:textcolor}}
color={textcolor}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              layover_text: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Project Name */}
      <Box>
        <Text fontWeight="bold">Project Name</Text>
        <Input
          placeholder="Enter project name"
          value={imageToVideoSettings.project_name || ""}
          _placeholder={{color:textcolor}}
color={textcolor}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              project_name: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

{/* lifestyleid is select  */}
<Box>
<Text fontWeight="bold">Select Lifestyle Id</Text>
<Select
  placeholder="Select Lifestyle ID"
  value={imageToVideoSettings?.lifestyle_id || ""}
  onChange={(e) => {
    const selectedValue = e.target.value;

    setImageToVideoSettings((prev) => ({
      ...prev,
      lifestyle_id: selectedValue,
      setlifestyleid: selectedValue ? true : false,
    }));
  }}
  mt={4}
  sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
>
  {lifestyleIds.map((id) => (
    <option key={id} value={id}>
      {id}
    </option>
  ))}
</Select>


</Box>
{/* 🔍 Project Search & Select */}




<Box>
  <Text fontWeight="bold">Search Project</Text>
  <Input
    placeholder="Type project name..."
    value={projectSearch}
    _placeholder={{color:textcolor}}
color={textcolor}
    onChange={(e) => {
      const value = e.target.value;
      setProjectSearch(value);
      if (value.trim().length >= 2) {
        fetchProjects(value); // Fetch when at least 2 characters entered
      } else {
        setProjects([]);
      }
    }}
    mt={2}
  />

  <Select
    placeholder={loadingProjects ? "Loading projects..." : "Select a project"}
    value={imageToVideoSettings.project_id || ""}
    onChange={(e) =>
      setImageToVideoSettings((prev) => ({
        ...prev,
        project_id: e.target.value,
      }))
    }
    mt={3}
    isDisabled={loadingProjects || projects.length === 0}
     sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
  >
    {projects.map((p) => (
      <option key={p.project_id} value={p.project_id}>
        {p.project_name}
      </option>
    ))}
  </Select>

  {/* Optional: show no results message */}
  {!loadingProjects && projectSearch && projects.length === 0 && (
    <Text color="gray.500" fontSize="sm" mt={1}>
      No projects found.
    </Text>
  )}
</Box>

      {/* Tags */}
      <Box>
        <Text fontWeight="bold">Tags (comma separated)</Text>
        <Input
          placeholder="e.g. sale, discount, ad"
          value={imageToVideoSettings.tags || ""}
          _placeholder={{color:textcolor}}
color={textcolor}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              tags: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Sector (Dynamic) */}
      <Box>
        <Text fontWeight="bold">Sector</Text>
        <Select
          placeholder="Select sector"
          value={imageToVideoSettings.sector || ""}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              sector: e.target.value,
            }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          {Object.entries(
            sector_choices.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {})
          ).map(([category, subcategories]) => (
            <optgroup key={category} label={category}>
              {subcategories.map((s, i) => (
                <option key={i} value={s.label}>
                  {s.subcategory}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Box>

      {/* Goal / Description */}
      <Box>
        <Text fontWeight="bold">Goal / Description</Text>
        <Textarea
          placeholder="Describe the project goal"
          value={imageToVideoSettings.goal || ""}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              goal: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Consumer Message */}
      <Box>
        <Text fontWeight="bold">Consumer Message</Text>
        <Textarea
          placeholder="Enter message for the audience"
          value={imageToVideoSettings.consumer_message || ""}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              consumer_message: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* M_Key (Dynamic) */}
      <Box>
        <Text fontWeight="bold">M_Key</Text>
        <Select
          placeholder="Select M_Key"
          value={imageToVideoSettings.M_key || ""}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              M_key: e.target.value,
            }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          {Object.entries(M_key).map(([key, val]) => (
            <option key={key} value={val}>
              {key} ({val})
            </option>
          ))}
        </Select>
      </Box>

      {/* Video Type */}
      <Box>
        <Text fontWeight="bold">Video Type</Text>
        <Select
          placeholder="Select video type"
          value={imageToVideoSettings.video_type || ""}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              video_type: e.target.value,
            }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="cloudinary">Cloudinary</option>
          <option value="processed">Processed</option>
          <option value="animated">Animated</option>
        </Select>
      </Box>

      {/* Video Duration */}
      <Box>
        <Text fontWeight="bold" mb={2}>Video Duration</Text>
        <SimpleGrid columns={{ base: 3 }} spacing={3}>
          {[
            { label: "5", icon: MdAccessTime },
            { label: "10", icon: MdMovieEdit },
            { label: "15", icon: MdAccessTime },
          ].map((item) => {
            const isSelected = imageToVideoSettings.duration === item.label;
            console.log(isSelected)
            return (
              <Flex
                key={item.label}
                align="center"
                justify="center"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : panelBg}
                bg={isSelected ? panelBg : "transparent"}
                color={isSelected ? "blue.600" : "inherit"}
                borderRadius="xl"
                p={1}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ borderColor: "blue.400", bg: panelBg, transform: "scale(1.05)" }}
                onClick={() =>
                  setImageToVideoSettings((prev) => ({
                    ...prev,
                    duration: item.label,
                  }))
                }
                flexDirection="column"
              >
                <Icon as={item.icon} boxSize={6} mb={1} />
                <Text fontWeight="medium">{item.label}</Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Aspect Ratio (Dynamic) */}
      <Box>
        <Text fontWeight="bold" mb={2}>Aspect Ratio</Text>
        <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={4} mt={2}>
          {Object.entries(video_dimensions_choices).map(([label, val]) => {
            const icon = label.includes("16:9")
              ? MdCrop169
              : label.includes("9:16")
              ? MdCropPortrait
              : MdCropSquare;
            const isSelected = imageToVideoSettings.aspect_ratio === val;
            return (
              <Flex
                key={val}
                direction="column"
                align="center"
                justify="center"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : panelBg}
                bg={isSelected ? panelBg : "transparent"}
                color={isSelected ? "blue.600" : "inherit"}
                borderRadius="xl"
                p={3}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{ borderColor: "blue.400", bg: panelBg, transform: "scale(1.05)" }}
                onClick={() =>
                  setImageToVideoSettings((prev) => ({
                    ...prev,
                    aspect_ratio: val,
                  }))
                }
              >
                <Icon as={icon} boxSize={7} mb={1} />
                <Text fontWeight="small" fontSize="sm" textAlign="center">{label}</Text>
                <Text fontSize="xs" color="gray.500">({val})</Text>
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Custom Size */}
      <Box>
        <Text fontWeight="bold">Custom Size</Text>
        <Select
          placeholder="Select option"
          value={imageToVideoSettings.resize || ""}
          onChange={(e) => {
            const value = e.target.value;
            setImageToVideoSettings((prev) => ({
              ...prev,
              resize: value,
              ...(value === "false" && { resize_width: "", resize_height: "" }),
            }));
          }}
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </Select>

        {imageToVideoSettings.resize === "true" && (
          <>
            <Box mt={4}>
              <Text fontWeight="bold">Custom Width (px)</Text>
              <Input
                type="number"
                placeholder="Width in px"
                _placeholder={{color:textcolor}}
color={textcolor}
                value={imageToVideoSettings.resize_width || ""}
                onChange={(e) =>
                  setImageToVideoSettings((prev) => ({
                    ...prev,
                    resize_width: e.target.value,
                  }))
                }
                mt={2}
              />
            </Box>

            <Box mt={4}>
              <Text fontWeight="bold">Custom Height (px)</Text>
              <Input
                type="number"
                placeholder="Height in px"
                _placeholder={{color:textcolor}}
color={textcolor}
                value={imageToVideoSettings.resize_height || ""}
                onChange={(e) =>
                  setImageToVideoSettings((prev) => ({
                    ...prev,
                    resize_height: e.target.value,
                  }))
                }
                mt={2}
              />
            </Box>
          </>
        )}
      </Box>
    </VStack>
  );

            case "Edit Video":
                return (
                    <VStack align="stretch" spacing={4}>
                        <Box>
                            <Text fontWeight="bold">Trim Start (seconds)</Text>
                            <Input
                                type="number" placeholder="Start time"
                                _placeholder={{color:textcolor}}
color={textcolor}
                                onChange={(e) => startTransition(() => setMergeData((prev) => ({ ...prev, trim_start: e.target.value })))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>

                        <Box>
                            <Text fontWeight="bold">Trim End (seconds)</Text>
                            <Input
                                type="number" placeholder="End time"
                                _placeholder={{color:textcolor}}
color={textcolor}
                                onChange={(e) => startTransition(() => setMergeData((prev) => ({ ...prev, trim_end: e.target.value })))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>
                    </VStack>
                );

case "Caption Segment":
  return (
    <VStack align="stretch" spacing={4} p={4}>
      {/* 🆔 Edit ID */}
      {/* <Box>
        <Text fontWeight="bold">Edit ID</Text>
        <Input
          placeholder="Enter edit ID"
          value={captionData.edit_id || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({ ...prev, edit_id: e.target.value }))
          }
          mt={2}
        />
      </Box> */}

      {/* 🔢 Segment Number */}
      <Box>
        <Text fontWeight="bold">Segment Number</Text>
        <Input
          type="number"
          placeholder="Enter segment number"
          _placeholder={{color:textcolor}}
color={textcolor}
          value={captionData.segment_number || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({
              ...prev,
              segment_number: e.target.value === "" ? "" : Number(e.target.value),
            }))
          }
          mt={2}
        />
      </Box>

      {/* 💬 Caption Text */}
      <Box>
        <Text fontWeight="bold">Caption Text</Text>
        <Input
          placeholder="Enter caption text"
          _placeholder={{color:textcolor}}
color={textcolor}
          value={captionData.text || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({ ...prev, text: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* ⏱️ Start / End Time */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Start Time</Text>
          <Input
            type="number"
            placeholder="e.g. 0.25"
            _placeholder={{color:textcolor}}
color={textcolor}
            value={captionData.start_time || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                start_time:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>

        <Box flex="1">
          <Text fontWeight="bold">End Time</Text>
          <Input
            type="number"
            placeholder="e.g. 4.0"
            _placeholder={{color:textcolor}}
color={textcolor}
            value={captionData.end_time || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                end_time: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* 🅰️ Font Settings */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Font Size (px)</Text>
          <Input
            type="number"
            placeholder="e.g. 52"
            _placeholder={{color:textcolor}}
color={textcolor}
            value={captionData.font_size || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                font_size: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>

        <Box flex="1">
          <Text fontWeight="bold">Font Color</Text>
          <Input
            type="color"
            _placeholder={{color:textcolor}}
color={textcolor}
            value={captionData.font_color || "#ffffff"}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                font_color: e.target.value,
              }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* 🎨 Background Settings */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Background Color</Text>
          <Input
            type="color"
            _placeholder={{color:textcolor}}
color={textcolor}
            value={captionData.background_color || "#000000"}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                background_color: e.target.value,
              }))
            }
            mt={2}
          />
        </Box>

        <Box flex="1">
          <Text fontWeight="bold">Background Opacity (0–1)</Text>
          <Input
            type="number"
            step="0.1"
            _placeholder={{color:textcolor}}
color={textcolor}
            min="0"
            max="1"
            placeholder="e.g. 0.9"
            value={captionData.background_opacity ?? ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                background_opacity:
                  e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* 📍 Position */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">X Position</Text>
          <Input
            placeholder="e.g. 5%"
            value={captionData.x || ""}
            _placeholder={{color:textcolor}}
color={textcolor}
            onChange={(e) =>
              setCaptionData((prev) => ({ ...prev, x: e.target.value }))
            }
            mt={2}
          />
        </Box>

        <Box flex="1">
          <Text fontWeight="bold">Y Position</Text>
          <Input
            placeholder="e.g. 10%"
            value={captionData.y || ""}
            _placeholder={{color:textcolor}}
color={textcolor}
            onChange={(e) =>
              setCaptionData((prev) => ({ ...prev, y: e.target.value }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* ✨ Animation */}
      <Box>
        <Text fontWeight="bold">Animation</Text>
        <Select
          placeholder="Select animation"
          value={captionData.animation || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({ ...prev, animation: e.target.value }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="flash">Flash</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
        </Select>
      </Box>

      {/* ⚡ Animation Speed */}
      <Box>
        <Text fontWeight="bold">Animation Speed</Text>
        <Select
          placeholder="Select speed"
          value={captionData.animation_speed || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({
              ...prev,
              animation_speed: e.target.value,
            }))
          }
          mt={2}
           sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </Select>
      </Box>
    </VStack>
  );

            case "Merge Video":
                return (
                    <VStack align="stretch" spacing={4}>
                        {/* 🧩 User ID */}
                        <Box>
                            <Text fontWeight="bold">User ID</Text>
                            <Input
                            _placeholder={{color:textcolor}}
color={textcolor}
                                type="text" placeholder="Enter User ID" value={MergeData.user_id || ""}
                                onChange={(e) => startTransition(() => setMergeData({ ...MergeData, user_id: e.target.value }))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>



                        {/* 🧩 Edit ID */}
                        <Box>
                            <Text fontWeight="bold">Edit ID</Text>
                            <Input
                            _placeholder={{color:textcolor}}
color={textcolor}
                                type="text" placeholder="Enter Edit ID" value={MergeData.edit_id || ""}
                                onChange={(e) => startTransition(() => setMergeData({ ...MergeData, edit_id: e.target.value }))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>

                        {/* 🧩 Brand Outro Video */}
                        <Box>
                            <Text fontWeight="bold">Brand Outro Video URL</Text>
                            <Input
                            _placeholder={{color:textcolor}}
color={textcolor}
                                type="text" placeholder="Enter Brand Outro Video URL" value={MergeData.brand_outro_video_url || ""}
                                onChange={(e) => startTransition(() => setMergeData({ ...MergeData, brand_outro_video_url: e.target.value }))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>

                        <Box>
        <Text fontWeight="bold" mb={2}>
          Upload Brand Outro Video
        </Text>

        <Input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          bg={file}
          _placeholder={{color:textcolor}}
color={textcolor}
          p={1}
        />

        {uploading && (
          <Progress
            value={uploadProgress}
            size="sm"
            mt={2}
            borderRadius="md"
          />
        )}
      </Box>

                        {/* 🔹 Dropdown for Custom Resize */}
                        <Box>
                            <Text fontWeight="bold" mb={2}>Enable Custom Resize</Text>
                            <Select
                                value={MergeData.custom_resize ? "true" : "false"}
                                onChange={(e) =>
                                    startTransition(() => { // ✅ Wrapped in startTransition
                                        setMergeData({
                                            ...MergeData,
                                            custom_resize: e.target.value === "true",
                                        })
                                    })
                                }
                                mt={2}
                                 sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
                            >
                                <option value="false">False</option>
                                <option value="true">True</option>
                            </Select>
                        </Box>

                        {/* 🔸 Show only when Custom Resize is true */}
                        {MergeData.custom_resize && (
                            <>
                                <Box>
                                    <Text fontWeight="bold">Merge ID</Text>
                                    <Input
                                    _placeholder={{color:textcolor}}
color={textcolor}
                                        type="text" placeholder="Enter Merge ID" value={MergeData.mearg_id || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, mearg_id: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Height (px)</Text>
                                    <Input
                                    _placeholder={{color:textcolor}}
color={textcolor}
                                        type="number" placeholder="1080" value={MergeData.height || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, height: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Width (px)</Text>
                                    <Input
                                    _placeholder={{color:textcolor}}
color={textcolor}
                                        type="number" placeholder="1920" value={MergeData.width || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, width: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>
                            </>
                        )}
                    </VStack>
                );


case "Add Music":
  return (
    <VStack align="stretch" spacing={4}>

      {/* Merge ID */}
      <Box>
        <Text fontWeight="bold">Merge ID</Text>
        <Input
          type="text"
          placeholder="Enter merge ID"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.merge_id}
          onChange={(e) =>
            SetMusicData((prev) => ({ ...prev, merge_id: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* User ID */}
      <Box>
        <Text fontWeight="bold">User ID</Text>
        <Input
          type="text"
          placeholder="Enter user ID"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.user_id}
          onChange={(e) =>
            SetMusicData((prev) => ({ ...prev, user_id: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* Brand Music URL */}
      <Box>
        <Text fontWeight="bold">Brand Music URL (Optional)</Text>
        <Input
          type="text"
          placeholder="Paste music URL"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.brand_music_url}
          onChange={(e) =>
            SetMusicData((prev) => ({
              ...prev,
              brand_music_url: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Brand Outro Music Upload */}
      <Box>
        <Text fontWeight="bold">
          {MusicData.brand_outro_music ? "Re-Upload Music" : "Brand Outro Music (Upload)"}
        </Text>

        <Input
          type="file"
          accept="audio/*"
          color={textcolor}
          onChange={async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Always replace previous music (Re-Upload supported)
            SetMusicData((prev) => ({
              ...prev,
              brand_outro_music: file,       // new file
              brand_music_url: "",           // clear old URL before new upload
            }));

            try {
              const formData = new FormData();
              formData.append("music_urls", file);

              const res = await axiosInstance.post(
                "/upload_direct_music/",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
              );

              if (res.data?.music_urls?.length > 0) {
                const url = res.data.music_urls[0];

                SetMusicData((prev) => ({
                  ...prev,
                  brand_music_url: url,       // new URL from API
                }));

                toast({
                  title: "Music Uploaded Successfully!",
                  status: "success",
                  position: "top-right",
                });
              } else {
                throw new Error("URL not found");
              }
            } catch (err) {
              console.error(err);
              toast({
                title: "Failed to upload music",
                status: "error",
                position: "top-right",
              });
            }
          }}
          mt={2}
        />

  
      </Box>

    </VStack>
  );
     default:
                return <Text>⚙️ Adjust your {activeTab} settings here</Text>;
        }
    };

    return (
        <VStack
            w="100%" h="100%" bg={panelBg} p={4} borderRadius="lg" align="stretch" spacing={6} overflowY="auto"
            sx={{
                "&::-webkit-scrollbar": { width: "6px", background: "transparent", },
                "&::-webkit-scrollbar-thumb": { background: "transparent", borderRadius: "3px", },
                "&:hover::-webkit-scrollbar-thumb": { background: "#ccc", },
            }}
        >
            {renderPanelContent()}
        </VStack>
    );
}
