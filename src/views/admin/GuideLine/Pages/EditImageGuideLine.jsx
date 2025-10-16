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
import { useParams } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";

export default function EditImageGuideline() {
  const { guideline_id } = useParams();
  const toast = useToast();

  const [choices, setChoices] = useState({});
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const cardBg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("black", "white");
  const textcolor = useColorModeValue("black","white")
  // ✅ Utility function for safe mapping
  const safeEntries = (obj) =>
    obj && typeof obj === "object" ? Object.entries(obj) : [];

  // ✅ Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const api_key = localStorage.getItem("api_key");
        if (!api_key) {
          toast({
            title: "Missing API Key",
            description: "Please login first.",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          return;
        }

        const [choicesRes, guidelineRes] = await Promise.all([
          axiosInstance.get("/get_image_guideline_choices"),
          axiosInstance.post("/factory_development_get_image_guideline/", {
            api_key,
            guideline_id,
          }),
        ]);

        const choicesData = choicesRes?.data?.data || {};
        const guidelineData =
          guidelineRes?.data?.data?.guidelines?.[0]?.summary || {};

        setChoices(choicesData);

        setForm({
          name: guidelineData.name || "",
          description: guidelineData.description || "",
          use_case: guidelineData.use_case_sector?.use_case || "",
          sector: guidelineData.use_case_sector?.sector || "",
          product_name: guidelineData.product?.name || "",
          product_info: guidelineData.product?.info || "",
          goal: guidelineData.goal?.primary_goal || "",
          goal_description: guidelineData.goal?.goal_description || "",
          goal_of_image: guidelineData.goal?.goal_of_image || "",
          main_focus_of_image: guidelineData.goal?.main_focus || "",
          model_ethnicity: guidelineData.model?.ethnicity || "",
          model_gender: guidelineData.model?.gender || "",
          model_built: guidelineData.model?.built || "",
          model_age_range: guidelineData.model?.age_range || "",
          model_personality_features:
            guidelineData.model?.personality_features || "",
          model_other_features: guidelineData.model?.other_features || "",
          environment_category: guidelineData.environment?.category || "",
          environment_interior: guidelineData.environment?.interior || "",
          environment_exterior: guidelineData.environment?.exterior || "",
          environment_lifestyle_editorial:
            guidelineData.environment?.lifestyle_editorial || "",
          environment_other: guidelineData.environment?.other || "",
          pose_category: guidelineData.pose?.category || "",
          pose_general: guidelineData.pose?.general || "",
          pose_yoga: guidelineData.pose?.yoga || "",
          pose_activity: guidelineData.pose?.activity || "",
          pose_other: guidelineData.pose?.other || "",
          mood: guidelineData.mood || "",
          lighting_preference: guidelineData.styling?.lighting || "",
          color_palette: guidelineData.styling?.color_palette || "",
          style_preference: guidelineData.styling?.style || "",
          human_instruction: guidelineData.instructions?.human_instruction || "",
          additional_instructions:
            guidelineData.instructions?.additional_instructions || "",
        });
      } catch (error) {
        console.error("Error fetching guideline:", error);
        toast({
          title: "Error loading guideline",
          description: "Could not load guideline data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideline_id, toast]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ✅ Update API Call
  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      const api_key = localStorage.getItem("api_key");

      if (!api_key) {
        toast({
          title: "Missing API Key",
          description: "Please login or add your API key first.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const payload = {
        api_key,
        guideline_id,
        ...form, // All fields directly from form
      };

      console.log("📝 Update Payload:", payload);

      const { data } = await axiosInstance.post(
        "/factory_development_update_image_guideline/",
        payload
      );

      if (data.status === "success") {
        toast({
          title: "✅ Guideline Updated Successfully",
          description: "Your changes have been saved.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Update Failed ❌",
          description: data.message || "Something went wrong.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error updating guideline:", error);
      toast({
        title: "Update Failed ❌",
        description: "Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Loading spinner
  if (loading)
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );

  // ✅ Section generator
  const sections = [
    {
      title: "Basic Information",
      fields: [
        { type: "input", name: "name", placeholder: "Guideline Name" },
        { type: "textarea", name: "description", placeholder: "Description" },
        {
          type: "select",
          name: "use_case",
          placeholder: "Select Use Case",
          choices: choices.use_case_choices,
        },
        {
          type: "select",
          name: "sector",
          placeholder: "Select Sector",
          choices: choices.sector_choices,
        },
      ],
    },
    {
      title: "Product Information",
      fields: [
        { type: "input", name: "product_name", placeholder: "Product Name" },
        { type: "textarea", name: "product_info", placeholder: "Product Info" },
      ],
    },
    {
      title: "Goals & Objectives",
      fields: [
        {
          type: "select",
          name: "goal",
          placeholder: "Select Goal",
          choices: choices.goal_choices,
        },
        {
          type: "textarea",
          name: "goal_description",
          placeholder: "Goal Description",
        },
        { type: "input", name: "goal_of_image", placeholder: "Goal of Image" },
        {
          type: "input",
          name: "main_focus_of_image",
          placeholder: "Main Focus of Image",
        },
      ],
    },
    {
      title: "Model Details",
      fields: [
        {
          type: "select",
          name: "model_ethnicity",
          placeholder: "Ethnicity",
          choices: choices.ethnicity_choices,
        },
        {
          type: "select",
          name: "model_gender",
          placeholder: "Gender",
          choices: choices.gender_choices,
        },
        {
          type: "select",
          name: "model_built",
          placeholder: "Body Type",
          choices: choices.built_choices,
        },
        {
          type: "select",
          name: "model_age_range",
          placeholder: "Age Range",
          choices: choices.age_choices,
        },
        {
          type: "input",
          name: "model_personality_features",
          placeholder: "Personality Features",
        },
        {
          type: "input",
          name: "model_other_features",
          placeholder: "Other Features",
        },
      ],
    },
    {
      title: "Environment",
      fields: [
        {
          type: "select",
          name: "environment_category",
          placeholder: "Category",
          choices: choices.environment_choices,
        },
        { type: "input", name: "environment_interior", placeholder: "Interior" },
        { type: "input", name: "environment_exterior", placeholder: "Exterior" },
        {
          type: "input",
          name: "environment_lifestyle_editorial",
          placeholder: "Lifestyle/Editorial",
        },
        { type: "input", name: "environment_other", placeholder: "Other" },
      ],
    },
    {
      title: "Pose Details",
      fields: [
        {
          type: "select",
          name: "pose_category",
          placeholder: "Pose Category",
          choices: choices.pose_category_choices,
        },
        { type: "input", name: "pose_general", placeholder: "General Pose" },
        { type: "input", name: "pose_yoga", placeholder: "Yoga Pose" },
        { type: "input", name: "pose_activity", placeholder: "Activity Pose" },
        { type: "input", name: "pose_other", placeholder: "Other Pose" },
      ],
    },
    {
      title: "Mood & Styling",
      fields: [
        { type: "input", name: "mood", placeholder: "Mood" },
        {
          type: "input",
          name: "lighting_preference",
          placeholder: "Lighting Preference",
        },
        { type: "input", name: "color_palette", placeholder: "Color Palette" },
        {
          type: "input",
          name: "style_preference",
          placeholder: "Style Preference",
        },
      ],
    },
    {
      title: "Instructions",
      fields: [
        {
          type: "textarea",
          name: "human_instruction",
          placeholder: "Human Instruction",
        },
        {
          type: "textarea",
          name: "additional_instructions",
          placeholder: "Additional Instructions",
        },
      ],
    },
  ];

  // ✅ Render UI
  return (
<Box
  py={[4, 10, 20]}

  minH="100vh"
  display="flex"
  justifyContent="center"
  alignItems="flex-start"
>
  <Box
    borderRadius="2xl"
    p={[4, 4, 8]}
    w="100%"
    maxW="1200px"
    overflowY="auto"
    sx={{
      "&::-webkit-scrollbar": { width: "6px" },
      "&::-webkit-scrollbar-thumb": {
        background: "#cbd5e0",
        borderRadius: "full",
      },
    }}
  >
    <Heading
      size="xl"
      mb={12}
      textAlign="center"
      color="blue.600"
      letterSpacing="wide"
    >
      Edit Image Guideline
    </Heading>

    {sections.map((section, index) => (
      <VStack
        key={index}
        align="stretch"
        spacing={6}
        mb={12}
        borderRadius="lg"
      >
        <Text fontSize={["lg", "xl"]} fontWeight="600" color="blue.500">
          {section.title}
        </Text>
        <Divider borderColor="blue.200" />

        <Grid
  templateColumns={["1fr", null, "1fr 1fr"]} // 1 column on mobile, 2 on md+
  gap={[4, 6]}
  alignItems="start"
>
  {section.fields.map((field) => {
    if (field.type === "input") {
      return (
        <Input
          key={field.name}
          name={field.name}
          value={form[field.name] || ""}
          onChange={handleChange}
          placeholder={field.placeholder}
          size="lg"
          color={textcolor}
        />
      );
    }
    if (field.type === "textarea") {
      return (
        <Textarea
          key={field.name}
          name={field.name}
          value={form[field.name] || ""}
          onChange={handleChange}
          placeholder={field.placeholder}
          size="lg"
          minH="120px"
        />
      );
    }
    if (field.type === "select") {
      return (
        <Select
          key={field.name}
          name={field.name}
          value={form[field.name] || ""}
          onChange={handleChange}
          placeholder={field.placeholder}
          size="lg"
        >
          {safeEntries(field.choices).map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      );
    }
    return null;
  })}
</Grid>

      </VStack>
    ))}

    <HStack justify="flex-end" mt={8}>
      <Button
        colorScheme="blue"
        size="lg"
        px={10}
        onClick={handleUpdate}
        isLoading={submitting}
        loadingText="Updating..."
        borderRadius="full"
      >
        💾 Update Guideline
      </Button>
    </HStack>
  </Box>
</Box>


  );
}
