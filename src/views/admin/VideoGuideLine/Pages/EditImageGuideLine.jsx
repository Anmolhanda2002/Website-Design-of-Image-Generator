import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Grid,
  Input,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Button,
  Spinner,
  Divider,
  Heading,
  Text,
  useColorMode,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { useNavigate, useParams } from "react-router-dom";
import { showAlert } from "utils/AlertHelper";
import { useLocation } from "react-router-dom";
import { IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

export default function EditVideoGuideline() {
  

  const { guideline_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [choices, setChoices] = useState({});
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("user_id");
  const [form, setForm] = useState({
    guideline_name: "",
    pace: "",
    aspect_ratio: "",
    video_style: "",
    special_effects_or_transition: "",
    camera_motion: "",
    location_of_overlay: "",
    video_provider: "",
    video_provider_key: "",
    prompt_llm: "",
    prompt_llm_key: "",
    vision_llm: "",
    vision_llm_key: "",
    is_default: false,
  });

  const cardBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.800", "white");

  const safeEntries = (obj) => (obj && typeof obj === "object" ? Object.entries(obj) : []);

  // Fetch choices and guideline details
  useEffect(() => {
    const fetchData = async () => {
      try {
    

        const [choicesRes, guidelineRes] = await Promise.all([
          axiosInstance.get("/get_video_guideline_choices/"),
          axiosInstance.post("/factory_development_get_video_guideline_detail/", {guideline_id,user_id:userId }),
        ]);

        if (choicesRes.data.status === "success") {
          setChoices(choicesRes.data.data);
        }

        if (guidelineRes.data.status === "success") {
          const g = guidelineRes.data.data;
          setForm({
            guideline_name: g.guideline_name || "",
            pace: g.video_pace || "",
            aspect_ratio: g.target_aspect_ratio || "",
            video_style: g.video_style || "",
            special_effects_or_transition: g.special_effects_or_transition || "",
            camera_motion: g.camera_motion || "",
            location_of_overlay: g.location_of_overlay || "",
            video_provider: g.video_provider || "",
            video_provider_key: g.video_provider_key_masked || "",
            prompt_llm: g.prompt_llm || "",
            prompt_llm_key: g.prompt_llm_key_masked || "",
            vision_llm: g.vision_llm || "",
            vision_llm_key: g.vision_llm_key_masked || "",
            is_default: g.is_default || false,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showAlert("error", "Error", "Failed to load guideline details.", colorMode);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideline_id, colorMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      

      const payload = {  guideline_id,user_id:userId, ...form };
      const { data } = await axiosInstance.post("/factory_development_update_video_guideline/", payload);

      if (data.status === "success") {

        showAlert("success", "Updated", "Video guideline updated successfully.", colorMode);
     
      } else {
        showAlert("error", "Failed", data.message || "Something went wrong.", colorMode);
      }
    } catch (error) {
      console.error("Error updating guideline:", error);
      showAlert("error", "Error", "Server error. Please try again later.", colorMode);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box py={20} minH="100vh" display="flex" justifyContent="center">
      <Box bg={cardBg} borderRadius="2xl" shadow="2xl" p={[6, 10]} w="100%" maxW="1000px">
         <HStack mb={4} cursor="pointer" onClick={() => navigate(-1)}>
              <ArrowBackIcon boxSize={6} color="blue.500" />
              <Text fontSize="md" color="blue.500">Back</Text>
            </HStack>
        <Heading size="lg" mb={8} color="blue.500" textAlign="center">
          Edit Video Guideline
        </Heading>

        {/* --- Basic Details --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">
            Basic Details
          </Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Input color={textColor} placeholder="Guideline Name" name="guideline_name" value={form.guideline_name} onChange={handleChange} />
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is_default" mb="0">
                Set as Default
              </FormLabel>
              <Switch id="is_default" name="is_default" isChecked={form.is_default} onChange={handleChange} colorScheme="blue" />
            </FormControl>
          </Grid>
        </VStack>

        {/* --- Video Style Options --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">
            Video Style Settings
          </Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Select placeholder="Select Pace" name="pace" value={form.pace} onChange={handleChange}>
              {safeEntries(choices.pace_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select placeholder="Select Aspect Ratio" name="aspect_ratio" value={form.aspect_ratio} onChange={handleChange}>
              {safeEntries(choices.aspect_ratio_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select placeholder="Select Video Style" name="video_style" value={form.video_style} onChange={handleChange}>
              {safeEntries(choices.video_style_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select placeholder="Special Effects / Transitions" name="special_effects_or_transition" value={form.special_effects_or_transition} onChange={handleChange}>
              {safeEntries(choices.special_effects_or_transition_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select placeholder="Camera Motion" name="camera_motion" value={form.camera_motion} onChange={handleChange}>
              {safeEntries(choices.camera_motion_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select placeholder="Overlay Location" name="location_of_overlay" value={form.location_of_overlay} onChange={handleChange}>
              {safeEntries(choices.location_of_overlay_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
          </Grid>
        </VStack>

        {/* --- AI Provider and Models --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">
            AI Provider and Models
          </Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Select placeholder="Video Provider" name="video_provider" value={form.video_provider} onChange={handleChange}>
              {safeEntries(choices.video_provider_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
            <Input color={textColor} placeholder="Video Provider Key" name="video_provider_key" value={form.video_provider_key} onChange={handleChange} />

            <Select placeholder="Prompt LLM" name="prompt_llm" value={form.prompt_llm} onChange={handleChange}>
              {safeEntries(choices.prompt_llm_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
            <Input color={textColor} placeholder="Prompt LLM Key" name="prompt_llm_key" value={form.prompt_llm_key} onChange={handleChange} />

            <Select placeholder="Vision LLM" name="vision_llm" value={form.vision_llm} onChange={handleChange}>
              {safeEntries(choices.vision_llm_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
            <Input color={textColor} placeholder="Vision LLM Key" name="vision_llm_key" value={form.vision_llm_key} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Submit Button --- */}
        <HStack justify="flex-end">
          <Button colorScheme="blue" size="lg" px={10} onClick={handleUpdate} isLoading={submitting} loadingText="Updating...">
            💾 Update Guideline
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
