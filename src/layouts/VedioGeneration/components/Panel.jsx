import React from "react";
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
  Textarea
  ,useToast,Spinner,
  HStack,SimpleGrid,
  Icon, Flex
} from "@chakra-ui/react";
import { useState,useEffect,startTransition  } from "react";
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
  setImageToVideoSettings,captionData, setCaptionData
}) {
  const panelBg = useColorModeValue("white", "gray.800");

  const handleChange = (field, value) => {
    console.log(`[${activeTab}] ${field}:`, value);
  };


  // console.log("hello",imageCreationSettings)

 const [searchTerm, setSearchTerm] = useState("");
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();


  const [dropdownData, setDropdownData] = useState({
    video_dimensions_choices: {},
    sector_choices: [],
    M_key: {},
  });

  // 🔍 Fetch Guidelines from API
useEffect(() => {
  const fetchGuidelines = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/search_image_guidelines/?name=${searchTerm}`);

      // ✅ Extract 'results' safely
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setGuidelines(data);
    } catch (error) {
      toast({
        title: "Failed to fetch guidelines",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const delayDebounce = setTimeout(fetchGuidelines, 500);
  return () => clearTimeout(delayDebounce);
}, [searchTerm, toast]);

// section for image to video
  const generateShortUUID = () => {
    return (
      "PRD-" +
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Date.now().toString(36)
    ).slice(0, 48);
  };

  useEffect(() => {
    const fetchDropdowns = async () => {
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
        });
      } finally {
        setLoading(false);
      }
    };

    // Get user_id from localStorage
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

  if (loading) return <Spinner size="lg" mt={5} />;

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
         onChange={(e) =>
    startTransition(() => {
      setSearchTerm(e.target.value);
    })
  }
          mt={2}
        />
      </Box>

      {/* 🧩 Select Guideline */}
      <Box>
        <Text fontWeight="bold">Select Guideline</Text>
        {loading ? (
          <Spinner mt={3} />
        ) : (
          <Select
            placeholder="Select a guideline"
            value={imageCreationSettings.guidelineId}
            onChange={(e) =>
              setImageCreationSettings((prev) => ({
                ...prev,
                guidelineId: e.target.value,
              }))
            }
            mt={2}
          >
        {Array.isArray(guidelines) && guidelines.length > 0 ? (
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
              ...(value === "disable" && { targetWidth: "", targetHeight: "" }),
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

      {/* 🧠 Debug Preview */}
      {/* <Box
        mt={6}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        fontSize="sm"
      >
        <Text fontWeight="bold" mb={1}>
          🧩 Current Image Creation Settings:
        </Text>
        <pre>{JSON.stringify(imageCreationSettings, null, 2)}</pre>
      </Box> */}
    </VStack>
  );


      case "Resize Image":
  return (
    <>




      {/* Target Width */}
      <Box mt={4}>
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
      <Box mt={4}>
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
      <Box mt={4}>
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
      <Box mt={4}>
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



    </>
  );
case "Image to Video":
  return (
    <>
      {/* Customer ID (Auto-filled) */}
      {/* <Box>
        <Text fontWeight="bold">Customer ID</Text>
        <Input
          value={imageToVideoSettings.customer_ID}
          isReadOnly
          mt={2}
        />
      </Box> */}

      {/* Product ID (Auto-generated unique) */}
      {/* <Box mt={4}>
        <Text fontWeight="bold">Product ID</Text>
        <Input
          value={imageToVideoSettings.product_ID}
          isReadOnly
          mt={2}
        />
      </Box> */}

      {/* Layover Text */}
      <Box mt={4}>
        <Text fontWeight="bold">Layover Text</Text>
        <Input
          placeholder="Enter layover text (e.g. Limited Time Offer!)"
          value={imageToVideoSettings.layover_text}
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
      <Box mt={4}>
        <Text fontWeight="bold">Project Name</Text>
        <Input
          placeholder="Enter project name"
          value={imageToVideoSettings.project_name}
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
      <Box mt={4}>
        <Text fontWeight="bold">Tags (comma separated)</Text>
        <Input
          placeholder="e.g. sale, discount, ad"
          value={imageToVideoSettings.tags}
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
<Box mt={4}>
  <Text fontWeight="bold">Sector</Text>
  <Select
    placeholder="Select sector"
    value={imageToVideoSettings.sector}
    onChange={(e) =>
      setImageToVideoSettings((prev) => ({
        ...prev,
        sector: e.target.value,
      }))
    }
    mt={2}
  >
    {/* Group by category */}
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
      <Box mt={4}>
        <Text fontWeight="bold">Goal / Description</Text>
        <Textarea
          placeholder="Describe the project goal"
          value={imageToVideoSettings.goal}
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
      <Box mt={4}>
        <Text fontWeight="bold">Consumer Message</Text>
        <Textarea
          placeholder="Enter message for the audience"
          value={imageToVideoSettings.consumer_message}
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
      <Box mt={4}>
        <Text fontWeight="bold">M_Key</Text>
        <Select
          placeholder="Select M_Key"
          value={imageToVideoSettings.M_key}
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

{/* video type */}
<Box mt={4}>
  <Text fontWeight="bold">Video Type</Text>
  <Select
    placeholder="Select video type"
    value={imageToVideoSettings.video_type}
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
<Box mt={4}>
  <Text fontWeight="bold" mb={2}>
    Video Duration
  </Text>

  <SimpleGrid
    columns={{ base: 2, sm: 3 }} // 👈 responsive: 2 on mobile, 3 on desktop
    spacing="3px" // 👈 30px gap between items
  >
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
          
          w="80px" // 👈 fixed width
          mx="auto"
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
          <Icon as={item.icon} boxSize={6} mb={2} />
          <Text fontWeight="medium">{item.label}</Text>
        </Flex>
      );
    })}
  </SimpleGrid>
</Box>

      {/* Aspect Ratio (Dynamic from API) */}
<Box mt={4}>
  <Text fontWeight="bold" mb={2}>
    Aspect Ratio
  </Text>

  <SimpleGrid
    columns={{ base: 2, sm: 2}} // responsive: 2 per row on mobile, 3 on desktop
    spacing="30px"
    mt={2}
  >
    {Object.entries(video_dimensions_choices).map(([label, val]) => {
      // Pick icon based on aspect ratio
      const icon =
        label.includes("16:9") ? MdCrop169 :
        label.includes("9:16") ? MdCropPortrait :
        MdCropSquare;

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
          w="120px"
          mx="auto"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{
            borderColor: "blue.400",
            bg: panelBg,
            transform: "scale(1.05)",
          }}
          onClick={() =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              aspect_ratio: val,
            }))
          }
        >
          <Icon as={icon} boxSize={7} mb={2} />
          <Text fontWeight="small" fontSize="sm" textAlign="center">
            {label}
          </Text>
          <Text fontSize="xs" color="gray.500">
            ({val})
          </Text>
        </Flex>
      );
    })}
  </SimpleGrid>
</Box>

<Box mt={4}>
  <Text fontWeight="bold">Custom Size</Text>
  <Select
    placeholder="Select option"
    value={imageToVideoSettings.customSize}
    onChange={(e) => {
      const value = e.target.value;
      setImageToVideoSettings((prev) => ({
        ...prev,
        customSize: value,
        ...(value === "false" && { customWidth: "", customHeight: "" }),
      }));
    }}
    mt={2}
  >
    <option value="true">True</option>
    <option value="false">False</option>
  </Select>

  {/* 📏 Width / Height if True */}
  {imageToVideoSettings.customSize === "true" && (
    <>
      <Box mt={4}>
        <Text fontWeight="bold">Custom Width (px)</Text>
        <Input
          type="number"
          placeholder="Width in px"
          value={imageToVideoSettings.customWidth}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              customWidth: e.target.value,
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
          value={imageToVideoSettings.customHeight}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              customHeight: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>
    </>
  )}
</Box>

      {/* JSON Preview */}

    </>
  );

      case "Edit Video":
        return (
          <>
            <Box>
              <Text fontWeight="bold">Trim Start (seconds)</Text>
              <Input
                type="number"
                placeholder="Start time"
                onChange={(e) => handleChange("Trim Start", e.target.value)}
                mt={2}
              />
            </Box>

            <Box>
              <Text fontWeight="bold">Trim End (seconds)</Text>
              <Input
                type="number"
                placeholder="End time"
                onChange={(e) => handleChange("Trim End", e.target.value)}
                mt={2}
              />
            </Box>
          </>
        );

    case "Caption Segment":
      return (
        <VStack align="stretch" spacing={4} p={4}>
          {/* 🆔 Edit ID */}
          <Box>
            <Text fontWeight="bold">Edit ID</Text>
            <Input
              placeholder="Enter edit ID"
              value={captionData.edit_id}
              onChange={(e) =>
                setCaptionData((prev) => ({
                  ...prev,
                  edit_id: e.target.value,
                }))
              }
              mt={2}
            />
          </Box>

          {/* 🔢 Segment Number */}
          <Box>
            <Text fontWeight="bold">Segment Number</Text>
            <Input
              type="number"
              placeholder="Enter segment number"
              value={captionData.segment_number}
              onChange={(e) =>
                setCaptionData((prev) => ({
                  ...prev,
                  segment_number: e.target.value,
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
              value={captionData.text}
              onChange={(e) =>
                setCaptionData((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
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
                value={captionData.start_time}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    start_time: e.target.value,
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
                value={captionData.end_time}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    end_time: e.target.value,
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
                value={captionData.font_size}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    font_size: e.target.value,
                  }))
                }
                mt={2}
              />
            </Box>

            <Box flex="1">
              <Text fontWeight="bold">Font Color</Text>
              <Input
                type="color"
                value={captionData.font_color}
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
                value={captionData.background_color}
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
                value={captionData.background_opacity}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    background_opacity: e.target.value,
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
                value={captionData.x}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    x: e.target.value,
                  }))
                }
                mt={2}
              />
            </Box>

            <Box flex="1">
              <Text fontWeight="bold">Y Position</Text>
              <Input
                placeholder="e.g. 10%"
                value={captionData.y}
                onChange={(e) =>
                  setCaptionData((prev) => ({
                    ...prev,
                    y: e.target.value,
                  }))
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
              value={captionData.animation}
              onChange={(e) =>
                setCaptionData((prev) => ({
                  ...prev,
                  animation: e.target.value,
                }))
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
              value={captionData.animation_speed}
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

          {/* 🧩 Optional: include CaptionedEdit */}
      
        </VStack>
      )
      default:
        return <Text>⚙️ Adjust your {activeTab} settings here</Text>;
    }
  };

  return (
<VStack
  w="100%"
  h="100%"
  bg={panelBg}
  p={4}
  borderRadius="lg"
  align="stretch"
  spacing={6}
  overflowY="auto"
  sx={{
    "&::-webkit-scrollbar": {
      width: "6px",
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "transparent",
      borderRadius: "3px",
    },
    "&:hover::-webkit-scrollbar-thumb": {
      background: "#ccc",
    },
  }}
>


    
      {renderPanelContent()}
    </VStack>
  );
}
