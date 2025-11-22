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
import { useParams } from "react-router-dom";
import { IconButton } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

import Swal from "sweetalert2";
export default function VideoGuidelineForm({userId}) {
  const [loading, setLoading] = useState(true);
  const [choices, setChoices] = useState(null);
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
const {id} = useParams()
  const textcolor = useColorModeValue("black","white")
const isDark = colorMode === "dark";
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

  const cardBg = useColorModeValue("white", "#111c44");
  const textColor = useColorModeValue("gray.800", "white");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
  const activeUserId = selectedUser?.user_id || user?.user_id;


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


    // ✅ Create payload with user_id (no api_key)
    const payload = { user_id: activeUserId, ...form };

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
          background: isDark ? "#14225C" : "#fff",
    color: isDark ? "#fff" : "#000",
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


      setTimeout(() => {
        navigate(-1)
      }, 3000);
      // Redirect after short delay
      
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Create Guideline",
        text: data.message || "Unexpected server response.",
        confirmButtonColor: "#d33",
          background: isDark ? "#14225C" : "#fff",
    color: isDark ? "#fff" : "#000",
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
        background: isDark ? "#14225C" : "#fff",
    color: isDark ? "#fff" : "#000",
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
            <HStack mb={4} cursor="pointer" onClick={() => navigate(-1)}>
        <ArrowBackIcon boxSize={6} color="blue.500" />
        <Text fontSize="md" color="blue.500">Back</Text>
      </HStack>
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
              _placeholder={{color:textcolor}}

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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
               sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
                              _placeholder={{color:textcolor}}
            />

            <Select
              placeholder="Select Prompt LLM"
              name="prompt_llm"
              value={form.prompt_llm}
              onChange={handleChange}
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
 _placeholder={{color:textcolor}}
            />

            <Select
              placeholder="Select Vision LLM"
              name="vision_llm"
              value={form.vision_llm}
              onChange={handleChange}
                             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
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
               _placeholder={{color:textcolor}}
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
