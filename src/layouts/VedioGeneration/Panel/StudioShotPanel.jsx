import React, { startTransition } from "react";
import { Box, VStack, Text, Input, Select, Spinner } from "@chakra-ui/react";

const StudioShotPanel = ({
  bulkImageData,
  setBulkImageData,
  guidelines,
  searchTerm,
  setSearchTerm,
  loading,
  colorMode,
  textcolor,
}) => {

    console.log(bulkImageData)
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
      <Box mt={3}>
        <Text fontWeight="bold">Select Guideline</Text>

        {loading ? (
          <Spinner mt={3} />
        ) : (
          <Select
            placeholder="Select guideline"
            mt={2}
            value={
              bulkImageData.image_guideline_id
                ? String(bulkImageData.image_guideline_id)
                : ""
            }
            onChange={(e) =>
              setBulkImageData((prev) => ({
                ...prev,
                image_guideline_id: e.target.value, // always string
              }))
            }
            sx={{
              "& option": {
                backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
                color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
              },
            }}
          >
            {guidelines.length > 0 ? (
              guidelines.map((g) => (
                <option key={g.guideline_id} value={String(g.guideline_id)}>
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
          <option value="saree">Saree</option>
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
   
   {/* ===========================
       SHOW ONLY IF: 
       model = 456 or 789   AND  product_type = saree
   =========================== */}
   {[456, 789].includes(Number(bulkImageData.model)) &&
     bulkImageData.product_type === "saree" && (
       <Box mt={4} p={2}>
         {/* <Text fontWeight="bold">Microscope View Options</Text> */}
   
         {/* enable_multi_scale */}
         <Box mt={3}>
           <Text fontWeight="semibold">Enable Multi Scale</Text>
           <Select
             mt={2}
             value={bulkImageData.enable_multi_scale ? "true" : "false"}
             onChange={(e) =>
               setBulkImageData((prev) => ({
                 ...prev,
                 enable_multi_scale: e.target.value === "true",
               }))
             }
             sx={{
               "& option": {
                 backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
                 color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
               },
             }}
           >
             <option value="true">Enable</option>
             <option value="false">Disable</option>
           </Select>
         </Box>
   
         {/* zoom_factor → ONLY IF enable_multi_scale TRUE */}
         {bulkImageData.enable_multi_scale && (
           <Box mt={3}>
             <Text fontWeight="semibold">Zoom Factor</Text>
            <Select
     mt={2}
     value={parseFloat(bulkImageData.zoom_factor)}  // Convert to number
     onChange={(e) =>
       setBulkImageData((prev) => ({
         ...prev,
         zoom_factor: parseFloat(e.target.value),  // Always number
       }))
     }
     sx={{
       "& option": {
         backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
         color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
       },
     }}
   >
     <option value={1.0}>100%</option>
     <option value={2.0}>200%</option>
     <option value={3.0}>300%</option>
     <option value={4.0}>400%</option>
   </Select>
   
           </Box>
         )}
       </Box>
     )}
   
   
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
};

export default StudioShotPanel;
