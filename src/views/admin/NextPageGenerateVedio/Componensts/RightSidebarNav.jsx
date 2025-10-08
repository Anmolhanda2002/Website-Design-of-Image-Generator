import React from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";

const RightSidebarForm = ({ projectData, setProjectData }) => {
  const handleInputChange = (key, value) => {
    setProjectData({ ...projectData, [key]: value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "demo");
    const res = await fetch("https://api.cloudinary.com/v1_1/demo/image/upload", { method: "POST", body: formData });
    const data = await res.json();
    setProjectData({ ...projectData, imageUrls: [...projectData.imageUrls, data.secure_url] });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        key: "HYG-F0320226A74C5F66-07ED",
        image_urls: projectData.imageUrls,
        video_dimensions: projectData.dimension,
        duration: projectData.duration,
        sector: projectData.sector,
        goal: projectData.goal,
        key_instructions: projectData.instructions,
        product_name: projectData.productName,
        project_name: projectData.projectName,
        tags: projectData.tags.split(",").map((t) => t.trim()),
        context: projectData.context,
        layover_text: projectData.layoverText,
        consumer_message: projectData.consumerMessage,
      };
      const res = await axiosInstance.post("/execute_for_video/dashboard/", payload);
      setProjectData({ ...projectData, videoUrls: res.data.videos || [] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box w="300px" bg="white" p={4} borderLeft="1px solid" borderColor="gray.200" overflowY="auto">
      <VStack align="stretch" spacing={4}>
        <FormControl>
          <FormLabel>Upload Image</FormLabel>
          <Input type="file" onChange={handleImageUpload} />
          {projectData.imageUrls.map((url, idx) => (
            <img key={idx} src={url} alt="uploaded" style={{ width: "100%", marginTop: "8px" }} />
          ))}
        </FormControl>

        <FormControl><FormLabel>Project Name</FormLabel><Input value={projectData.projectName} onChange={(e) => handleInputChange("projectName", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Product Name</FormLabel><Input value={projectData.productName} onChange={(e) => handleInputChange("productName", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Goal</FormLabel>
          <Select placeholder="Select goal" value={projectData.goal} onChange={(e) => handleInputChange("goal", e.target.value)}>
            <option value="brand_awareness">Brand Awareness</option>
            <option value="engagement">Engagement</option>
            <option value="conversion">Conversion</option>
          </Select>
        </FormControl>
        <FormControl><FormLabel>Sector</FormLabel>
          <Select placeholder="Select sector" value={projectData.sector} onChange={(e) => handleInputChange("sector", e.target.value)}>
            <option value="fashion">Fashion</option>
            <option value="education">Education</option>
            <option value="finance">Finance</option>
            <option value="health">Healthcare</option>
            <option value="tech">Technology</option>
          </Select>
        </FormControl>
        <FormControl><FormLabel>Dimension</FormLabel>
          <Select placeholder="Select dimension" value={projectData.dimension} onChange={(e) => handleInputChange("dimension", e.target.value)}>
            <option value="16:9">16:9</option>
            <option value="4:3">4:3</option>
            <option value="1:1">1:1</option>
            <option value="9:16">9:16</option>
          </Select>
        </FormControl>
        <FormControl><FormLabel>Duration (seconds)</FormLabel><Input type="number" value={projectData.duration} onChange={(e) => handleInputChange("duration", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Key Instructions</FormLabel><Textarea value={projectData.instructions} onChange={(e) => handleInputChange("instructions", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Context</FormLabel><Textarea value={projectData.context} onChange={(e) => handleInputChange("context", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Layover Text</FormLabel><Input value={projectData.layoverText} onChange={(e) => handleInputChange("layoverText", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Consumer Message</FormLabel><Input value={projectData.consumerMessage} onChange={(e) => handleInputChange("consumerMessage", e.target.value)} /></FormControl>
        <FormControl><FormLabel>Tags (comma separated)</FormLabel><Input value={projectData.tags} onChange={(e) => handleInputChange("tags", e.target.value)} /></FormControl>

        <Button colorScheme="blue" onClick={handleSubmit}>Generate Video</Button>
      </VStack>
    </Box>
  );
};

export default RightSidebarForm;
