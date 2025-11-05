import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Input,
  Textarea,
  Select,
  Button,
  Spinner,
  useToast,
  useColorModeValue,
  Divider,
  Text,
  Heading,
} from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
export default function ImageGuidelineForm() {
  const [choices, setChoices] = useState(null);
  const [loading, setLoading] = useState(true);
  const {id} = useParams()
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    sector: "",
    use_case: "",
    product_name: "",
    product_info: "",
    goal: "",
    goal_description: "",
    goal_of_image: "",
    main_focus_of_image: "",
    model_ethnicity: "",
    model_gender: "",
    model_built: "",
    model_age_range: "",
    model_personality_features: "",
    model_other_features: "",
    environment_category: "",
    environment_interior: "",
    environment_exterior: "",
    environment_lifestyle_editorial: "",
    environment_other: "",
    pose_category: "",
    pose_general: "",
    pose_yoga: "",
    pose_activity: "",
    pose_other: "",
    mood: "",
    lighting_preference: "",
    color_palette: "",
    style_preference: "",
    human_instruction: "",
    additional_instructions: "",
  });

  const toast = useToast();
//   const bg = useColorModeValue("gray.50", "navy.800");
  const cardBg = useColorModeValue("white", "navy.700");
  const textcolor = useColorModeValue("black","white")

  // Fetch dropdown data
  useEffect(() => {
    const fetchChoices = async () => {
      try {
        const { data } = await axiosInstance.get("/get_image_guideline_choices");
        setChoices(data.data);
      } catch (error) {
        console.error("Error fetching choices:", error);
        toast({
          title: "Failed to fetch dropdown options",
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchChoices();
  }, [toast]);

  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
const handleSubmit = async () => {
  try {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    const selectedUser = JSON.parse(localStorage.getItem("selected_user"));

    // 🔹 Require user selection for Manager
    if (loggedUser?.role === "Manager" && !selectedUser) {
      Swal.fire({
        icon: "warning",
        title: "Select User Required",
        text: "Please select a user before submitting.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // 🔹 Require API key
 

    // 🔹 Build payload
    const payload = {

      user_id:
        id,
      ...form,
    };

    const { data } = await axiosInstance.post(
      "/factory_development_create_image_guideline/",
      payload
    );

    // 🔹 Success Response
    if (data.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Guideline Created",
        text: "Your image guideline has been saved successfully!",
        timer: 3000,
        showConfirmButton: false,
      });

      // Reset form
      setForm({
        name: "",
        description: "",
        sector: "",
        use_case: "",
        product_name: "",
        product_info: "",
        goal: "",
        goal_description: "",
        goal_of_image: "",
        main_focus_of_image: "",
        model_ethnicity: "",
        model_gender: "",
        model_built: "",
        model_age_range: "",
        model_personality_features: "",
        model_other_features: "",
        environment_category: "",
        environment_interior: "",
        environment_exterior: "",
        environment_lifestyle_editorial: "",
        environment_other: "",
        pose_category: "",
        pose_general: "",
        pose_yoga: "",
        pose_activity: "",
        pose_other: "",
        mood: "",
        lighting_preference: "",
        color_palette: "",
        style_preference: "",
        human_instruction: "",
        additional_instructions: "",
      });
    }
  } catch (error) {
    console.error("Error submitting:", error);

    // 🔹 Extract backend error message safely
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.response?.data?.error ||
      "Something went wrong. Please try again later.";

    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: backendMessage,
      confirmButtonColor: "#d33",
    });
  }
};


  if (loading)
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );

  return (
    <Box  py={20}  minH="100vh" display="flex" justifyContent="center">
      <Box bg={cardBg} borderRadius="2xl" shadow="2xl" p={[6, 10]} w="100%" maxW="1100px">
        <Heading size="lg" mb={8} color="blue.600" textAlign="center">
          Create Image Guideline
        </Heading>

        {/* --- Basic Information --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Basic Information</Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Input color={textcolor} placeholder="Guideline Name" name="name" value={form.name} onChange={handleChange} />
            <Textarea placeholder="Description" name="description" value={form.description} onChange={handleChange} />
            <Select placeholder="Select Use Case" name="use_case" value={form.use_case} onChange={handleChange}>
              {Object.entries(choices.use_case_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Select placeholder="Select Sector" name="sector" value={form.sector} onChange={handleChange}>
              {Object.entries(choices.sector_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
          </Grid>
        </VStack>

        {/* --- Product Information --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Product Information</Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Input color={textcolor} placeholder="Product Name" name="product_name" value={form.product_name} onChange={handleChange} />
            <Textarea placeholder="Product Info" name="product_info" value={form.product_info} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Goals & Objectives --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Goals & Objectives</Text>
          <Divider />
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Select placeholder="Select Goal" name="goal" value={form.goal} onChange={handleChange}>
              {Object.entries(choices.goal_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Textarea placeholder="Goal Description" name="goal_description" value={form.goal_description} onChange={handleChange} />
          </Grid>
          <Grid templateColumns={["1fr", "1fr 1fr"]} gap={6} w="100%">
            <Input color={textcolor}  placeholder="Goal of Image" name="goal_of_image" value={form.goal_of_image} onChange={handleChange} />
            <Input color={textcolor} placeholder="Main Focus of Image" name="main_focus_of_image" value={form.main_focus_of_image} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Model (Human) Specifications --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Model (Human) Specifications</Text>
          <Divider />
          <Grid templateColumns={["1fr", "repeat(3, 1fr)"]} gap={6} w="100%">
            <Select placeholder="Select Gender" name="model_gender" value={form.model_gender} onChange={handleChange}>
              {Object.entries(choices.gender_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Select placeholder="Select Ethnicity" name="model_ethnicity" value={form.model_ethnicity} onChange={handleChange}>
              {Object.entries(choices.ethnicity_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Select placeholder="Select Body Type" name="model_built" value={form.model_built} onChange={handleChange}>
              {Object.entries(choices.built_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
          </Grid>

          <Grid templateColumns={["1fr", "repeat(3, 1fr)"]} gap={6} w="100%">
            <Input color={textcolor} placeholder="Model Age Range (e.g. 25-30)" name="model_age_range" value={form.model_age_range} onChange={handleChange} />
            <Input color={textcolor}  placeholder="Personality Features" name="model_personality_features" value={form.model_personality_features} onChange={handleChange} />
            <Input color={textcolor} placeholder="Other Features" name="model_other_features" value={form.model_other_features} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Environment Details --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Environment Details</Text>
          <Divider />
          <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={6} w="100%">
            <Select placeholder="Environment Category" name="environment_category" value={form.environment_category} onChange={handleChange}>
              {Object.entries(choices.environment_category_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Input color={textcolor} placeholder="Interior (optional)" name="environment_interior" value={form.environment_interior} onChange={handleChange} />
            <Input color={textcolor} placeholder="Exterior (e.g. Garden)" name="environment_exterior" value={form.environment_exterior} onChange={handleChange} />
            <Input color={textcolor} placeholder="Lifestyle/Editorial" name="environment_lifestyle_editorial" value={form.environment_lifestyle_editorial} onChange={handleChange} />
            <Input color={textcolor} placeholder="Other Environment" name="environment_other" value={form.environment_other} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Pose Details --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Pose Details</Text>
          <Divider />
          <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={6} w="100%">
            <Select placeholder="Pose Category" name="pose_category" value={form.pose_category} onChange={handleChange}>
              {Object.entries(choices.pose_category_choices).map(([key, val]) => (
                <option key={val} value={val}>{key}</option>
              ))}
            </Select>
            <Input color={textcolor} placeholder="General Pose (e.g. Frontal)" name="pose_general" value={form.pose_general} onChange={handleChange} />
            <Input color={textcolor} placeholder="Yoga Pose" name="pose_yoga" value={form.pose_yoga} onChange={handleChange} />
            <Input color={textcolor} placeholder="Activity Pose" name="pose_activity" value={form.pose_activity} onChange={handleChange} />
            <Input color={textcolor} placeholder="Other Pose" name="pose_other" value={form.pose_other} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Mood & Styling --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Mood & Styling</Text>
          <Divider />
          <Grid templateColumns={["1fr", "repeat(2, 1fr)"]} gap={6} w="100%">
            <Input color={textcolor} placeholder="Mood (e.g. Cheerful, Relaxed)" name="mood" value={form.mood} onChange={handleChange} />
            <Input color={textcolor} placeholder="Lighting Preference (e.g. Golden Hour)" name="lighting_preference" value={form.lighting_preference} onChange={handleChange} />
            <Input color={textcolor} placeholder="Color Palette (e.g. Soft Pastels)" name="color_palette" value={form.color_palette} onChange={handleChange} />
            <Input color={textcolor} placeholder="Style Preference (e.g. Bright and Airy)" name="style_preference" value={form.style_preference} onChange={handleChange} />
          </Grid>
        </VStack>

        {/* --- Instructions --- */}
        <VStack align="start" spacing={4} mb={8}>
          <Text fontSize="xl" fontWeight="600">Instructions</Text>
          <Divider />
          <Textarea color={textcolor} placeholder="Human Instruction" name="human_instruction" value={form.human_instruction} onChange={handleChange} />
          <Textarea  color={textcolor} placeholder="Additional Instructions" name="additional_instructions" value={form.additional_instructions} onChange={handleChange} />
        </VStack>

        {/* --- Submit Button --- */}
        <HStack justify="flex-end">
          <Button colorScheme="blue" size="lg" px={10} onClick={handleSubmit}>
            Save Guideline
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
