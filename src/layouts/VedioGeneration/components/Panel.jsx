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
} from "@chakra-ui/react";
import { useState } from "react";
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
}) {
  const panelBg = useColorModeValue("white", "gray.800");

  const handleChange = (field, value) => {
    console.log(`[${activeTab}] ${field}:`, value);
  };
const [imageCreationSettings, setImageCreationSettings] = useState({
  compositionId: "",
  targetMethod: "disable",
  targetWidth: "",
  targetHeight: "",
  resizeMethod: "",
  quality: "",
});
const [resizeImageSettings, setResizeImageSettings] = useState({
  customId: "",
  productId: "",
  targetWidth: "",
  targetHeight: "",
  resizeMethod: "",
  quality: "",
});

const [imageToVideoSettings, setImageToVideoSettings] = useState({
  customer_ID: "",
  product_ID: "",
  layover_text: "",
  project_name: "",
  tags: "",
  sector: "",
  goal: "",
  key_instructions: "",
  consumer_message: "",
  M_key: "",
  resize: false,
  resize_width: "",
  resize_height: "",
  duration: "",
  aspect_ratio: "",
});


  const renderPanelContent = () => {
    switch (activeTab) {
  case "Image Creation":
  return (
    <>
      {/* Composition ID */}
      <Box>
        <Text fontWeight="bold">Composition ID</Text>
        <Input
          placeholder="Enter composition ID"
          value={imageCreationSettings.compositionId}
          onChange={(e) =>
            setImageCreationSettings((prev) => ({
              ...prev,
              compositionId: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Target Method */}
      <Box mt={4}>
        <Text fontWeight="bold">Target Method</Text>
        <Select
          placeholder="Select option"
          value={imageCreationSettings.targetMethod}
          onChange={(e) => {
            const value = e.target.value;
            setImageCreationSettings((prev) => ({
              ...prev,
              targetMethod: value,
              // Reset width/height if disabled
              ...(value === "disable" && { targetWidth: "", targetHeight: "" }),
            }));
          }}
          mt={2}
        >
          <option value="enable">Enable</option>
          <option value="disable">Disable</option>
        </Select>
      </Box>

      {/* Target Width & Height only if Target Method is Enabled */}
      {imageCreationSettings.targetMethod === "enable" && (
        <>
          <Box mt={4}>
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

          <Box mt={4}>
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

      {/* Resize Method */}
      <Box mt={4}>
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

      {/* Quality */}
      <Box mt={4}>
        <Text fontWeight="bold">Quality (1-100)</Text>
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

      {/* Optional Preview for Debugging */}
      <Box
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
      </Box>
    </>
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
