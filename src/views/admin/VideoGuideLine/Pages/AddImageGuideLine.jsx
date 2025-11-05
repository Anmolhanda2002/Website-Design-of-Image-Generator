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
import { useNavigate } from "react-router-dom";
import { showAlert } from "utils/AlertHelper";
import Swal from "sweetalert2";
export default function VideoGuidelineForm({userId}) {
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState(null);
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

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

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  // Fetch dropdown options
  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const { data } = await axiosInstance.get("/get_video_guideline_choices/");
        if (data.status === "success") {
          setChoices(data.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching choices:", error);
        showAlert(
          "error",
          "Failed to Load Choices",
          "Unable to fetch dropdown options. Please try again later.",
          colorMode
        );
      } finally {
        setLoading(false);
      }
    };
    fetchChoices();
  }, [colorMode]);

  // Handle Input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit Form
const handleSubmit = async () => {
  try {
    // ✅ Get user_id from localStorage (adjust key names as per your app)
    const userId =
      JSON.parse(localStorage.getItem("user"))?.user_id ||
      localStorage.getItem("user_id");

    // 🛑 Check if user_id exists
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "User Not Found",
        text: "Please select or log in with a user before submitting the guideline.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // ✅ Create payload with user_id (no api_key)
    const payload = { user_id: userId, ...form };

    // ✅ Call backend
    const { data } = await axiosInstance.post(
      "/factory_development_create_video_guideline/",
      payload
    );

    // ✅ Handle success
    if (data.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Guideline Created",
        text: data.message || "Your video guideline has been saved successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form after success
      setForm({
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

      // Redirect after short delay
      
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Guideline",
        text: data.message || "Unexpected server response.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("❌ Error submitting guideline:", error);
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text:
        error.response?.data?.message ||
        "Something went wrong. Please try again later.",
      confirmButtonColor: "#d33",
    });
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
      <Box
        bg={cardBg}
        borderRadius="2xl"
        shadow="2xl"
        p={[6, 10]}
        w="100%"
        maxW="1000px"
      >
        <Heading size="lg" mb={8} color="blue.500" textAlign="center">
          Create Video Guideline
        </Heading>

        {/* --- Basic Details --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">
            Basic Details
          </Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Input
              color={textColor}
              placeholder="Guideline Name"
              name="guideline_name"
              value={form.guideline_name}
              onChange={handleChange}
            />
            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="is_default" mb="0">
                Set as Default
              </FormLabel>
              <Switch
                id="is_default"
                name="is_default"
                isChecked={form.is_default}
                onChange={handleChange}
                colorScheme="blue"
              />
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
            <Select
              placeholder="Select Pace"
              name="pace"
              value={form.pace}
              onChange={handleChange}
            >
              {Object.entries(choices.pace_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Aspect Ratio"
              name="aspect_ratio"
              value={form.aspect_ratio}
              onChange={handleChange}
            >
              {Object.entries(choices.aspect_ratio_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Video Style"
              name="video_style"
              value={form.video_style}
              onChange={handleChange}
            >
              {Object.entries(choices.video_style_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>

            <Select
              placeholder="Select Special Effects / Transitions"
              name="special_effects_or_transition"
              value={form.special_effects_or_transition}
              onChange={handleChange}
            >
              {Object.entries(choices.special_effects_or_transition_choices).map(
                ([key, val]) => (
                  <option key={val} value={val}>
                    {key}
                  </option>
                )
              )}
            </Select>

            <Select
              placeholder="Select Camera Motion"
              name="camera_motion"
              value={form.camera_motion}
              onChange={handleChange}
            >
              {Object.entries(choices.camera_motion_choices).map(
                ([key, val]) => (
                  <option key={val} value={val}>
                    {key}
                  </option>
                )
              )}
            </Select>

            <Select
              placeholder="Select Overlay Location"
              name="location_of_overlay"
              value={form.location_of_overlay}
              onChange={handleChange}
            >
              {Object.entries(choices.location_of_overlay_choices).map(
                ([key, val]) => (
                  <option key={val} value={val}>
                    {key}
                  </option>
                )
              )}
            </Select>
          </Grid>
        </VStack>

        {/* --- Provider and Models --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">
            AI Provider and Models
          </Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Select
              placeholder="Select Video Provider"
              name="video_provider"
              value={form.video_provider}
              onChange={handleChange}
            >
              {Object.entries(choices.video_provider_choices).map(
                ([key, val]) => (
                  <option key={val} value={val}>
                    {key}
                  </option>
                )
              )}
            </Select>
            <Input
              color={textColor}
              placeholder="Video Provider Key"
              name="video_provider_key"
              value={form.video_provider_key}
              onChange={handleChange}
            />

            <Select
              placeholder="Select Prompt LLM"
              name="prompt_llm"
              value={form.prompt_llm}
              onChange={handleChange}
            >
              {Object.entries(choices.prompt_llm_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
            <Input
              color={textColor}
              placeholder="Prompt LLM Key"
              name="prompt_llm_key"
              value={form.prompt_llm_key}
              onChange={handleChange}
            />

            <Select
              placeholder="Select Vision LLM"
              name="vision_llm"
              value={form.vision_llm}
              onChange={handleChange}
            >
              {Object.entries(choices.vision_llm_choices).map(([key, val]) => (
                <option key={val} value={val}>
                  {key}
                </option>
              ))}
            </Select>
            <Input
              color={textColor}
              placeholder="Vision LLM Key"
              name="vision_llm_key"
              value={form.vision_llm_key}
              onChange={handleChange}
            />
          </Grid>
        </VStack>

        {/* --- Submit Button --- */}
        <HStack justify="flex-end">
          <Button colorScheme="blue" size="lg" px={10} onClick={handleSubmit}>
            Save Video Guideline
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
