import React from "react";
import { Box, VStack, Text, Input, Select } from "@chakra-ui/react";

const ResizeImagePanel = ({ resizeImageSettings, setResizeImageSettings, colorMode, textcolor }) => {
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
};

export default ResizeImagePanel;
