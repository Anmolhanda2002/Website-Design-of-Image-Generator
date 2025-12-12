import React from "react";
import { Box, VStack, Text, Input, Select, SimpleGrid, Flex, Icon, Textarea } from "@chakra-ui/react";
import { MdAccessTime, MdMovieEdit, MdCrop169, MdCropPortrait, MdCropSquare } from "react-icons/md";

const ImageToVideoPanel = ({
  imageToVideoSettings,
  setImageToVideoSettings,
  lifestyleIds = [],
  sector_choices = [],
  M_key = {},
  video_dimensions_choices = {},
  projectSearch,
  setProjectSearch,
  projects = [],
  loadingProjects = false,
  fetchProjects,
  colorMode,
  textcolor,
  panelBg
}) => {
  // Helper: group sectors by category
  const groupedSectors = sector_choices.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

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
               {/* console.log(isSelected) */}
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
};

export default ImageToVideoPanel;
