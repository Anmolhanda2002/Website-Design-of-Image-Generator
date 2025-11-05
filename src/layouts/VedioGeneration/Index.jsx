import React, { useState, useEffect, startTransition } from "react";
import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  Spinner,
  Text,
  useBreakpointValue,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import Sidebar, { MobileSidebarItems, MobileMenuButton } from "./components/Sidebar"; 
import Panel from "./components/Panel";
import PreviewArea from "./components/Privewarea";
import EditVedioComponent from "./components/EditPreviewBox/EditPreviewBox";
import Image from "assets/image.png";
import axiosInstance from "utils/AxiosInstance";
import CaptionedSegment from "./components/CaptionSegment/CaptionSegment";
import CaptionedEdit from "./components/CaptionEdit/CaptionEdit";
import MergeVideo from "./components/MergeData/MergeVideo";
import AddMusic from "./components/AddMusicVideo/AddMusicVIdeo";

// --- Initial State Definitions for Reset (Must be outside the component) ---
const initialImageCreationSettings = {
    guidelineId: "", targetMethod: "disable", targetWidth: "", 
    targetHeight: "", resizeMethod: "", quality: "",
};
const initialResizeImageSettings = {
    customId: "", productId: "", targetWidth: "", targetHeight: "", 
    resizeMethod: "", quality: "",
};
const initialImageToVideoSettings = {
    customer_ID: "", product_ID: "", layover_text: "", project_name: "", 
    tags: "", sector: "", goal: "", key_instructions: "", consumer_message: "", 
    M_key: "", resize: false, resize_width: "", resize_height: "", 
    duration: "8s", aspect_ratio: "16:9", customSize: "false", 
    customWidth: "", customHeight: "", video_type: "",
};
const initialCaptionData = {
    edit_id: "", segment_number: "", text: "", start_time: "", end_time: "", 
    font_size: "", font_color: "#ffffff", background_color: "#000000", 
    background_opacity: 0.8, x: "", y: "", animation: "", animation_speed: "",
};
const initialMergeData = {
    trim_start: "", trim_end: "", user_id: "", hygaar_key: "", edit_id: "", 
    brand_outro_video_url: "", custom_resize: false, mearg_id: "", 
    height: "", width: "",
};
// -------------------------------------------------------------------------

export default function PixVerseLayout() {
    const toast = useToast();
    const navigate = useNavigate();
    const { colorMode, toggleColorMode } = useColorMode();
    const [clone, setclone] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false });
    const { isOpen, onOpen, onClose } = useDisclosure(); 
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userss, setUser] = useState(null);
    useEffect(() => {
      if (isManager) return;
      const fetchUsers = async () => {
        try {
          setDropdownLoading(true);
          const res = await axiosInstance.get("/my_user_dropdown/");
          if (res.data?.status === "success") {
            setAllUsers(res.data.users || []);
            setFilteredUsers(res.data.users || []);
          } else {
            toast({
              title: "Failed to load users",
              description: res.data?.message || "Unexpected response",
              status: "warning",
              duration: 2500,
            });
          }
        } catch (err) {
          toast({
            title: "Error fetching users",
            description: err.response?.data?.message || err.message,
            status: "error",
            duration: 2500,
          });
        } finally {
          setDropdownLoading(false);
        }
      };
      fetchUsers();
    }, [userss]);
    // User context
const user = JSON.parse(localStorage.getItem("user")) || {};
const isManager = user.roles && user.roles.includes("Manager");

// For select user
const handleSelectUser = (u) => {
  startTransition(() => {
    if (!u) {
      // 👇 Selecting "Own" → use the logged-in user
      setSelectedUser(user);
      localStorage.setItem("selected_user", JSON.stringify(user));
    } else {
      // 👇 Selecting another user
      setSelectedUser(u);
      localStorage.setItem("selected_user", JSON.stringify(u));
    }
  });
};

// ✅ First-time setup: if nothing is in localStorage, default to own user
useEffect(() => {
  const stored = JSON.parse(localStorage.getItem("selected_user"));
  if (!stored) {
    setSelectedUser(user);
    localStorage.setItem("selected_user", JSON.stringify(user));
  } else {
    setSelectedUser(stored);
  }
}, []);

    // Core States
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("activeTab") || "Image Creation"
    );
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loadingUsers, setLoadingUsers] = useState(false);
    
    // UI/Style States
    const bgColor = useColorModeValue("gray.200", "gray.700");
    const color =useColorModeValue("white", "gray.800")
    const navbarBg = useColorModeValue("white", "gray.800");
    
    // Tool States (Inputs, Outputs, Settings)
    const [model, setModel] = useState("V5");
    const [duration, setDuration] = useState("8s");
    const [resolution, setResolution] = useState("360P");
    const [ratio, setRatio] = useState("16:9");
    const [text, setText] = useState("");
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState({});
    const [sending, setSending] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [clonecreationid, setclonecreationid] = useState("");

    // Video-specific states
    const [captionedVideos, setCaptionedVideos] = useState([]);
    const [loadingCaptioned, setLoadingCaptioned] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Settings states, initialized with constants
    const [imageCreationSettings, setImageCreationSettings] = useState(initialImageCreationSettings);
    const [resizeImageSettings, setResizeImageSettings] = useState(initialResizeImageSettings);
    const [imageToVideoSettings, setImageToVideoSettings] = useState(initialImageToVideoSettings);
    const [captionData, setCaptionData] = useState(initialCaptionData);
    const [MergeData, setMergeData] = useState(initialMergeData);
const [resetTrigger, setResetTrigger] = useState(0);
  const [generatedImage, setGeneratedImage] = useState("");
  const [resizedImage, setResizedImage] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
const handleTabChange = (tab) => {
  setActiveTab(tab);
  setResetTrigger((prev) => prev + 1); // 👈 change this to trigger reset
};


  const menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.800", "white");
  const navbarIcon = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const shadow = useColorModeValue(
    "0 2px 8px rgba(0,0,0,0.05)",
    "0 2px 8px rgba(255,255,255,0.08)"
  );
    // ------------------------------------------------------------------
    // 1. Core Logic: Function to reset all relevant states
    // ------------------------------------------------------------------

    const resetAllData = () => {
        // Reset core data/UI state
        setText("");
        setImages([]);
        setPreviewData(null);
        setSending(false);
        setclone(false);
        setclonecreationid("");

        // Reset all settings using initial state objects
        setImageCreationSettings(initialImageCreationSettings);
        setResizeImageSettings(initialResizeImageSettings);
        setImageToVideoSettings(initialImageToVideoSettings);
        setCaptionData(initialCaptionData);
        setMergeData(initialMergeData);

        // Reset video selection data 
        setSelectedVideo(null);
        setCaptionedVideos([]);
        setGeneratedImage("")
        setResizedImage("")
        setGeneratedVideo("")
    };

    // 2. New Handler: Used by Sidebar components to set the tab
const handleSetActiveTab = (tabName) => {
  startTransition(() => {
    setActiveTab(tabName);
  });
};

    // 3. useEffect: Triggers reset when activeTab changes
useEffect(() => {
  resetAllData();
}, [activeTab]);
    // ------------------------------------------------------------------


    // Existing useEffect for Captioned Videos 
useEffect(() => {
  if (activeTab !== "Captioned Edit" || !selectedUser) return;

  const fetchCaptionedVideos = async () => {
    setLoadingCaptioned(true);
    try {
      const res = await axiosInstance.get(`/get_edited_videos_by_user/?user_id=${selectedUser}`);
      if (res.data?.status === "success" && Array.isArray(res.data.data)) {
        setCaptionedVideos(res.data.data);
      } else {
        setCaptionedVideos([]);
        toast({ title: "No videos found for this user", status: "warning", duration: 2000 });
      }
    } catch (err) {
      console.error("Error fetching captioned videos:", err);
      toast({ title: "Failed to load videos", status: "error", duration: 2000 });
    } finally {
      setLoadingCaptioned(false);
    }
  };

  // small async defer (prevents React from thinking it’s synchronous)
  const timer = setTimeout(fetchCaptionedVideos, 0);
  return () => clearTimeout(timer);
}, [activeTab, selectedUser]);



    const handleDataChange = (newData) => {
        startTransition(() => {
            setPreviewData(newData);
        });
    };

    // fetch user dropdown api
useEffect(() => {
  const fetchUsers = async () => {
    try {
      setDropdownLoading(true);
      const res = await axiosInstance.get("/my_user_dropdown/");
      const usersData =
        res.data?.users ||
        res.data?.data ||
        res.data?.results ||
        res.data ||
        [];

      if (usersData.length > 0) {
        setAllUsers(usersData);
        setFilteredUsers(usersData);
      } else {
        toast({
          title: "No users found",
          status: "info",
          duration: 2500,
        });
      }
    } catch (err) {
      toast({
        title: "Error fetching users",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 2500,
      });
    } finally {
      setDropdownLoading(false);
    }
  };

  fetchUsers();
}, []); 

    useEffect(() => {
        if (!clone) return; 

        const fetchCloneData = async () => {
            try {
                toast({ title: "Fetching cloned project...", status: "info", duration: 1500, });
                const res = await axiosInstance.post(`/clone_creation/`, { creation_id: clonecreationid, });
                const data = res.data?.data;
                
                if (data) {
                    setImageToVideoSettings((prev) => ({
                        ...prev,
                        project_name: data.project_id || prev.project_name, tags: data.tags || prev.tags,
                        sector: data.sector || prev.sector, goal: data.goal || prev.goal,
                        key_instructions: data.key_instructions || prev.key_instructions,
                        duration: data.duration ? `${data.duration}s` : prev.duration,
                        aspect_ratio: data.video_dimensions || prev.aspect_ratio, resize: false,
                        resize_width: "", resize_height: "", customSize: "false", 
                        customWidth: "", customHeight: "", video_type: "clone",
                    }));

                    if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
                        const formattedImages = data.image_urls.map((url, index) => ({
                            id: `clone-${index}`, url,
                        }));
                        setImages(formattedImages);
                    }
                    toast({ title: "Clone loaded successfully!", status: "success", duration: 1500, });
                    setActiveTab("Image to Video");
                } else {
                    toast({ title: "No cloned data found", status: "warning", duration: 1500, });
                }
            } catch (error) {
                console.error("Clone API error:", error);
                toast({ title: "Error fetching clone data", status: "error", });
            } finally {
                setclone(false); // prevent re-run
            }
        };

        fetchCloneData();
    }, [clone]);


//for select user


  // ✅ Sync localStorage every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem("selected_user"));
      if (!stored && selectedUser) setSelectedUser(null);
      if (stored && (!selectedUser || stored.user_id !== selectedUser.user_id))
        setSelectedUser(stored);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedUser]);
const handleSearch = (e) => {
  const term = e.target.value.toLowerCase();

  // update text immediately (so typing feels responsive)
  setSearchTerm(term);

  // heavy filter update in background
  startTransition(() => {
    setFilteredUsers(
      allUsers.filter((u) => u.username.toLowerCase().includes(term))
    );
  });
};


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
      <Text fontSize="lg" fontWeight="bold">Hygaar</Text>
    </Flex>
  </Flex>

  <HStack spacing={4}>
    {isManager && (
      <Menu>
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          borderColor={borderColor}
          _hover={{ bg: hoverBg }}
        >
          {selectedUser ? selectedUser.username : "Own"}
        </MenuButton>
        <MenuList
          p={3}
          borderRadius="md"
          bg={menuBg}
          boxShadow={shadow}
          minW="200px"
          maxH="260px"
          overflowY="auto"
        >
          <InputGroup mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              size="sm"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>

          <MenuItem
            onClick={() => handleSelectUser(null)}
            borderRadius="md"
            _hover={{ bg: hoverBg }}
            fontWeight={
              !selectedUser || selectedUser?.user_id === user.user_id ? "600" : "normal"
            }
          >
            Own
          </MenuItem>

          {dropdownLoading ? (
            <Flex justify="center" align="center" py={2}>
              <Spinner size="sm" />
            </Flex>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <MenuItem
                key={u.user_id}
                onClick={() => handleSelectUser(u)}
                borderRadius="md"
                _hover={{ bg: hoverBg }}
                fontWeight={
                  selectedUser?.user_id === u.user_id ? "600" : "normal"
                }
              >
                {u.username}
              </MenuItem>
            ))
          ) : (
            <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
              No users found
            </Text>
          )}
        </MenuList>
      </Menu>
    )}

    <Button onClick={toggleColorMode} size="sm" variant="ghost" p={2} borderRadius="full">
      {colorMode === "light" ? "🌙" : "☀️"}
    </Button>

    <MobileMenuButton onOpen={onOpen} />
  </HStack>
</Flex>


            {/* =========================================================
              Mobile Sidebar Drawer 
              =========================================================
            */}
            <Drawer placement="left" onClose={onClose} isOpen={isOpen} size="xs">
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
                    <DrawerBody p={0}>
                        <MobileSidebarItems
                            activeTab={activeTab}
                            setActiveTab={handleSetActiveTab} 
                            onClose={onClose}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* ---------- BODY ---------- */}
            {isMobile ? (
                /* ===== Mobile Layout (Simplified) ===== */
                <Flex direction="column" flex="1" overflow="auto" p={3} gap={4}>
                    {/* Conditional full-screen components for specific tabs */}
                    {(activeTab === "Edit Video" || activeTab === "Caption Segment" || activeTab === "Captioned Edit" || activeTab === "Merge Video" || activeTab === "Add Music") ? (
                        <Box
                            overflowY="auto" flex="1" p={4} bg={color} borderRadius="lg" boxShadow="md"
                            sx={{ "::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}
                        >
                            {activeTab === "Edit Video" && (<EditVedioComponent  selectedUser={selectedUser} previewData={previewData} />)}
                            {activeTab === "Caption Segment" && (<CaptionedSegment selectedUser={selectedUser} captionData={captionData} setCaptionData={setCaptionData} />)}
                            {activeTab === "Captioned Edit" && <CaptionedEdit selectedUser={selectedUser} MergeData={MergeData} setMergeData={setMergeData} />}
                            {activeTab === "Merge Video" && (<MergeVideo selectedUser={selectedUser} MergeData={MergeData} setMergeData={setMergeData} />)}
                            {activeTab === "Add Music" && <AddMusic selectedUser={selectedUser} />}
                        </Box>
                    ) : (
                        // Default Panel/Preview Layout for other tabs
                        <>
                            <PreviewArea
                            generatedVideo={generatedVideo} setGeneratedVideo={setGeneratedVideo}
                              generatedImage={generatedImage} setGeneratedImage={setGeneratedImage} resizedImage={resizedImage} setResizedImage={setResizedImage} text={text} resetTrigger={resetTrigger} setText={setText} images={images} setImages={setImages} loadingImages={loadingImages} setLoadingImages={setLoadingImages} sending={sending} setSending={setSending} model={model} duration={duration} resolution={resolution} ratio={ratio} activeTab={activeTab} imageCreationSettings={imageCreationSettings} resizeImageSettings={resizeImageSettings} imageToVideoSettings={imageToVideoSettings} selectedUser={selectedUser}
                            />
                            {/* Panel Below Preview in Mobile */}
                            <Panel
                                activeTab={activeTab} onDataChange={handleDataChange} model={model} setModel={setModel} duration={duration} setDuration={setDuration} resolution={resolution} setResolution={setResolution} ratio={ratio} setRatio={setRatio} imageCreationSettings={imageCreationSettings} setImageCreationSettings={setImageCreationSettings} resizeImageSettings={resizeImageSettings} setResizeImageSettings={setResizeImageSettings} imageToVideoSettings={imageToVideoSettings} setImageToVideoSettings={setImageToVideoSettings} captionData={captionData} setCaptionData={setCaptionData} MergeData={MergeData} setMergeData={setMergeData}
                            />
                        </>
                    )}
                </Flex>
            ) : (
                /* ===== Desktop Layout (Existing Logic) ===== */
                <Flex flex="1" overflow="hidden">
                    {/* Sidebar */}
                    <Box
                        w="100px" h="calc(100vh - 70px)" overflowY="auto" flexShrink={0}
                        sx={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}
                    >
                        <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} /> {/* ✅ Uses the reset handler */}
                    </Box>

                    {/* Conditional Rendering */}
                    {activeTab === "Edit Video" ? (
                        <Box
                            flex="1" bg={bgColor} overflowY="auto" mt={"-50"}
                            sx={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}
                        >
                            <EditVedioComponent selectedUser={selectedUser}  previewData={previewData} setActiveTab={handleSetActiveTab} setclone={setclone} setclonecreationid={setclonecreationid} /> {/* ✅ Uses the reset handler */}
                        </Box>
                    ) : activeTab === "Caption Segment" ? (
                        <Flex flex="1" overflow="hidden">
                            {/* Panel */}
                            <Box w={{ base: "100%", md: "350px" }} h="calc(100vh - 70px)" overflowY="auto" p={4} flexShrink={0} sx={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}>
                                <Panel activeTab={activeTab} onDataChange={handleDataChange} model={model} setModel={setModel} duration={duration} setDuration={setDuration} resolution={resolution} setResolution={setResolution} ratio={ratio} setRatio={setRatio} imageCreationSettings={imageCreationSettings} setImageCreationSettings={setImageCreationSettings} resizeImageSettings={resizeImageSettings} setResizeImageSettings={setResizeImageSettings} imageToVideoSettings={imageToVideoSettings} setImageToVideoSettings={setImageToVideoSettings} captionData={captionData} setCaptionData={setCaptionData} MergeData={MergeData} setMergeData={setMergeData} />
                            </Box>
                            {/* Preview Area */}
                            <Box flex="1" h="calc(100vh - 70px)" p={6} overflow="hidden" display="flex" flexDirection="column">
                                <CaptionedSegment selectedUser={selectedUser} captionData={captionData} setCaptionData={setCaptionData} />
                            </Box>
                        </Flex>
                    ) : activeTab === "Captioned Edit" ? (
                        <CaptionedEdit selectedUser={selectedUser} MergeData={MergeData} setMergeData={setMergeData} />
                    ) : activeTab === "Merge Video" ? (
                        <Flex flex="1" overflow="hidden">
                            {/* Panel */}
                            <Box w={{ base: "100%", md: "350px" }} h="calc(100vh - 70px)" overflowY="auto" p={4} flexShrink={0} sx={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}>
                                <Panel activeTab={activeTab} onDataChange={handleDataChange} model={model} setModel={setModel} duration={duration} setDuration={setDuration} resolution={resolution} setResolution={setResolution} ratio={ratio} setRatio={setRatio} imageCreationSettings={imageCreationSettings} setImageCreationSettings={setImageCreationSettings} resizeImageSettings={resizeImageSettings} setResizeImageSettings={setResizeImageSettings} imageToVideoSettings={imageToVideoSettings} setImageToVideoSettings={setImageToVideoSettings} captionData={captionData} setCaptionData={setCaptionData} MergeData={MergeData} setMergeData={setMergeData} />
                            </Box>
                            {/* Preview Area */}
                            <Box flex="1" h="calc(100vh - 70px)" p={6} overflow="hidden" display="flex" flexDirection="column">
                                <MergeVideo selectedUser={selectedUser} MergeData={MergeData} setMergeData={setMergeData} />
                            </Box>
                        </Flex>
                    ) : activeTab === "Add Music" ? (
                        <AddMusic selectedUser={selectedUser} />
                    ) : (
                        <Flex flex="1" overflow="hidden">
                            {/* Panel */}
                            <Box w={{ base: "100%", md: "350px" }} h="calc(100vh - 70px)" overflowY="auto" p={4} flexShrink={0} sx={{ "&::-webkit-scrollbar": { display: "none" }, msOverflowStyle: "none", scrollbarWidth: "none", }}>
                                <Panel activeTab={activeTab} onDataChange={handleDataChange} model={model} setModel={setModel} duration={duration} setDuration={setDuration} resolution={resolution} setResolution={setResolution} ratio={ratio} setRatio={setRatio} imageCreationSettings={imageCreationSettings} setImageCreationSettings={setImageCreationSettings} resizeImageSettings={resizeImageSettings} setResizeImageSettings={setResizeImageSettings} imageToVideoSettings={imageToVideoSettings} setImageToVideoSettings={setImageToVideoSettings} captionData={captionData} setCaptionData={setCaptionData} MergeData={MergeData} setMergeData={setMergeData} />
                            </Box>
                            {/* Preview Area */}
                            <Box flex="1" h="calc(100vh - 70px)" p={6} overflow="hidden" display="flex" flexDirection="column">
                                <PreviewArea 
                                generatedVideo={generatedVideo} setGeneratedVideo={setGeneratedVideo}
                                generatedImage={generatedImage} setGeneratedImage={setGeneratedImage} resizedImage={resizedImage} setResizedImage={setResizedImage} resetTrigger={resetTrigger} activeTab={activeTab} text={text} setText={setText} images={images} setImages={setImages} loadingImages={loadingImages} setLoadingImages={setLoadingImages} sending={sending} setSending={setSending} model={model} duration={duration} setDuration={setDuration} resolution={resolution} setResolution={setResolution} ratio={ratio} imageCreationSettings={imageCreationSettings} resizeImageSettings={resizeImageSettings} imageToVideoSettings={imageToVideoSettings} selectedUser={selectedUser} />
                            </Box>
                        </Flex>
                    )}
                </Flex>
            )}
        </Flex>
    );
}
