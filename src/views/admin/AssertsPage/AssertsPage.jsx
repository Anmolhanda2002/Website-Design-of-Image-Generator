import React, { useState, useEffect, useCallback } from "react";
import NoImage from "assets/NoImage.jpg"; // fallback image
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
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { DownloadIcon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import axiosInstance from "utils/AxiosInstance";
import BulkImageCreation from "./BulkImageCreation";
import LifeStyleCreation from "./LifeStyleCreation";
  import { useColorMode } from "@chakra-ui/react";
  import { Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import MusicVideo  from "./MusicPage"
import AssetCard from "./components/AssertsCard"
const AssetsPage = () => {
  const toast = useToast();
const navigate = useNavigate();
const { colorMode } = useColorMode();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [displayEmail, setDisplayEmail] = useState("");
  const [selectedOption, setSelectedOption] = useState("1");
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
const [videoModal, setVideoModal] = useState({ isOpen: false, url: "" });
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
  const activeUserId = selectedUser?.user_id || user?.user_id;


  const getVideoFromItem = (item) => {
  return (
    item?.video_url ||
    item?.generated_video_url ||
    item?.cloudinary_video_url ||
    item?.final_video ||
    null
  );
};

// thrott
const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    if (!inThrottle) {
      func.apply(this, arguments);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};


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

  const getApiUrl = (userId, pageNumber = 1, search = "") => {
    switch (selectedOption) {
      case "1":
        return `/factory_development_assets_page?user_id=${userId}&page=${pageNumber}&search=${search}`;
      case "2":
        return `/get_virtual_tryon_images/?user_id=${userId}`;
      case "3":
        return `/get_image_resize_history/?user_id=${userId}`;
      case "4":
        return `/factory_development_assets_page/?user_id=${userId}`;
      default:
        return `/factory_development_assets_page?user_id=${userId}&page=${pageNumber}&search=${search}`;
    }
  };

  const fetchAssets = useCallback(
    async (pageNumber = 1, customUserId = activeUserId) => {
      if (selectedOption === "5") return;
      if (selectedOption === "6") return;
      if (!customUserId || pageNumber > totalPages) return;

      setLoading(true);
      try {
        const url = getApiUrl(customUserId, pageNumber, activeSearch);
        const response = await axiosInstance.get(url);

     if (response.data?.status === "success") {
  const apiData = response.data?.data;

  // If API returns no data array → fallback to empty array
  const newData = Array.isArray(apiData) ? apiData : [];

  setAssets((prev) => (pageNumber === 1 ? newData : [...prev, ...newData]));
  setTotalPages(response.data?.pagination?.pages || 1);

  // Show "No Data" toast if API has no records
  // if (newData.length === 0) {
  //   toast({
  //     title: "No Data Found",
  //     status: "info",
  //     duration: 3000,
  //     isClosable: true,
  //   });
  // }
} else {
          toast({
            title: "No Data Found",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          if (pageNumber === 1) setAssets([]);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Something went wrong while fetching data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [activeUserId, activeSearch, totalPages, selectedOption, toast]
  );

  useEffect(() => {
    setAssets([]);
    setPage(1);
    if (selectedOption !== "5" && activeUserId) {
      fetchAssets(1);
    }
  }, [activeUserId, activeSearch, selectedOption, fetchAssets]);




const getImageFromItem = (item) => {
  return (
    item?.image_url ||
    item?.generated_image_url ||
    item?.resized_image_url ||
    item?.image_urls?.[0] ||
    item?.original_image_url ||
    item?.resized_image || // your scene_composition key
    null
  );
};

const handleNavigation = (type, item) => {
  const imageUrl = getImageFromItem(item);

  navigate("/videocreate/createvideo", {
    state: {
      activeTab:
        type === "imageToVideo"
          ? "Image to Video"
          : type === "imageCreation"
          ? "Image Creation"
          : "Resize Image",

      selectedItem: {
        ...item,
        imageUrl: imageUrl,
      },

      editpage: true,
      option: selectedOption,
    },
  });
};

useEffect(() => {
  if (selectedOption === "1") {
    const handleScroll = throttle(() => {
      if (
        window.scrollY + window.innerHeight >=
          document.documentElement.offsetHeight - 200 &&
        !loading &&
        page < totalPages
      ) {
        setPage((prev) => prev + 1);
      }
    }, 500); // prevents multiple calls

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }
}, [loading, page, totalPages, selectedOption]);

  useEffect(() => {
    if (page > 1 && selectedOption === "1") fetchAssets(page);
  }, [page, fetchAssets, selectedOption]);

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

  const handleView = (item) => {
    setSelectedItem(item);
    onOpen();
  };

const renderDetails = (item) => {
  if (!item) return null;

  const fieldsToShow = {
    "1": [
      {
  label: "Creation ID",
  value: (
    <Text
      as="span"
      color="blue.400"
      cursor="pointer"
      onClick={() => {
        const videoUrl = getVideoFromItem(item);
        if (!videoUrl) {
          toast({
            title: "No Video Found",
            status: "warning",
            duration: 2000,
            isClosable: true,
          });
          return;
        }

        setVideoModal({ isOpen: true, url: videoUrl });
      }}
    >
      {item.creation_id}
    </Text>
  )
},
      { label: "Product Name", value: item.product_name || "—" },
      { label: "Dimensions", value: item.video_dimensions },
      { label: "Status", value: item.status },
      { label: "Created At", value: item.created_at },
    ],
 "2": [
      { label: "Composition ID", value: item.composition_id },
      { label: "Use Case", value: item.use_case },
      { label: "Model Used", value: item.model_used },
      { label: "Status", value: item.status },
      { label: "Resized Image", value: item.resized_image },
      { label: "Created At", value: item.created_at },
    ],
    "3": [
      { label: "Image ID", value: item.image_id },
      { label: "Resize Method", value: item.resize_method },
      { label: "Target Size", value: `${item.target_width} x ${item.target_height}` },
      { label: "Original Size", value: `${item.original_width} x ${item.original_height}` },
      { label: "Status", value: item.status },
      { label: "Created At", value: item.created_at },
    ],
    "4": [
      { label: "Creation ID", value: item.creation_id },
      { label: "Product Name", value: item.product_name || "—" },
      { label: "Status", value: item.status },
      { label: "Created At", value: item.created_at },
    ],
    "5": [],
  };




  return (
    <VStack align="start" spacing={2} mt={4} w="100%">
      {fieldsToShow[selectedOption]?.map(
        (f, i) =>
          f.value && (
            <Text key={i} fontSize="sm" color={textColor}>
              <strong>{f.label}:</strong> {f.value}
            </Text>
          )
      )}
    </VStack>
  );
};


  return (
    <Box p={5} mt={20} minH="100vh" bg="transparent">
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", lg: "row" }}
        wrap="wrap"
        gap={2}
        mb={5}
      >
        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          color={textColor}
          textAlign={{ base: "center", lg: "left" }}
        >
          Viewing for:{" "}
          <Text as="span" color="blue.500">
            {displayEmail}
          </Text>
        </Text>

        <Flex
          gap={2}
          align="center"
          justify={{ base: "center", lg: "flex-end" }}
          flexWrap="wrap"
          w={{ base: "100%", lg: "auto" }}
        >
          <Select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            maxW={{ base: "100%", sm: "200px", md: "150px" }}
            borderRadius="full"
            fontSize="sm"
             sx={{
    "& option": {
      backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
      color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
    },
  }}
          >
            <option value="1">Assets</option>
            <option value="2">Image Generation</option>
            <option value="3">Resize Image</option>
            <option value="4">Assets Page</option>
            <option value="5">Bulk Image Creation</option>
            <option value="6">LifeStyle Creation</option>
            <option value="7">Music Video</option>
          </Select>

          <InputGroup maxW={{ base: "100%", sm: "200px", md: "200px" }}>
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
      </Flex>

      {selectedOption === "5" ? (
        <BulkImageCreation userId={activeUserId} />
      ) : selectedOption === "6" ? (
        <LifeStyleCreation userId={activeUserId} />
      )  : selectedOption === "7" ? (
        <MusicVideo userId={activeUserId} />
      ): (
        <>
          {assets.length === 0 && !loading ? (
            <Flex direction="column" align="center" justify="center" mt={10}>
              <Image
                src="https://cdni.iconscout.com/illustration/premium/thumb/employee-is-unable-to-find-sensitive-data-illustration-svg-download-png-8062127.png"
                alt="No assets found"
                maxW="300px"
                mb={5}
              />
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                No Data Found
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
              {assets.map((item, i) => {
                const isFailed = item.status?.toLowerCase() === "failed";

                const imageUrl =
                  (!item.image_url &&
                    !item.generated_image_url &&
                    !item.resized_image_url &&
                    !item.image_urls?.[0] &&
                    !item.original_image_url) ||
                  isFailed
                    ? NoImage
                    : item.image_url ||
                      item.generated_image_url ||
                      item.resized_image_url ||
                      item.image_urls?.[0] ||
                      item.original_image_url;

                const title = item.product_name || item.use_case || `Image ${i + 1}`;
                const statusText = item.status || "Unknown";

                return (
<AssetCard
  key={`${item.creation_id || item.image_id || item.composition_id}-${i}`}
  item={item}
  imageUrl={imageUrl}
  title={title}
  statusText={statusText}
  isFailed={isFailed}
  onView={() => handleView(item)}
  onDownload={() => handleDownload(imageUrl)}
  cardBg={cardBg}
  textColor={textColor}
/>

                );
              })}
            </Grid>
          )}
        </>
      )}

      {selectedItem && (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: "sm", md: "xl" }}>
          <ModalOverlay />
          <ModalContent borderRadius="2xl" p={3}>
            <ModalCloseButton />
            <ModalBody p={5} color={textColor}>
              <Flex direction="column" align="center" gap={4}>
                <Image
                  src={
                    selectedItem.image_url ||
                    selectedItem.generated_image_url ||
                    selectedItem.resized_image_url ||
                    selectedItem.image_urls?.[0] ||
                    selectedItem.original_image_url ||
                    NoImage
                  }
                  alt="Preview"
                  maxH={{ base: "250px", md: "400px" }}
                  objectFit="contain"
                  borderRadius="xl"
                />
                <Menu>
  <MenuButton
    as={Button}
    rightIcon={<ChevronDownIcon />}
    colorScheme="blue"
    mt={4}
    w="200px"
    borderRadius="full"
  >
    Edit
  </MenuButton>

  <MenuList
    bg={colorMode === "dark" ? "#14225C" : "#fff"}
    color={colorMode === "dark" ? "#fff" : "#000"}
    borderRadius="lg"
  >
    <MenuItem
      onClick={() => handleNavigation("imageToVideo", selectedItem)}
    >
      Image to Video
    </MenuItem>

    <MenuItem
      onClick={() => handleNavigation("imageCreation", selectedItem)}
    >
      Image Creation
    </MenuItem>

    <MenuItem
      onClick={() => handleNavigation("resizeImage", selectedItem)}
    >
      Resize Image
    </MenuItem>
  </MenuList>
</Menu>


                {renderDetails(selectedItem)}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>

        
      )}
      <Modal
  isOpen={videoModal.isOpen}
  onClose={() => setVideoModal({ isOpen: false, url: "" })}
  size="xl"
  isCentered
>
  <ModalOverlay />
  <ModalContent borderRadius="2xl" p={3}>
    <ModalCloseButton />

    <ModalBody p={4}>
      <Text fontWeight="bold" mb={3} textAlign="center">
        Video Preview
      </Text>

      <video
        src={videoModal.url}
        controls
        autoPlay
        style={{
          width: "100%",
          maxHeight: "500px",
          borderRadius: "12px",
          backgroundColor: "black",
        }}
      />
    </ModalBody>
  </ModalContent>
</Modal>
    </Box>
    
  );
};

export default AssetsPage;
