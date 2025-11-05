import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Grid,
  GridItem,
  Image,
  Text,
  Flex,
  useToast,
  useColorModeValue,
  Skeleton,
  Badge,
  Button,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";

const AssetsPage = () => {
  const toast = useToast();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  // ✅ Detect the current active user (either selected_user or main user)
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
  const activeUserId = selectedUser?.user_id || user?.user_id;

  // ✅ Keep displayEmail updated always
  useEffect(() => {
    const updateDisplayEmail = () => {
      const storedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
      const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
      setDisplayEmail(storedUser?.username || mainUser?.username || "Unknown");
    };

    updateDisplayEmail();
    const interval = setInterval(updateDisplayEmail, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch Assets API call
  const fetchAssets = useCallback(
    async (pageNumber = 1, customUserId = activeUserId) => {
      if (!customUserId || pageNumber > totalPages) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/assets_page?user_id=${customUserId}&page=${pageNumber}&search=${activeSearch}`
        );

        if (response.data.status === "success") {
          setAssets((prev) =>
            pageNumber === 1 ? response.data.data : [...prev, ...response.data.data]
          );
          setTotalPages(response.data.pagination.pages);
        } else {
          toast({
            title: "No Assets Found",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Something went wrong while fetching assets",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [activeUserId, activeSearch, totalPages, toast]
  );

  // ✅ Re-fetch when active user changes
  useEffect(() => {
    const updateActiveUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
      const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
      const newUserId = storedUser?.user_id || mainUser?.user_id;
      const newEmail = storedUser?.username || mainUser?.username || "Unknown";

      setDisplayEmail(newEmail);
      if (newUserId !== activeUserId) {
        setAssets([]);
        setPage(1);
        fetchAssets(1, newUserId);
      }
    };

    updateActiveUser();
    window.addEventListener("storage", updateActiveUser);
    const interval = setInterval(updateActiveUser, 2000);

    return () => {
      window.removeEventListener("storage", updateActiveUser);
      clearInterval(interval);
    };
  }, [activeUserId, fetchAssets]);

  // ✅ Initial fetch
  useEffect(() => {
    setAssets([]);
    setPage(1);
    if (activeUserId) fetchAssets(1);
  }, [activeUserId, activeSearch, fetchAssets]);

  // ✅ Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.offsetHeight;

      if (scrollTop + windowHeight >= docHeight - 100 && !loading && page < totalPages) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, totalPages]);

  useEffect(() => {
    if (page > 1) fetchAssets(page);
  }, [page, fetchAssets]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveSearch(value);
    setPage(1);
    setAssets([]);
  };

  const handleDownload = (url) => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    link.click();
  };

  return (
    <Box p={5} mt={20} minH="100vh" bg="transparent">
      {/* ✅ Header with Active Email */}
      <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={3}>
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Viewing assets for: <Text as="span" color="blue.500">{displayEmail}</Text>
        </Text>

        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <Input
            placeholder="Search by Project Name..."
            value={searchTerm}
            onChange={handleSearch}
            bg={useColorModeValue("gray.100", "navy.900")}
            color={useColorModeValue("gray.800", "white")}
            borderRadius="full"
            _placeholder={{ color: useColorModeValue("gray.500", "gray.300") }}
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputRightElement>
        </InputGroup>
      </Flex>

      {/* ✅ Assets Grid */}
      {assets.length === 0 && !loading ? (
        <Flex direction="column" align="center" justify="center" mt={10}>
          <Image
            src="https://cdni.iconscout.com/illustration/premium/thumb/employee-is-unable-to-find-sensitive-data-illustration-svg-download-png-8062127.png"
            alt="No assets found"
            maxW="300px"
            mb={5}
          />
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            No Assets Found
          </Text>
          <Text fontSize="md" color="gray.400">
            Try searching with a different project name
          </Text>
        </Flex>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
        >
          {assets.map((asset, index) => (
            <GridItem
              key={asset.creation_id + index}
              borderWidth="1px"
              borderRadius="md"
              overflow="hidden"
              p={3}
              bg={cardBg}
              shadow="md"
              transition="all 0.3s"
              _hover={{ transform: "scale(1.03)", shadow: "xl" }}
            >
              <Box position="relative" mb={3}>
                <Image
                  src={asset.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt={asset.product_name}
                  borderRadius="md"
                  objectFit="cover"
                  height="200px"
                  width="100%"
                  fallback={<Skeleton height="200px" width="100%" />}
                />
              </Box>

              <Text fontWeight="bold" color={textColor} noOfLines={1}>
                {asset.product_name}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Dimensions: {asset.video_dimensions} |{" "}
                <Badge
                  colorScheme={asset.status === "completed" ? "green" : asset.status === "failed" ? "red" : "yellow"}
                >
                  {asset.status}
                </Badge>
              </Text>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Created: {asset.created_at}
              </Text>

              <Flex justify="space-between">
                <Button
                  size="sm"
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  isDisabled={!asset.image_url}
                  onClick={() => handleDownload(asset.image_url)}
                >
                  Download
                </Button>
              </Flex>
            </GridItem>
          ))}

          {loading &&
            Array(4)
              .fill("")
              .map((_, i) => (
                <GridItem key={"skeleton" + i} borderRadius="md" overflow="hidden" bg={cardBg} shadow="md" p={3}>
                  <Skeleton height="200px" mb={3} borderRadius="md" />
                  <Skeleton height="20px" mb={2} width="80%" />
                  <Skeleton height="15px" mb={1} width="60%" />
                  <Skeleton height="15px" width="40%" />
                </GridItem>
              ))}
        </Grid>
      )}
    </Box>
  );
};

export default AssetsPage;
