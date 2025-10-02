import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Input,
  Text,
  IconButton,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import axiosInstance from "utils/AxiosInstance"; // your configured axios instance

const ProfileSettings = () => {
  // Theme values
  const cardBg = useColorModeValue("white", "navy.700");
  const textColor = useColorModeValue("gray.700", "white");
  const textSecondary = useColorModeValue("gray.500", "gray.400");

  // ✅ Input colors defined once (fix hooks error)
  const inputBg = useColorModeValue("white", "navy.900");
  const inputColor = useColorModeValue("gray.800", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.300");

  const toast = useToast();
  const fileInputRef = useRef(null);

  // LocalStorage User
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser?.user_id;

  // State
  const [profilePic, setProfilePic] = useState(
    "https://i.pravatar.cc/150?img=5"
  );
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          `/my_account_info?user_id=${userId}`
        );
        if (response.data.status === "success") {
          const { username, first_name, last_name, email } = response.data.data;
          setFormData({ username, first_name, last_name, email });
        }
      } catch (error) {
        toast({
          title: "Failed to load profile",
          description:
            error?.response?.data?.message || "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId, toast]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Profile Picture Upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Save Profile (PATCH API Call)
  const handleSave = async () => {
    try {
      const payload = {
        user_id: userId,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      const response = await axiosInstance.patch(
        "/user_profile_update/",
        payload
      );

      if (response.data.status === "success") {
        toast({
          title: "Profile updated",
          description: response.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Update localStorage with latest values
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: error?.response?.data?.message || "Something went wrong",
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
      <Box
        w="100%"
        maxW="100%"
        bg={cardBg}
        p={8}
        borderRadius="30px"
        boxShadow="xl"
      >
        {/* Profile Header */}
        <Flex align="center" justify="space-between" mb={8}>
          <Flex align="center" gap={4}>
            <Box position="relative">
              <Avatar size="xl" src={profilePic} />
              <IconButton
                aria-label="Upload Profile"
                icon={<FiCamera />}
                size="sm"
                position="absolute"
                bottom="0"
                right="0"
                borderRadius="full"
                bg="blue.500"
                color="white"
                onClick={() => fileInputRef.current.click()}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleFileChange}
              />
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

        {/* Form Fields */}
        <Flex wrap="wrap" gap={6}>
          {/* Username */}
          <Box flex="1" minW="250px">
            <Text fontSize="sm" color={textSecondary} mb={1}>
              Username
            </Text>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              color={inputColor}
              bg={inputBg}
              _placeholder={{ color: placeholderColor }}
            />
          </Box>

          {/* First Name */}
          <Box flex="1" minW="250px">
            <Text fontSize="sm" color={textSecondary} mb={1}>
              First Name
            </Text>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter first name"
              color={inputColor}
              bg={inputBg}
              _placeholder={{ color: placeholderColor }}
            />
          </Box>

          {/* Last Name */}
          <Box flex="1" minW="250px">
            <Text fontSize="sm" color={textSecondary} mb={1}>
              Last Name
            </Text>
            <Input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter last name"
              color={inputColor}
              bg={inputBg}
              _placeholder={{ color: placeholderColor }}
            />
          </Box>

          {/* Email */}
          <Box flex="1" minW="250px">
            <Text fontSize="sm" color={textSecondary} mb={1}>
              Email
            </Text>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              color={inputColor}
              bg={inputBg}
              _placeholder={{ color: placeholderColor }}
            />
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ProfileSettings;
