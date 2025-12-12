import React, { startTransition } from "react";
import { Box, VStack, Text, Input, Select, Spinner } from "@chakra-ui/react";

const ImageCreationPanel = ({
  imageCreationSettings,
  setImageCreationSettings,
  guidelines,
  useCases,
  searchTerm,
  setSearchTerm,
  loading,
  loadingUseCase,
  colorMode,
  textcolor,
}) => {
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
};

export default ImageCreationPanel;
