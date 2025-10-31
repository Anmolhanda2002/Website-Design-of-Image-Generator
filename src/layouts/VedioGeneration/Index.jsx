import React, { useState, useEffect, startTransition } from "react";
import {
  Flex,
  Box,
  Button,
  Text,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
    Select,
  Spinner,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Panel from "./components/Panel";
import PreviewArea from "./components/Privewarea";
import EditVedioComponent from "./components/EditPreviewBox/EditPreviewBox";
import Image from "assets/image.png";
import { useToast } from "@chakra-ui/react";
import axiosInstance from "utils/AxiosInstance";
import CaptionedEdit from "./components/CaptionSegment/CaptionSegment";
export default function PixVerseLayout() {
  const toast = useToast();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const [clone,setclone]=useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Persist Active Tab across refresh
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "Image Creation"
  );

  // fetch user for dropdown 
    const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
const bgColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const [model, setModel] = useState("V5");
  const [duration, setDuration] = useState("8s");
  const [resolution, setResolution] = useState("360P");
  const [ratio, setRatio] = useState("16:9");

  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState({});
  const [sending, setSending] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const navbarBg = useColorModeValue("white", "gray.800");
  const mobileTabBg = useColorModeValue("gray.100", "gray.700");
  const [clonecreationid ,setclonecreationid]=useState("")


// 📽 Captioned Edit tab data
const [captionedVideos, setCaptionedVideos] = useState([]);
const [loadingCaptioned, setLoadingCaptioned] = useState(false);
const [selectedVideo, setSelectedVideo] = useState(null);


useEffect(() => {
  if (activeTab !== "Captioned Edit" || !selectedUser) return;

  const fetchCaptionedVideos = async () => {
    try {
      setLoadingCaptioned(true);
      const res = await axiosInstance.get(`/get_edited_videos_by_user/?user_id=${selectedUser}`);
      if (res.data?.status === "success" && Array.isArray(res.data.data)) {
        setCaptionedVideos(res.data.data);
      } else {
        setCaptionedVideos([]);
        toast({
          title: "No videos found for this user",
          status: "warning",
          duration: 2000,
        });
      }
    } catch (err) {
      console.error("Error fetching captioned videos:", err);
      toast({
        title: "Failed to load videos",
        status: "error",
        duration: 2000,
      });
    } finally {
      setLoadingCaptioned(false);
    }
  };

  fetchCaptionedVideos();
}, [activeTab, selectedUser]);


  // State for settings
  const [imageCreationSettings, setImageCreationSettings] = useState({
    guidelineId: "",
    targetMethod: "disable",
    targetWidth: "",
    targetHeight: "",
    resizeMethod: "",
    quality: "",
  });

  const [resizeImageSettings, setResizeImageSettings] = useState({
    customId: "",
    productId: "",
    targetWidth: "",
    targetHeight: "",
    resizeMethod: "",
    quality: "",
  });

  const [imageToVideoSettings, setImageToVideoSettings] = useState({
    customer_ID: "",
    product_ID: "",
    layover_text: "",
    project_name: "",
    tags: "",
    sector: "",
    goal: "",
    key_instructions: "",
    consumer_message: "",
    M_key: "",
    resize: false,
    resize_width: "",
    resize_height: "",
    duration: "",
    aspect_ratio: "",
    customSize: "false",
    customWidth: "",
    customHeight: "",
    video_type: "",
  });


  const [captionData, setCaptionData] = useState({
    edit_id: "",
    segment_number: "",
    text: "",
    start_time: "",
    end_time: "",
    font_size: "",
    font_color: "#ffffff",
    background_color: "#000000",
    background_opacity: 0.8,
    x: "",
    y: "",
    animation: "",
    animation_speed: "",
  });
  const handleDataChange = (newData) => {
    startTransition(() => {
      setPreviewData(newData);
    });
  };


//fetch user dropdown api 
useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await axiosInstance.get("/my_user_dropdown/");
        if (res.data?.status === "success" && Array.isArray(res.data.users)) {
          setUsers(res.data.users);
          if (res.data.users.length > 0) {
            setSelectedUser(res.data.users[0].user_id); // auto-select first user
          }
        } else {
          toast({
            title: "No users found",
            status: "warning",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error("User fetch error:", error);
        toast({
          title: "Failed to load users",
          status: "error",
          duration: 2000,
        });
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);




useEffect(() => {
  if (!clone) return; // Only run when clone = true

  const fetchCloneData = async () => {
    try {
      toast({
        title: "Fetching cloned project...",
        status: "info",
        duration: 1500,
      });

      // 👇 Send creation_id in body
      const res = await axiosInstance.post(`/clone_creation/`, {
        creation_id: clonecreationid,
      });

      const data = res.data?.data;
      console.log("🧩 Clone response:", data);

      if (data) {
        // ✅ Map API response fields properly
        setImageToVideoSettings((prev) => ({
          ...prev,
          project_name: data.project_id || prev.project_name,
          tags: data.tags || prev.tags,
          sector: data.sector || prev.sector,
          goal: data.goal || prev.goal,
          key_instructions: data.key_instructions || prev.key_instructions,
          duration: data.duration ? `${data.duration}s` : prev.duration,
          aspect_ratio: data.video_dimensions || prev.aspect_ratio,
          resize: false,
          resize_width: "",
          resize_height: "",
          customSize: "false",
          customWidth: "",
          customHeight: "",
          video_type: "clone",
        }));

        // ✅ Fix: Format image URLs to proper structure
        if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
          const formattedImages = data.image_urls.map((url, index) => ({
            id: `clone-${index}`,
            url,
          }));
          setImages(formattedImages);
        }

        toast({
          title: "Clone loaded successfully!",
          status: "success",
          duration: 1500,
        });

        // ✅ Switch to “Image to Video” tab
        setActiveTab("Image to Video");
      } else {
        toast({
          title: "No cloned data found",
          status: "warning",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Clone API error:", error);
      toast({
        title: "Error fetching clone data",
        status: "error",
      });
    } finally {
      setclone(false); // prevent re-run
    }
  };

  fetchCloneData();
}, [clone]);



  // ---------- JSX ----------
  return (
    <Flex direction="column" h="100vh" overflow="hidden">
      {/* ---------- Navbar ---------- */}
      <Flex
        h="70px"
        px={6}
        py={3}
        bg={navbarBg}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        flexShrink={0}
      >
        {/* Left Section */}
        <Flex align="center" gap={4}>
          <Button
            onClick={() => navigate(-1)}
            size="sm"
            bg={useColorModeValue("blue.500", "blue.400")}
            color="white"
            _hover={{ bg: useColorModeValue("blue.600", "blue.500") }}
            p={2}
            borderRadius="full"
          >
            <MdArrowBack size={18} />
          </Button>

          <Flex align="center" gap={2}>
            <Box as="img" src={Image} alt="Hygaar Logo" boxSize="30px" borderRadius="md" />
            <Text fontSize="lg" fontWeight="bold">
              Hygaar
            </Text>
          </Flex>
        </Flex>


{loadingUsers ? (
            <Spinner size="sm" />
          ) : (
            <Select
              placeholder="Select User"
              size="sm"
              w="200px"
              value={selectedUser}
               onChange={(e) => {
    const userId = e.target.value;
    startTransition(() => {
      setSelectedUser(userId);
    });
  }}
            >
              {users.map((u) => (
                <option key={u.user_id} value={u.user_id}>
                  {u.username}
                </option>
              ))}
            </Select>
          )}
        {/* Mode Toggle */}
        <Button onClick={toggleColorMode} size="sm" variant="ghost" p={2} borderRadius="full">
          {colorMode === "light" ? "🌙" : "☀️"}
        </Button>
      </Flex>

      {/* ---------- BODY ---------- */}
      {isMobile ? (
        /* ===== Mobile Layout ===== */
        <Flex direction="column" flex="1" overflow="auto" p={3} gap={4}>
          {activeTab === "Edit Video" ? (
            <Box
              mt="50px"
              overflowY="auto"
              h="calc(100vh - 120px)"
              p={4}
              sx={{
                "::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <EditVedioComponent previewData={previewData} />
            </Box>
          ) : (
            <>
              <PreviewArea
                text={text}
                setText={setText}
                images={images}
                setImages={setImages}
                loadingImages={loadingImages}
                setLoadingImages={setLoadingImages}
                sending={sending}
                setSending={setSending}
                model={model}
                duration={duration}
                resolution={resolution}
                ratio={ratio}
              />

              {/* Mobile Tabs */}
              <Flex justify="space-around" bg={mobileTabBg} borderRadius="md" py={2} boxShadow="sm">
                {["Template", "Transition", "Fusion", "Extend", "Sound", "Edit Video"].map(
                  (tab) => (
                    <Button
                      key={tab}
                      size="sm"
                      variant={activeTab === tab ? "solid" : "ghost"}
                      colorScheme="blue"
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </Button>
                  )
                )}
              </Flex>

              <Panel
                activeTab={activeTab}
                onDataChange={handleDataChange}
                model={model}
                setModel={setModel}
                duration={duration}
                setDuration={setDuration}
                resolution={resolution}
                setResolution={setResolution}
                ratio={ratio}
                setRatio={setRatio}
                imageCreationSettings={imageCreationSettings}
                setImageCreationSettings={setImageCreationSettings}
                resizeImageSettings={resizeImageSettings}
                setResizeImageSettings={setResizeImageSettings}
                imageToVideoSettings={imageToVideoSettings}
                setImageToVideoSettings={setImageToVideoSettings}
                captionData={captionData}
                  setCaptionData={setCaptionData}
              />
            </>
          )}
        </Flex>
      ) : (
        /* ===== Desktop Layout ===== */
        <Flex flex="1" overflow="hidden">
          {/* Sidebar */}
          <Box
            w="100px"
            h="calc(100vh - 70px)"
            overflowY="auto"
         sx={{
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none",
  scrollbarWidth: "none",
}}
          >
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </Box>

          {/* Conditional Rendering */}
          {activeTab === "Edit Video" ? (
            <Box
              flex="1"
              bg={bgColor}
          
              overflowY="auto"
              
              mt={"-50"}
           sx={{
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none", // ✅ correct camelCase for IE/Edge
  scrollbarWidth: "none", // ✅ correct camelCase for Firefox
}}

            >
              <EditVedioComponent previewData={previewData} setActiveTab={setActiveTab} setclone={setclone} setclonecreationid={setclonecreationid}/>
            </Box>
          ):activeTab === "Caption Segment"?(
            <>
              <Flex flex="1" overflow="hidden">
              {/* Panel */}
              <Box
                w={{ base: "100%", md: "350px" }}
                h="calc(100vh - 70px)"
                overflowY="auto"
                p={4}
               sx={{
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none", // ✅ correct camelCase for IE/Edge
  scrollbarWidth: "none", // ✅ correct camelCase for Firefox
}}

              >
                <Panel
                  activeTab={activeTab}
                  onDataChange={handleDataChange}
                  model={model}
                  setModel={setModel}
                  duration={duration}
                  setDuration={setDuration}
                  resolution={resolution}
                  setResolution={setResolution}
                  ratio={ratio}
                  setRatio={setRatio}
                  imageCreationSettings={imageCreationSettings}
                  setImageCreationSettings={setImageCreationSettings}
                  resizeImageSettings={resizeImageSettings}
                  setResizeImageSettings={setResizeImageSettings}
                  imageToVideoSettings={imageToVideoSettings}
                  setImageToVideoSettings={setImageToVideoSettings}
                  captionData={captionData}
                  setCaptionData={setCaptionData}
                />
              </Box>

              {/* Preview Area */}
              <Box
                flex="1"
                h="calc(100vh - 70px)"
                p={6}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >

<CaptionedEdit selectedUser={selectedUser} captionData={captionData} setCaptionData={setCaptionData} />
              </Box>
            </Flex>




            </>
          ) : (
            <Flex flex="1" overflow="hidden">
              {/* Panel */}
              <Box
                w={{ base: "100%", md: "350px" }}
                h="calc(100vh - 70px)"
                overflowY="auto"
                p={4}
               sx={{
  "&::-webkit-scrollbar": {
    display: "none",
  },
  msOverflowStyle: "none", // ✅ correct camelCase for IE/Edge
  scrollbarWidth: "none", // ✅ correct camelCase for Firefox
}}

              >
                <Panel
                  activeTab={activeTab}
                  onDataChange={handleDataChange}
                  model={model}
                  setModel={setModel}
                  duration={duration}
                  setDuration={setDuration}
                  resolution={resolution}
                  setResolution={setResolution}
                  ratio={ratio}
                  setRatio={setRatio}
                  imageCreationSettings={imageCreationSettings}
                  setImageCreationSettings={setImageCreationSettings}
                  resizeImageSettings={resizeImageSettings}
                  setResizeImageSettings={setResizeImageSettings}
                  imageToVideoSettings={imageToVideoSettings}
                  setImageToVideoSettings={setImageToVideoSettings}
                  captionData={captionData}
                  setCaptionData={setCaptionData}
                />
              </Box>

              {/* Preview Area */}
              <Box
                flex="1"
                h="calc(100vh - 70px)"
                p={6}
                overflow="hidden"
                display="flex"
                flexDirection="column"
              >
                <PreviewArea
                  activeTab={activeTab}
                  text={text}
                  setText={setText}
                  images={images}
                  setImages={setImages}
                  loadingImages={loadingImages}
                  setLoadingImages={setLoadingImages}
                  sending={sending}
                  setSending={setSending}
                  model={model}
                  duration={duration}
                  resolution={resolution}
                  ratio={ratio}
                  imageCreationSettings={imageCreationSettings}
                  resizeImageSettings={resizeImageSettings}
                  imageToVideoSettings={imageToVideoSettings}
                  selectedUser={selectedUser}
                />
              </Box>
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
}
