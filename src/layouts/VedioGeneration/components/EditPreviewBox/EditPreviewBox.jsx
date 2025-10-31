import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Image,
  Text,
  Checkbox,
  Button,
  Select,
  InputGroup,
  Input,
  InputRightElement,
  Icon,
  useToast,
  Spinner,
  Badge,
  useColorModeValue,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaPlayCircle } from "react-icons/fa";
import axiosInstance from "utils/AxiosInstance";

const POLL_INTERVAL = 10000;

const VideoSelectorPage = ({setActiveTab,setclone,setclonecreationid}) => {
  const [videos, setVideos] = useState([]);
const [isPlaying, setIsPlaying] = useState(false);
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transitionEffect, setTransitionEffect] = useState("sequential");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.user_id;

  const selectBg = useColorModeValue("gray.100", "navy.800");
;
const inputBg = useColorModeValue("gray.100", "gray.700");
const borderColor = useColorModeValue("gray.200", "gray.600");
  // ✅ Full transition effect list
  const transitionEffects = [
    "none",
    "fade",
    "dissolve",
    "slide",
    "slideright",
    "slideleft",
    "slideup",
    "slidedown",
    "zoomin",
    "zoomout",
    "wiperight",
    "wipeleft",
    "wipeup",
    "wipedown",
    "fadeblack",
    "fadewhite",
    "radial",
    "circlecrop",
    "rectcrop",
    "smoothleft",
    "smoothright",
    "distance",
    "dis_rot",
    "sequence",
    "sequential",
  ];

  // ✅ Fetch videos with pagination
  const fetchVideos = useCallback(
    async (pageNum = 1, search = "") => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/videos_page/?user_id=${userId}&page=${pageNum}&search=${search}`
        );

        if (res.data.status === "success") {
          const newVideos = res.data.data || [];
          const pages = res.data.pagination?.pages || 1;
          setVideos((prev) => (pageNum === 1 ? newVideos : [...prev, ...newVideos]));
          setTotalPages(pages);
        } else {
          toast({ title: "No videos found", status: "info" });
        }
      } catch (err) {
        toast({ title: "Error fetching videos", status: "error" });
      } finally {
        setLoading(false);
      }
    },
    [userId, toast]
  );

  // ✅ Initial & search-triggered load
  useEffect(() => {
    setVideos([]);
    setPage(1);
    fetchVideos(1, searchTerm);
  }, [searchTerm, fetchVideos]);

  // ✅ Fetch when page changes
  useEffect(() => {
    fetchVideos(page, searchTerm);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchVideos, searchTerm]);

  // ✅ Toggle selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast({ title: "Max 4 videos allowed", status: "warning" });
        return prev;
      }
      return [...prev, id];
    });
  };

  // ✅ Create combined video
  const handleCreateVideo = async () => {
    if (selected.length < 2) {
      toast({ title: "Select at least 2 videos", status: "warning" });
      return;
    }

    try {
      setCreating(true);
      const payload = {
        key: "HYG-EAE6D1FA3895EB67-8C69",
        creation_ids: selected,
        transition_effect: transitionEffect,
      };

      const res = await axiosInstance.post(`/factory_development_combined_video/`, payload);
      const data = res.data?.data;

      if (res.data.success && data) {
        toast({ title: res.data.message, status: "success" });
        setProcessing(true);
        setGeneratedVideo({ status: "processing", ...data });
        pollStatus(data.status_check_url);
      } else {
        toast({ title: "Video creation failed", status: "error" });
      }
    } catch (err) {
      toast({ title: "Error creating video", status: "error" });
    } finally {
      setCreating(false);
    }
  };

  // ✅ Polling for status
  const pollStatus = (url) => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(url);
        const videoData = res.data?.data;
        if (videoData?.status === "completed" && videoData?.final_video_url) {
          clearInterval(interval);
          toast({ title: "Video ready!", status: "success" });
          setGeneratedVideo(videoData);
          setProcessing(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL);
  };

  // ✅ Manual QC
  const handleQC = async (action) => {
    if (!generatedVideo?.creation_id) {
      toast({ title: "No creation ID found", status: "error" });
      return;
    }

    try {
      const payload = {
        creation_id: generatedVideo.creation_id,
        manual_qc: action,
      };
      const res = await axiosInstance.post(`/manual_qc_video/`, payload);

      if (res.data) {
        toast({
          title: `Video ${action === "accept" ? "accepted" : "sent for recreate"}`,
          status: "success",
        });
        setGeneratedVideo(null);
        setSelected([]);
      }

    } catch (err) {
      toast({ title: "Error submitting QC", status: "error" });
    }
  };

  const openPreview = (e, url) => {
    e.stopPropagation();
    setPreviewVideo(url);
    setIsPreviewOpen(true);
  };

  return (
    <Box p={6} mt={20} minH="100vh" bg="transparent">
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Heading fontSize="2xl" color={textColor}>
          🎬 Combine Your Videos
        </Heading>
    <Flex gap={3} align="center">
<Select
  value={transitionEffect}
  onChange={(e) => setTransitionEffect(e.target.value)}
  maxW="220px"
  size="sm"
  borderRadius="full"
  bg={selectBg}
  sx={{
    option: {
      fontSize: "sm",
      padding: "4px 8px",
    },
  }}
>
  {transitionEffects.map((effect) => (
    <option key={effect} value={effect}>
      {effect}
    </option>
  ))}
</Select>


  <Button
    colorScheme="blue"
    borderRadius="full"
    px={6} // proper horizontal padding
    py={2} // vertical padding for balanced height
    fontSize="sm"
    isLoading={creating}
    onClick={handleCreateVideo}
  >
    Create Video
  </Button>
</Flex>

      </Flex>

      {/* Search */}
      <InputGroup mb={6} maxW="350px">
        <Input
          placeholder="Search by project or creation ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg={useColorModeValue("gray.100", "gray.700")}
          borderRadius="full"
        />
        <InputRightElement>
          <SearchIcon color="gray.400" />
        </InputRightElement>
      </InputGroup>

      {/* Video Grid */}
      {!processing && !generatedVideo ? (
        <>
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            }}
            gap={5}
          >
            {videos.map((video) => {
              const videoUrl =
                video.cloudinary_video_url ||
                video.processed_video_url ||
                video.manual_video_url;
              const thumbnail =
                video.image_urls?.[0] ||
                "https://via.placeholder.com/300x200?text=No+Thumbnail";
              const isSelected = selected.includes(video.creation_id);

              return (
                <GridItem
                  key={video.creation_id}
                  position="relative"
                  bg={cardBg}
                  borderRadius="xl"
                  overflow="hidden"
                  p={3}
                  shadow="md"
                  border="2px solid"
                  borderColor={isSelected ? "blue.400" :selectBg}
                  cursor="pointer"
                  onClick={() => toggleSelect(video.creation_id)}
                  transition="0.2s"
                  _hover={{ transform: "scale(1.02)" }}
                >
                  {/* ✅ Checkbox always visible */}
                  <Checkbox
                    position="absolute"
                    top={3}
                    left={3}
                    colorScheme="blue"
                    isChecked={isSelected}
                    pointerEvents="none"
                    size="lg"
                  />

                  <Box position="relative" mb={2}>
                    <Image
                      src={thumbnail}
                      alt={video.product_name || "Video"}
                      borderRadius="md"
                      objectFit="cover"
                      height="180px"
                      width="100%"
                    />
                    <Icon
                      as={FaPlayCircle}
                      boxSize={10}
                      color="white"
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                      cursor="pointer"
                      onClick={(e) => openPreview(e, videoUrl)}
                    />
                  </Box>

                  <Text fontWeight="bold" noOfLines={1}>
                    {video.product_name || "Untitled Video"}
                  </Text>
                  <Text fontSize="sm" color="gray.400" mb={1}>
                    ID: {video.creation_id}
                  </Text>
                  <Badge colorScheme="green">{video.status}</Badge>
                </GridItem>
              );
            })}

            {loading &&
              Array(4)
                .fill("")
                .map((_, i) => (
                  <GridItem key={i} borderRadius="md" bg={cardBg} p={3} shadow="md">
                    <Spinner size="lg" />
                  </GridItem>
                ))}
          </Grid>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Flex justify="center" align="center" mt={8} gap={2} wrap="wrap">
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(page - 2, 0), Math.min(page + 1, totalPages))
                .map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    colorScheme={p === page ? "blue" : "gray"}
                    variant={p === page ? "solid" : "outline"}
                    _hover={{
                      transform: "scale(1.1)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {p}
                  </Button>
                ))}

              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      ) : (
        <Flex mt={10} gap={5} wrap="wrap">
          {/* Left: Preview */}
          <Box flex="1" minW="350px" textAlign="center">
            <Heading size="md" mb={3}>
              {processing ? "Processing your video..." : "Combined Video Preview"}
            </Heading>
            {processing ? (
              <Flex align="center" justify="center" h="400px" bg="gray.100" borderRadius="lg">
                <Spinner size="xl" />
                <Text ml={3}>Processing... Please wait</Text>
              </Flex>
            ) : (
              <>
                <video
                  src={generatedVideo.final_video_url}
                  controls
                  style={{
                    width: "100%",
                    maxWidth: "700px",
                    borderRadius: "10px",
                    background: "black",
                  }}
                />
                <Flex justify="center" mt={5} gap={5}>
                  <Button colorScheme="green" onClick={() => handleQC("accept")}>
                    Accept
                  </Button>
                  <Button colorScheme="red" onClick={() => handleQC("recreate")}>
                    Recreate
                  </Button>
                </Flex>
              </>
            )}
          </Box>

          {/* Right: Selected Videos */}
          <Box
            flex="1"
            minW="250px"
            maxH="450px"
            overflowY="auto"
            p={3}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <Heading size="sm" mb={3}>
              Selected Input Videos
            </Heading>
            {selected.map((id) => {
              const v = videos.find((vid) => vid.creation_id === id);
              if (!v) return null;
              return (
                <Flex key={id} mb={3} align="center" gap={3}>
                  <Image
                    src={
                      v.image_urls?.[0] ||
                      "https://via.placeholder.com/200x120?text=No+Thumbnail"
                    }
                    alt={v.product_name}
                    boxSize="100px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <Box>
                    <Text fontWeight="bold" noOfLines={1}>
                      {v.product_name || "Untitled"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {id}
                    </Text>
                  </Box>
                </Flex>
              );
            })}
          </Box>
        </Flex>
      )}

      {/* Video Preview Modal */}
{/* Video Preview Modal */}
{/* ✅ Video Preview Modal */}
<Modal
  isOpen={isPreviewOpen}
  onClose={() => setIsPreviewOpen(false)}
  size="4xl"
  isCentered
>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Video Preview</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {previewVideo ? (
        <Box>
          <video
            src={previewVideo}
            controls
            autoPlay
            style={{ width: "100%", height:"60vh",borderRadius: "10px", background: "black" }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* ✅ Show Accept/Recreate buttons only while playing */}
          {isPlaying && (
            <Flex justify="center" mt={5} gap={5}>
              {/* Accept Button */}
              <Button
                colorScheme="green"
                onClick={async () => {
                  try {
                    const currentVideo = videos.find(
                      (v) =>
                        v.cloudinary_video_url === previewVideo ||
                        v.manual_video_url === previewVideo
                    );
                    if (!currentVideo?.creation_id) {
                      toast({ title: "No creation ID found", status: "error" });
                      return;
                    }

                    const payload = {
                      creation_id: currentVideo.creation_id,
                      manual_qc: "accept",
                    };
                    await axiosInstance.post(`/manual_qc_video/`, payload);

                    toast({ title: "Video accepted", status: "success" });
                    setIsPreviewOpen(false);
                  } catch (err) {
                    toast({ title: "Error accepting video", status: "error" });
                  }
                }}
              >
                Accept
              </Button>

              {/* Recreate Button */}
              <Button
                colorScheme="red"
                onClick={async () => {
                  try {
                    const currentVideo = videos.find(
                      (v) =>
                        v.cloudinary_video_url === previewVideo ||
                        v.manual_video_url === previewVideo
                    );
                    if (!currentVideo?.creation_id) {
                      toast({ title: "No creation ID found", status: "error" });
                      return;
                    }

                    const payload = {
                      creation_id: currentVideo.creation_id,
                      manual_qc: "recreate",
                    };
                    await axiosInstance.post(`/manual_qc_video/`, payload);

                    toast({
                      title: "Video sent for recreation",
                      status: "success",
                    });

                    // 🔁 Move parent tab to Image to Video
                    setActiveTab("Image to Video");
setclone(true)
setclonecreationid(currentVideo.creation_id)
                    setIsPreviewOpen(false);
                  } catch (err) {
                    toast({
                      title: "Error sending recreate request",
                      status: "error",
                    });
                  }
                }}
              >
                Recreate
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <Text>No video available</Text>
      )}
    </ModalBody>
  </ModalContent>
</Modal>

    </Box>
  );
};

export default VideoSelectorPage;
