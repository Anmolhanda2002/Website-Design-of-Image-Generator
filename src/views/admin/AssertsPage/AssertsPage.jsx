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

  // Card color remains same in dark mode
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.user_id;

  const fetchAssets = useCallback(
    async (pageNumber = 1) => {
      if (!userId || pageNumber > totalPages) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/assets_page?user_id=${userId}&page=${pageNumber}&search=${activeSearch}`
        );

        if (response.data.status === "success") {
          setAssets((prev) => [...prev, ...response.data.data]);
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
    [userId, activeSearch, totalPages, toast]
  );

  useEffect(() => {
    fetchAssets(page);
  }, [fetchAssets, page]);

  // Infinite scroll
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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveSearch(value);
    setPage(1);
    setAssets([]); // reset assets for new search
  };

  const handleDownload = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop();
    link.click();
  };

  return (
    <Box p={5} mt={20} minH="100vh" bg="transparent">
      {/* Header */}
      <Flex justify="flex-end" align="center" mb={5} flexWrap="wrap">
        <InputGroup maxW={{ base: "100%", md: "300px" }}>
          <Input
            placeholder="Search by Project Name..."
            value={searchTerm}
            onChange={handleSearch}
            bg="navy.900"
            color="white"
            borderRadius="full"
            _placeholder={{ color: "gray.300" }}
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputRightElement>
        </InputGroup>
      </Flex>

      {/* Assets Grid */}
      {assets.length === 0 && !loading ? (
        <Flex direction="column" align="center" justify="center" mt={20}>
          <Image
            src="https://undraw.co/api/illustrations/empty.svg" // Replace with your illustration
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
          templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
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
                  src={asset.image_url}
                  alt={asset.product_name}
                  borderRadius="md"
                  objectFit="cover"
                  height="200px"
                  width="100%"
                  fallback={<Skeleton height="200px" width="100%" />}
                  filter="brightness(0.8)"
                  transition="filter 0.3s"
                  onLoad={(e) => (e.target.style.filter = "brightness(1)")}
                />
              </Box>

              <Text fontWeight="bold" color={textColor} noOfLines={1}>
                {asset.product_name}
              </Text>
              <Text fontSize="sm" color="gray.400">
                Video Dimensions: {asset.video_dimensions} |{" "}
                <Badge colorScheme={asset.status === "completed" ? "green" : "yellow"}>
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
