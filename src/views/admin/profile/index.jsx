import {
  Box,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Flex,
  Spinner,
  useColorModeValue,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import React, { useEffect, useState, useCallback, startTransition } from "react";
import { useNavigate } from "react-router-dom";
import Projects from "views/admin/profile/components/Projects";
import GradientHeading from "./components/Heading";
import axiosInstance from "utils/AxiosInstance";

export default function Overview() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [displayEmail, setDisplayEmail] = useState("");

  const navigate = useNavigate();

  // ✅ Determine which user is active (safe parse)
  const getActiveUserData = useCallback(() => {
    try {
      const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
      const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = selectedUser?.user_id || mainUser?.user_id;
      const username = selectedUser?.username || mainUser?.username || "Unknown";
      return { userId, username };
    } catch (err) {
      console.error("Error parsing user data from localStorage", err);
      return { userId: null, username: "Unknown" };
    }
  }, []);

  const [activeUser, setActiveUser] = useState(getActiveUserData);

  // ✅ Fetch projects (with pagination and search)
  const fetchProjects = useCallback(
    async (pageNum = 1, search = searchTerm, userId = activeUser.userId) => {
      if (!userId) {
        console.error("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingPage(true);

        const res = await axiosInstance.get(
          `saved_projects/?user_id=${userId}&page=${pageNum}&project_name=${search}`
        );

        if (res.data.status === "success") {
          const { data, pagination } = res.data;
          startTransition(() => {
            setProjects(data || []);
            setTotalPages(pagination?.total_pages || 1);
            setTotalItems(pagination?.total_items || 0);
          });
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
        setLoadingPage(false);
      }
    },
    [activeUser.userId, searchTerm]
  );

  // ✅ Auto update when user changes in localStorage
  useEffect(() => {
    const updateUser = () => {
      const newUser = getActiveUserData();
      if (newUser.userId !== activeUser.userId) {
        setActiveUser(newUser);
        setProjects([]);
        setPage(1);
        fetchProjects(1, searchTerm, newUser.userId);
      }
      setDisplayEmail(newUser.username);
    };

    updateUser();

    // listen to changes in localStorage (other tabs)
    window.addEventListener("storage", updateUser);

    // also check periodically
    const interval = setInterval(updateUser, 2000);

    return () => {
      window.removeEventListener("storage", updateUser);
      clearInterval(interval);
    };
  }, [activeUser.userId, fetchProjects, getActiveUserData, searchTerm]);

  // ✅ Initial fetch
  useEffect(() => {
    if (activeUser.userId) fetchProjects(1);
  }, [activeUser.userId, fetchProjects]);

  // ✅ Search (debounced)
  useEffect(() => {
    const delay = setTimeout(() => {
      startTransition(() => {
        setPage(1);
        fetchProjects(1, searchTerm, activeUser.userId);
      });
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, activeUser.userId, fetchProjects]);

  // ✅ Page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      setPage(newPage);
      fetchProjects(newPage, searchTerm, activeUser.userId);
    });
  };

  // ✅ Render pagination buttons
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      buttons.push(
        <Button key={1} size="sm" variant="outline" onClick={() => handlePageChange(1)}>
          1
        </Button>
      );
      if (start > 2)
        buttons.push(
          <Text key="start-ellipsis" color="gray.500">
            ...
          </Text>
        );
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          colorScheme={i === page ? "blue" : "gray"}
          variant={i === page ? "solid" : "outline"}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1)
        buttons.push(
          <Text key="end-ellipsis" color="gray.500">
            ...
          </Text>
        );
      buttons.push(
        <Button
          key={totalPages}
          size="sm"
          variant="outline"
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header and Search */}
      <Grid templateColumns="1fr" mb="20px">
        <GradientHeading />

        <Flex
          justify="space-between"
          align="center"
          mt={6}
          flexDirection={{ base: "column", md: "row" }}
          gap={4}
        >


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

          <Button colorScheme="blue" onClick={() => navigate("/videocreate/createvideo")}>
            Generate Video
          </Button>
        </Flex>
      </Grid>

      {/* Projects Section */}
      <Grid templateColumns="1fr" gap="20px" mb="20px">
        {loading ? (
          <Flex justify="center" align="center" py={20}>
            <Spinner size="xl" />
          </Flex>
        ) : projects.length === 0 ? (
          <Flex direction="column" align="center" py={20}>
            <Text fontSize="lg" color="gray.500">
              No projects found
            </Text>
          </Flex>
        ) : (
          <>
            <Projects projects={projects} loading={loadingPage} />

            {/* Pagination */}
            <Flex justify="center" align="center" mt={6} direction="column" gap={3}>
              <Text fontSize="sm" color="gray.500">
                Showing page {page} of {totalPages} ({totalItems} projects)
              </Text>

              <HStack spacing={2}>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  isDisabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  aria-label="Previous"
                  size="sm"
                />
                {renderPageButtons()}
                <IconButton
                  icon={<ChevronRightIcon />}
                  isDisabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  aria-label="Next"
                  size="sm"
                />
              </HStack>
            </Flex>
          </>
        )}
      </Grid>
    </Box>
  );
}
