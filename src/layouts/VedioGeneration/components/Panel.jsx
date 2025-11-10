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
    Flex,Progress
} from "@chakra-ui/react";
import { useState, useEffect, startTransition } from "react";
import axiosInstance from "utils/AxiosInstance";
import { MdAccessTime, MdMovieEdit } from "react-icons/md";
import { MdCrop169, MdCropPortrait, MdCropSquare } from "react-icons/md";

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
    selectedUser
}) {
    const panelBg = useColorModeValue("white", "gray.800");

    // We keep this simple logger, no need for transition
    const handleChange = (field, value) => {
        console.log(`[${activeTab}] ${field}:`, value);
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [guidelines, setGuidelines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [useCases, setUseCases] = useState([]);
const [loadingUseCase, setLoadingUseCase] = useState(false);
    const toast = useToast();
   // ✅ get context
  const prevUserIdRef = useRef(null);
console.log(selectedUser)
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
      loadAllGuidelines(); // 👈 refetch when user changes
    }
  }, [selectedUser, loadAllGuidelines]);
useEffect(() => {
  if (!searchTerm.trim()) {
    loadAllGuidelines();   // ✅ When search is empty → show all again
    return;
  }

  if (searchTimeout.current) clearTimeout(searchTimeout.current);

  searchTimeout.current = setTimeout(() => {
    loadAllGuidelines();    // ✅ Run search
  }, 400);
}, [searchTerm]);





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
          case "Image Creation":
  return (
    <VStack align="stretch" spacing={4}>
      {/* 🔍 Search Image Guidelines */}
      <Box>
        <Text fontWeight="bold">Search Image Guidelines</Text>
        <Input
          placeholder="Enter guideline name..."
          value={searchTerm}
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

      {/* 🧠 Use Case Dropdown (from API) */}
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

      {/* 🎯 Target Method */}
      <Box>
        <Text fontWeight="bold">Target Method</Text>
        <Select
          placeholder="Select option"
          value={imageCreationSettings.targetMethod}
          onChange={(e) => {
            const value = e.target.value;
            setImageCreationSettings((prev) => ({
              ...prev,
              targetMethod: value,
              ...(value === "disable" && {
                targetWidth: "",
                targetHeight: "",
              }),
            }));
          }}
          mt={2}
        >
          <option value="enable">Enable</option>
          <option value="disable">Disable</option>
        </Select>
      </Box>

      {/* 📏 Width / Height if Enabled */}
      {imageCreationSettings.targetMethod === "enable" && (
        <>
          <Box>
            <Text fontWeight="bold">Target Width (px)</Text>
            <Input
              type="number"
              placeholder="Width in px"
              value={imageCreationSettings.targetWidth}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  targetWidth: e.target.value,
                }))
              }
              mt={2}
            />
          </Box>

          <Box>
            <Text fontWeight="bold">Target Height (px)</Text>
            <Input
              type="number"
              placeholder="Height in px"
              value={imageCreationSettings.targetHeight}
              onChange={(e) =>
                setImageCreationSettings((prev) => ({
                  ...prev,
                  targetHeight: e.target.value,
                }))
              }
              mt={2}
            />
          </Box>
        </>
      )}

      {/* 🔄 Resize Method */}
      <Box>
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
        >
          <option value="maintain_aspect">Maintain Aspect</option>
          <option value="crop">Crop</option>
          <option value="stretch">Stretch</option>
        </Select>
      </Box>

      {/* 💎 Quality */}
      <Box>
        <Text fontWeight="bold">Quality (1–100)</Text>
        <Input
          type="number"
          min="1"
          max="100"
          placeholder="85"
          value={imageCreationSettings.quality}
          onChange={(e) =>
            setImageCreationSettings((prev) => ({
              ...prev,
              quality: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>
    </VStack>
  );
         case "Resize Image":
  return (
    <VStack align="stretch" spacing={4}>
      {/* Target Width */}
      <Box>
        <Text fontWeight="bold">Target Width (px)</Text>
        <Input
          type="number"
          placeholder="Enter width in px"
          value={resizeImageSettings.targetWidth}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              targetWidth: e.target.value,
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
          value={resizeImageSettings.targetHeight}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              targetHeight: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Resize Method */}
      <Box>
        <Text fontWeight="bold">Resize Method</Text>
        <Select
          placeholder="Select resize method"
          value={resizeImageSettings.resizeMethod}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              resizeMethod: e.target.value,
            }))
          }
          mt={2}
        >
          <option value="maintain_aspect">Maintain Aspect</option>
          <option value="crop">Crop</option>
          <option value="stretch">Stretch</option>
        </Select>
      </Box>

      {/* Quality */}
      <Box>
        <Text fontWeight="bold">Quality (1–100)</Text>
        <Input
          type="number"
          min="1"
          max="100"
          placeholder="85"
          value={resizeImageSettings.quality}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              quality: e.target.value,
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
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              project_name: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Tags */}
      <Box>
        <Text fontWeight="bold">Tags (comma separated)</Text>
        <Input
          placeholder="e.g. sale, discount, ad"
          value={imageToVideoSettings.tags || ""}
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
            { label: "5s", icon: MdAccessTime },
            { label: "10s", icon: MdMovieEdit },
            { label: "15s", icon: MdAccessTime },
          ].map((item) => {
            const isSelected = imageToVideoSettings.duration === item.label;
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
                                onChange={(e) => startTransition(() => setMergeData((prev) => ({ ...prev, trim_start: e.target.value })))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>

                        <Box>
                            <Text fontWeight="bold">Trim End (seconds)</Text>
                            <Input
                                type="number" placeholder="End time"
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
          <Text fontWeight="bold">Start Time (sec)</Text>
          <Input
            type="number"
            placeholder="e.g. 0.25"
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
          <Text fontWeight="bold">End Time (sec)</Text>
          <Input
            type="number"
            placeholder="e.g. 4.0"
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
                                type="text" placeholder="Enter User ID" value={MergeData.user_id || ""}
                                onChange={(e) => startTransition(() => setMergeData({ ...MergeData, user_id: e.target.value }))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>



                        {/* 🧩 Edit ID */}
                        <Box>
                            <Text fontWeight="bold">Edit ID</Text>
                            <Input
                                type="text" placeholder="Enter Edit ID" value={MergeData.edit_id || ""}
                                onChange={(e) => startTransition(() => setMergeData({ ...MergeData, edit_id: e.target.value }))} // ✅ Wrapped in startTransition
                                mt={2}
                            />
                        </Box>

                        {/* 🧩 Brand Outro Video */}
                        <Box>
                            <Text fontWeight="bold">Brand Outro Video URL</Text>
                            <Input
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
          bg="white"
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
                                        type="text" placeholder="Enter Merge ID" value={MergeData.mearg_id || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, mearg_id: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Height (px)</Text>
                                    <Input
                                        type="number" placeholder="1080" value={MergeData.height || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, height: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>

                                <Box>
                                    <Text fontWeight="bold">Width (px)</Text>
                                    <Input
                                        type="number" placeholder="1920" value={MergeData.width || ""}
                                        onChange={(e) => startTransition(() => setMergeData({ ...MergeData, width: e.target.value }))} // ✅ Wrapped in startTransition
                                        mt={2}
                                    />
                                </Box>
                            </>
                        )}
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
