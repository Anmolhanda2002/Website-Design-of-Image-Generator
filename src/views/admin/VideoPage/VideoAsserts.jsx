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
  Icon,
} from "@chakra-ui/react";
import { DownloadIcon, SearchIcon } from "@chakra-ui/icons";
import { FaPlayCircle } from "react-icons/fa";
import axiosInstance from "utils/AxiosInstance";

const VideosPage = () => {
  const toast = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [displayEmail, setDisplayEmail] = useState("");

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  // ✅ Determine which user is active
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");

  const activeUserId = selectedUser?.user_id || user?.user_id;

  // ✅ Update displayed email whenever localStorage changes
  // useEffect(() => {
  //   const updateDisplayEmail = () => {
  //     const storedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
  //     const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
  //     setDisplayEmail(storedUser?.username || mainUser?.username || "Unknown");
  //   };

  //   updateDisplayEmail();

  //   const interval = setInterval(updateDisplayEmail, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  const fetchVideos = useCallback(
  async (pageNumber = 1, customUserId = activeUserId) => {
    if (!customUserId || pageNumber > totalPages) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/videos_page?user_id=${customUserId}&page=${pageNumber}&search=${activeSearch}`
      );

      if (response.data.status === "success") {
        setVideos((prev) =>
          pageNumber === 1 ? response.data.data : [...prev, ...response.data.data]
        );
        setTotalPages(response.data.pagination.pages);
      } else {
        toast({
          title: "No Videos Found",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while fetching videos",
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


  useEffect(() => {
  const updateActiveUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
    const mainUser = JSON.parse(localStorage.getItem("user") || "{}");
    const newUserId = storedUser?.user_id || mainUser?.user_id;
    const newEmail = storedUser?.username || mainUser?.username || "Unknown";

    setDisplayEmail(newEmail);
    if (newUserId !== activeUserId) {
      setVideos([]); // reset videos
      setPage(1);
      fetchVideos(1, newUserId); // reload with new user
    }
  };

  // Trigger immediately
  updateActiveUser();

  // Listen for localStorage changes from anywhere
  window.addEventListener("storage", updateActiveUser);

  // Also run every 2s just in case (optional)
  const interval = setInterval(updateActiveUser, 2000);

  return () => {
    window.removeEventListener("storage", updateActiveUser);
    clearInterval(interval);
  };
}, [activeUserId, fetchVideos]);


  // ✅ Fetch videos



  useEffect(() => {
    setVideos([]);
    setPage(1);
    if (activeUserId) fetchVideos(1);
  }, [activeUserId, activeSearch, fetchVideos]);

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
    if (page > 1) fetchVideos(page);
  }, [page, fetchVideos]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setActiveSearch(value);
    setPage(1);
    setVideos([]);
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
      {/* ✅ Top Bar with Email */}
      <Flex
        justify="space-between"
        align="center"
        mb={5}
        flexWrap="wrap"
        gap={3}
      >
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Viewing videos for: <Text as="span" color="blue.500">{displayEmail}</Text>
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

      {/* ✅ Video Grid */}
      {videos.length === 0 && !loading ? (
        <Flex direction="column" align="center" justify="center" mt={10}>
          <Image
            src="https://cdni.iconscout.com/illustration/premium/thumb/employee-is-unable-to-find-sensitive-data-illustration-svg-download-png-8062127.png"
            alt="No videos found"
            maxW="300px"
            mb={5}
          />
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            No Videos Found
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
          {videos.map((video, index) => {
            const videoUrl =
              video.cloudinary_video_url ||
              video.processed_video_url ||
              video.manual_video_url;

            const thumbnail =
              video.image_urls && video.image_urls.length > 0
                ? video.image_urls[0]
                : "https://via.placeholder.com/300x200?text=No+Thumbnail";

            return (
              <GridItem
                key={video.creation_id + index}
                borderWidth="1px"
                borderRadius="md"
                overflow="hidden"
                p={3}
                bg={cardBg}
                shadow="md"
                transition="all 0.3s"
                _hover={{ transform: "scale(1.03)", shadow: "xl" }}
              >
                <Box
                  position="relative"
                  mb={3}
                  cursor={video.status === "completed" ? "pointer" : "not-allowed"}
                  onClick={() => video.status === "completed" && setSelectedVideo(video)}
                >
                  <Image
                    src={thumbnail}
                    alt={video.product_name}
                    width="100%"
                    height="200px"
                    borderRadius="8px"
                    objectFit="cover"
                  />
                  {video.status === "completed" && (
                    <Icon
                      as={FaPlayCircle}
                      boxSize={12}
                      color="white"
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      opacity={0.9}
                    />
                  )}
                </Box>

                <Text fontWeight="bold" color={textColor} noOfLines={1}>
                  {video.product_name}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Video Dimensions: {video.video_dimensions} |{" "}
                  <Badge
                    colorScheme={
                      video.status === "completed"
                        ? "green"
                        : video.status === "failed"
                        ? "red"
                        : "yellow"
                    }
                  >
                    {video.status}
                  </Badge>
                </Text>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  Created: {video.created_at}
                </Text>

                <Flex justify="space-between">
                  <Button
                    size="sm"
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    isDisabled={!videoUrl}
                    onClick={() => handleDownload(videoUrl)}
                  >
                    Download
                  </Button>
                </Flex>
              </GridItem>
            );
          })}

          {loading &&
            Array(4)
              .fill("")
              .map((_, i) => (
                <GridItem
                  key={"skeleton" + i}
                  borderRadius="md"
                  overflow="hidden"
                  bg={cardBg}
                  shadow="md"
                  p={3}
                >
                  <Skeleton height="200px" mb={3} borderRadius="md" />
                  <Skeleton height="20px" mb={2} width="80%" />
                  <Skeleton height="15px" mb={1} width="60%" />
                  <Skeleton height="15px" width="40%" />
                </GridItem>
              ))}
        </Grid>
      )}

      {/* ✅ Video Modal */}
      {selectedVideo && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.8)"
          zIndex="9999"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box maxW="80%" maxH="80%" bg="black" borderRadius="md" p={3}>
            <video
              key={selectedVideo.cloudinary_video_url}
              src={
                selectedVideo.cloudinary_video_url ||
                selectedVideo.processed_video_url ||
                selectedVideo.manual_video_url
              }
              controls
              autoPlay
              style={{ width: "100%", height: "70vh", borderRadius: "10px" }}
            />
            <Flex justify="flex-end" mt={3}>
              <Button onClick={() => setSelectedVideo(null)}>Close</Button>
            </Flex>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideosPage;
