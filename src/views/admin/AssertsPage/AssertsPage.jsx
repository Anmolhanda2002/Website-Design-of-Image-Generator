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
const AssetsPage = () => {
  const toast = useToast();

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

  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const selectedUser = JSON.parse(localStorage.getItem("selected_user") || "null");
  const activeUserId = selectedUser?.user_id || user?.user_id;

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
        return `/assets_page?user_id=${userId}&page=${pageNumber}&search=${search}`;
      case "2":
        return `/get_virtual_tryon_images/?user_id=${userId}`;
      case "3":
        return `/get_image_resize_history/?user_id=${userId}`;
      case "4":
        return `/factory_development_assets_page/?user_id=${userId}`;
      default:
        return `/assets_page?user_id=${userId}&page=${pageNumber}&search=${search}`;
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

  useEffect(() => {
    if (selectedOption === "1") {
      const handleScroll = () => {
        if (
          window.scrollY + window.innerHeight >=
            document.documentElement.offsetHeight - 100 &&
          !loading &&
          page < totalPages
        ) {
          setPage((prev) => prev + 1);
        }
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
    return;
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
      { label: "Creation ID", value: item.creation_id },
      { label: "Product Name", value: item.product_name || "—" },
      { label: "Video Dimensions", value: item.video_dimensions },
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
      ) : (
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
                  <GridItem
                    key={`${item.creation_id || item.image_id || item.composition_id}-${i}`}
                    borderWidth="1px"
                    borderRadius="md"
                    overflow="hidden"
                    p={3}
                    bg={cardBg}
                    shadow="md"
                    transition="all 0.3s"
                    _hover={{ transform: "scale(1.03)", shadow: "xl" }}
                  >
                    <Image
                      src={imageUrl}
                      alt={title}
                      borderRadius="md"
                      objectFit="cover"
                      height="200px"
                      width="100%"
                      fallback={<Skeleton height="200px" width="100%" />}
                      cursor="pointer"
                      onClick={() => handleView(item)}
                    />
                    <Text fontWeight="bold" color={textColor} mt={2} noOfLines={1}>
                      {title}
                    </Text>
                    <Text fontSize="sm" color={isFailed ? "red.500" : "green.500"} mt={1}>
                      {statusText}
                    </Text>
                    <Flex justify="space-between" mt={2}>
                      <Button
                        size="sm"
                        leftIcon={<DownloadIcon />}
                        colorScheme="blue"
                        onClick={() => handleDownload(imageUrl)}
                      >
                        Download
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        variant="solid"
                        onClick={() => handleView(item)}
                        p={0}
                        w="35px"
                        h="35px"
                        borderRadius="full"
                      >
                        <ViewIcon />
                      </Button>
                    </Flex>
                  </GridItem>
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

                {renderDetails(selectedItem)}
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AssetsPage;
