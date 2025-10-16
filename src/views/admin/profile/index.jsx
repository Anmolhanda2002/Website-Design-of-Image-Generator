import {
  Box,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import React, { useEffect, useState , startTransition } from "react";
import { useNavigate } from "react-router-dom";

import Projects from "views/admin/profile/components/Projects";
import GradientHeading from "./components/Heading";
import axiosInstance from "utils/AxiosInstance";

import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/avatars/avatar4.png";

export default function Overview() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

    const handleClick = () => {
    startTransition(() => {
      navigate("/videocreate/createvideo");
    });
  };
  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?.user_id;

        if (!userId) {
          console.error("User ID not found in localStorage");
          setLoading(false);
          return;
        }

        const res = await axiosInstance.get(
          `saved_projects/?user_id=${userId}&page=1&project_name=${searchTerm}`
        );

        if (res.data.status === "success") {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchTerm]);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Heading + Search + Button */}
      <Grid templateColumns="1fr" mb="20px">
        <GradientHeading />

        <Flex
          justify="space-between"
          align="center"

          mt={6}
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
        >
          {/* Search Bar */}
          <InputGroup maxW={{ base: "100%", md: "400px" }}>
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue("gray.100", "navy.900")}
  color={useColorModeValue("gray.800", "white")}
  borderRadius="full"
  _placeholder={{ color: useColorModeValue("gray.500", "gray.300") }}
            />
            <InputRightElement children={<SearchIcon color="gray.400" />} />
          </InputGroup>

          {/* Generate Video Button */}
          <Button
            colorScheme="blue"
                 onClick={handleClick}

            w={{ base: "100%", md: "auto" }}
          >
            Generate Video
          </Button>
        </Flex>
      </Grid>

      {/* Projects List */}
      <Grid templateColumns="1fr" gap={{ base: "20px", xl: "20px" }} mb="20px">
        <Projects projects={projects} loading={loading} />
      </Grid>
    </Box>
  );
}
