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

  // ✅ Get active user safely
  const getActiveUserData = useCallback(() => {
    try {
      const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
      const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = selectedUser?.user_id || mainUser?.user_id;
      const username = selectedUser?.username || mainUser?.username || "Unknown";
      return { userId, username };
    } catch {
      return { userId: null, username: "Unknown" };
    }
  }, []);

  const [activeUser, setActiveUser] = useState(getActiveUserData);

  // ✅ Fetch projects (with pagination and search)
  const fetchProjects = useCallback(
    async (pageNum = 1, search = searchTerm, userId = activeUser.userId) => {
      if (!userId) return;
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
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
        setLoadingPage(false);
      }
    },
    [activeUser.userId, searchTerm]
  );

  // ✅ Listen for user change
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
    window.addEventListener("storage", updateUser);
    const interval = setInterval(updateUser, 2000);
    return () => {
      window.removeEventListener("storage", updateUser);
      clearInterval(interval);
    };
  }, [activeUser.userId, fetchProjects, getActiveUserData, searchTerm]);

  useEffect(() => {
    if (activeUser.userId) fetchProjects(1);
  }, [activeUser.userId, fetchProjects]);

  // ✅ Debounced Search
  useEffect(() => {
    const delay = setTimeout(() => {
      startTransition(() => {
        setPage(1);
        fetchProjects(1, searchTerm, activeUser.userId);
      });
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, activeUser.userId, fetchProjects]);

  // ✅ Pagination logic
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    startTransition(() => {
      setPage(newPage);
      fetchProjects(newPage, searchTerm, activeUser.userId);
    });
  };

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      buttons.push(
        <Button key={1} size="sm" variant="outline" onClick={() => handlePageChange(1)}>1</Button>
      );
      if (start > 2) buttons.push(<Text key="s-ellipsis">...</Text>);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <Button
          key={i}
          size="sm"
          colorScheme={i === page ? "blue" : "gray"}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) buttons.push(<Text key="e-ellipsis">...</Text>);
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
    const textcolor = useColorModeValue("black","white")
const bg=useColorModeValue("gray.100", "navy.900")
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Grid templateColumns="1fr" mb="20px">
        <GradientHeading />
        <Flex justify="space-between" align="center" mt={6} flexWrap="wrap" gap={4}>
          <InputGroup maxW={{ base: "100%", md: "400px" }}>
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bg}
              borderRadius="full"
              color={textcolor}
_placeholder={{color:textcolor}}
            />
            <InputRightElement>
              <SearchIcon color="gray.400" />
            </InputRightElement>
          </InputGroup>

          <Button colorScheme="blue" onClick={() => navigate("/videocreate/createvideo")}>
            Generate Video
          </Button>
        </Flex>
      </Grid>

      {loading ? (
        <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
      ) : projects.length === 0 ? (
        <Flex justify="center" py={20}><Text>No projects found</Text></Flex>
      ) : (
        <>
          <Projects projects={projects} loading={loadingPage} userId={activeUser.userId} />
          <Flex justify="center" align="center" mt={6} direction="column" gap={3}>
            <Text fontSize="sm" color="gray.500">
              Page {page} of {totalPages} ({totalItems} total)
            </Text>
            <HStack spacing={2}>
              <IconButton
                icon={<ChevronLeftIcon />}
                isDisabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              />
              {renderPageButtons()}
              <IconButton
                icon={<ChevronRightIcon />}
                isDisabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
              />
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
}
