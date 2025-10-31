import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Text,
  useToast,
  Spinner,
  useColorModeValue,
  Circle,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useParams } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";

// Import child components
import PersonalInfo from "./pages/PersonalInfo";
import ImageGuideline from "./pages/ImageGuideLine";
import BrandGuideline from "./pages/BrandGuideLine";

const EditUser = () => {
  const { id } = useParams();
  const toast = useToast();

  // Theme
  const cardBg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("gray.700", "white");
  const textSecondary = useColorModeValue("gray.500", "gray.400");

  // State
  const [profilePic] = useState("https://i.pravatar.cc/150?img=5");
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  // Guidelines
  const [imageGuideline, setImageGuideline] = useState("");
  const [brandGuideline, setBrandGuideline] = useState("");

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/view_user_accounts/?user_id=${id}`);
        const { status, user } = response.data;

        if (status === "success" && user) {
          const { username, first_name, last_name, email, is_approved } = user;

          setFormData({
            username: username || "",
            first_name: first_name || "",
            last_name: last_name || "",
            email: email || "",
          });

          setIsApproved(is_approved || false);
        } else {
          toast({
            title: "Error loading profile",
            description: "Failed to load user data.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error loading profile",
          description: error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id, toast]);

  // Save Profile
  const handleSave = async () => {
    try {
      const payload = { user_id: id, ...formData };
      const response = await axiosInstance.patch("/user_profile_update/", payload);

      if (response.data.status === "success") {
        toast({
          title: "Profile updated",
          description: response.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error?.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Approve User
  const handleApprove = async () => {
    try {
      const res = await axiosInstance.post("/factory_development/approve/", {
        user_id: id,
      });
      if (res.data.status === "success") {
        setIsApproved(true);
        toast({
          title: "User approved",
          description: "The user has been successfully approved.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Approval failed",
        description: error?.response?.data?.message || "Unable to approve user.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Flex w="100%" h="100%" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex w="100%" h="100%" p={6} justify="center" mt="20">
      <Box w="100%" maxW="100%" bg={cardBg} p={8} borderRadius="30px" boxShadow="xl">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={8}>
          <Flex align="center" gap={4}>
            <Box position="relative">
              <Avatar size="xl" src={profilePic} />
              <Box position="absolute" bottom="4px" right="-2%">
                {isApproved ? (
                  <CheckCircleIcon color="green.400" boxSize={6} />
                ) : (
                  <Circle size="22px" bg="red.400" />
                )}
              </Box>
            </Box>
            <Box>
              <Text fontWeight="bold" fontSize="lg" color={textColor}>
                {formData.username}
              </Text>
              <Text fontSize="sm" color={textSecondary}>
                {formData.email}
              </Text>
            </Box>
          </Flex>
          <Button colorScheme="blue" borderRadius="md" onClick={handleSave}>
            Save
          </Button>
        </Flex>

        {/* Approval Section */}
        {!isApproved && (
          <Box mb={6}>
            <Badge colorScheme="red" fontSize="sm" borderRadius="md" px={3} py={1}>
              This user is not approved
            </Badge>
            <Flex mt={3} gap={3}>
              <Button colorScheme="green" size="sm" onClick={handleApprove}>
                Approve
              </Button>
              <Button colorScheme="gray" size="sm" variant="outline">
                Cancel
              </Button>
            </Flex>
          </Box>
        )}

        {/* Tabs */}
        <Tabs variant="enclosed-colored" colorScheme="blue" mt={6}>
          <TabList>
            <Tab>Personal Info</Tab>
            <Tab>Image Guideline</Tab>
            <Tab>Brand Guideline</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <PersonalInfo formData={formData} setFormData={setFormData} />
            </TabPanel>

            <TabPanel>
              <ImageGuideline
                imageGuideline={imageGuideline}
                setImageGuideline={setImageGuideline}
              />
            </TabPanel>

            <TabPanel>
              <BrandGuideline
                brandGuideline={brandGuideline}
                setBrandGuideline={setBrandGuideline}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default EditUser;
