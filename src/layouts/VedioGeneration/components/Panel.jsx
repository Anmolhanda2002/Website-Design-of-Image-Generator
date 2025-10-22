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
} from "@chakra-ui/react";
import { useState,useEffect,startTransition  } from "react";
import axiosInstance from "utils/AxiosInstance";
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
          placeholder="Enter quality"
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
      {/* Custom ID */}
      <Box>
        <Text fontWeight="bold">Custom ID</Text>
        <Input
          placeholder="Enter custom ID"
          value={resizeImageSettings.customId}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              customId: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Product ID */}
      <Box mt={4}>
        <Text fontWeight="bold">Product ID</Text>
        <Input
          placeholder="Enter product ID"
          value={resizeImageSettings.productId}
          onChange={(e) =>
            setResizeImageSettings((prev) => ({
              ...prev,
              productId: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

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
          placeholder="Enter quality"
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

      {/* Optional Debug Preview */}
      <Box
        mt={6}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        fontSize="sm"
      >
        <Text fontWeight="bold" mb={1}>
          🧩 Current Resize Image Settings:
        </Text>
        <pre>{JSON.stringify(resizeImageSettings, null, 2)}</pre>
      </Box>
    </>
  );
case "Image to Video":
  return (
    <>
      {/* Customer ID */}
      <Box>
        <Text fontWeight="bold">Customer ID</Text>
        <Input
          placeholder="Enter customer ID"
          value={imageToVideoSettings.customer_ID}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              customer_ID: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Product ID */}
      <Box mt={4}>
        <Text fontWeight="bold">Product ID</Text>
        <Input
          placeholder="Enter product ID"
          value={imageToVideoSettings.product_ID}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              product_ID: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

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

      {/* Sector */}
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
          <option value="E-commerce">E-commerce</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Finance">Finance</option>
          <option value="Entertainment">Entertainment</option>
        </Select>
      </Box>

      {/* Goal */}
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

      {/* Key Instructions */}
      <Box mt={4}>
        <Text fontWeight="bold">Key Instructions</Text>
        <Textarea
          placeholder="Enter key points to highlight"
          value={imageToVideoSettings.key_instructions}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              key_instructions: e.target.value,
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

      {/* M_key */}
      <Box mt={4}>
        <Text fontWeight="bold">M_Key</Text>
        <Input
          placeholder="Enter M_key"
          value={imageToVideoSettings.M_key}
          onChange={(e) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              M_key: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Resize Toggle */}
      <Box mt={4}>
        <Text fontWeight="bold">Resize</Text>
        <Select
          placeholder="Select resize option"
          value={imageToVideoSettings.resize ? "true" : "false"}
          onChange={(e) => {
            const val = e.target.value === "true";
            setImageToVideoSettings((prev) => ({
              ...prev,
              resize: val,
              ...(val === false && { resize_width: "", resize_height: "" }),
            }));
          }}
          mt={2}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </Select>
      </Box>

      {/* Width & Height only if resize = true */}
      {imageToVideoSettings.resize && (
        <>
          <Box mt={4}>
            <Text fontWeight="bold">Resize Width (px)</Text>
            <Input
              type="number"
              placeholder="Enter width in px"
              value={imageToVideoSettings.resize_width}
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
            <Text fontWeight="bold">Resize Height (px)</Text>
            <Input
              type="number"
              placeholder="Enter height in px"
              value={imageToVideoSettings.resize_height}
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

      {/* Video Duration */}
      <Box mt={4}>
        <Text fontWeight="bold">Video Duration</Text>
        <RadioGroup
          value={imageToVideoSettings.duration}
          onChange={(val) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              duration: val,
            }))
          }
        >
          <Stack direction="row" mt={2}>
            <Radio value="5s">5s</Radio>
            <Radio value="10s">10s</Radio>
            <Radio value="15s">15s</Radio>
          </Stack>
        </RadioGroup>
      </Box>

      {/* Aspect Ratio */}
      <Box mt={4}>
        <Text fontWeight="bold">Aspect Ratio</Text>
        <RadioGroup
          value={imageToVideoSettings.aspect_ratio}
          onChange={(val) =>
            setImageToVideoSettings((prev) => ({
              ...prev,
              aspect_ratio: val,
            }))
          }
        >
          <Stack direction="row" mt={2}>
            <Radio value="16:9">16:9</Radio>
            <Radio value="9:16">9:16</Radio>
            <Radio value="1:1">1:1</Radio>
          </Stack>
        </RadioGroup>
      </Box>

      {/* Optional JSON Preview */}
      <Box
        mt={6}
        p={3}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        fontSize="sm"
      >
        <Text fontWeight="bold" mb={1}>
          🧩 Current Image to Video Settings:
        </Text>
        <pre>{JSON.stringify(imageToVideoSettings, null, 2)}</pre>
      </Box>
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
  "&::-webkit-scrollbar": { width: "6px", background: "transparent" },
  "&:hover::-webkit-scrollbar-thumb": { background: "#ccc", borderRadius: "3px" },
}}

    >
      {renderPanelContent()}
    </VStack>
  );
}
