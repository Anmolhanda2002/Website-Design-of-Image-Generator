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
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Heading,
  Divider,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";

// Child components
import PersonalInfo from "./pages/PersonalInfo";
import ImageGuideline from "../GuideLine/Index";
import VideoGuideline from "../VideoGuideLine/Index";

const EditUser = () => {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
  });

  const [profilePic] = useState("https://i.pravatar.cc/150?img=11");

  // ✅ Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/view_user_accounts/?user_id=${id}`);
        const { status, user } = res.data;

        if (status === "success" && user) {
          setFormData({
            username: user.username || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
          });
          setIsApproved(user.is_approved || false);
        } else {
          toast({
            title: "Error loading user",
            description: "No user data found.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: "Failed to fetch user",
          description: err.response?.data?.message || "Please try again later.",
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

  // ✅ Update profile
  const handleSave = async () => {
    try {
      const payload = { user_id: id, ...formData };
      const res = await axiosInstance.patch("/user_profile_update/", payload);

      if (res.data.status === "success") {
        toast({
          title: "Profile updated successfully",
          description: res.data.message,
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Something went wrong",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  // ✅ Approve user
  const handleApprove = async () => {
    try {
      const res = await axiosInstance.post("/factory_development/approve/", {
        user_id: id,
      });
      if (res.data.status === "success") {
        setIsApproved(true);
        toast({
          title: "User approved",
          description: "This user has been approved successfully.",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Approval failed",
        description: err.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  // ✅ Login as this user (Admin Impersonation)
// ✅ Login as user (Only visible for Super Admin)
const handleLoginAsUser = async () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser || !currentUser.roles?.includes("SuperAdmin")) {
      toast({
        title: "Access Denied",
        description: "Only Super Admins can log in as another user.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const res = await axiosInstance.post("/auth/super_admin/admin/login/", {
      email: formData.email,
      user_id: id,
    });

    if (res.data.status === "success" && res.data.data) {
      const { access_token, refresh_token, user } = res.data.data;

      // ✅ Save tokens and user info
      localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast({
        title: "Login successful",
        description: `You are now logged in as ${user?.username || "User"}`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });

      // ✅ Redirect and reload to apply new tokens
      setTimeout(() => {
        navigate("/admin/default");
        window.location.reload();
      }, 1000);
    } else {
      toast({
        title: "Login failed",
        description: "Unexpected response from server.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  } catch (err) {
    toast({
      title: "Login failed",
      description: err.response?.data?.message || "Something went wrong.",
      status: "error",
      duration: 2500,
      isClosable: true,
    });
  }
};


  if (loading) {
    return (
      <Flex w="100%" h="80vh" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" mt={{ base: 20, md: 20 }} minH="100vh">
      {/* Profile Card */}
      <Box
        w="100%"
        maxW="1000px"
        bg={cardBg}
        borderRadius="lg"
        boxShadow="md"
        p={{ base: 5, md: 8 }}
        mb={8}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "center" }}
          gap={6}
        >
          <Flex align="center" gap={5} direction={{ base: "column", sm: "row" }}>
            <Avatar size="xl" src={profilePic} name={formData.username} />
            <Box textAlign={{ base: "center", sm: "left" }}>
              <Heading size="md" color={textColor}>
                {formData.username || "User"}
              </Heading>
              <Text fontSize="sm" color={subTextColor}>
                {formData.email}
              </Text>
              <Badge
                colorScheme={isApproved ? "green" : "red"}
                mt={2}
                px={2}
                borderRadius="md"
              >
                {isApproved ? "Approved" : "Not Approved"}
              </Badge>
            </Box>
          </Flex>

          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={3}
            w={{ base: "100%", md: "auto" }}
          >
            {!isApproved && (
              <Button colorScheme="green" onClick={handleApprove}>
                Approve
              </Button>
            )}
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
{JSON.parse(localStorage.getItem("user"))?.roles?.includes("SuperAdmin") && (
  <Button colorScheme="purple" onClick={handleLoginAsUser}>
    Login as User
  </Button>
)}
          </Stack>
        </Flex>
      </Box>

      {/* Tabs Section */}
      <Box
        w="100%"
        maxW="1000px"
        bg={cardBg}
        borderRadius="lg"
        boxShadow="md"
        p={{ base: 4, md: 6 }}
      >
        <Tabs isFitted variant="enclosed" colorScheme="blue">
          <TabList mb="1em" borderColor={borderColor}>
            <Tab fontWeight="500">Personal Info</Tab>
            <Tab fontWeight="500">Image Guideline</Tab>
            <Tab fontWeight="500">Video Guideline</Tab>
          </TabList>

          <Divider mb={4} />

          <TabPanels>
            <TabPanel p={0}>
              <PersonalInfo formData={formData} setFormData={setFormData} />
            </TabPanel>
            <TabPanel p={0}>
              <ImageGuideline userId={id} />
            </TabPanel>
            <TabPanel p={0}>
              <VideoGuideline userId={id} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default EditUser;
