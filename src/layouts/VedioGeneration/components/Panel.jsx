import React, { useRef, useCallback, useState, useEffect, startTransition, memo } from "react";
import {
  Box,
  VStack,
  Text,
  Spinner,
  useToast,
  useColorModeValue,
  useColorMode,
} from "@chakra-ui/react";

// Lazy load heavy panels for performance
const StudioShotPanel = React.lazy(() => import("../Panel/StudioShotPanel"));
const ImageCreationPanel = React.lazy(() => import("../Panel/ImageCreationPanel"));
const ResizeImagePanel = React.lazy(() => import("../Panel/ResizeImagePanel"));
const CompressImagePanel = React.lazy(() => import("../Panel/CompressImagePanel"));
const ImageToVideoPanel = React.lazy(() => import("../Panel/ImageToVideoPanel"));
const EditVideoPanel = React.lazy(() => import("../Panel/EditVideoPanel"));
const CaptionSegmentPanel = React.lazy(() => import("../Panel/CaptionSegmentPanel"));
const MergeVideoPanel = React.lazy(() => import("../Panel/MergeVideoPanel"));
const AddMusicPanel = React.lazy(() => import("../Panel/MusicPanel"));

// Axios instance
import axiosInstance from "utils/AxiosInstance";

export default memo(function Panel({
  activeTab,
  model,
  setModel,
  duration,
  setDuration,
  resolution,
  setResolution,
  ratio,
  setRatio,
  onDataChange,

  // Image creation
  imageCreationSettings,
  setImageCreationSettings,

  // Resize image
  resizeImageSettings,
  setResizeImageSettings,

  // Image to video
  imageToVideoSettings,
  setImageToVideoSettings,

  // Caption segment
  captionData,
  setCaptionData,

  // Merge video
  MergeData,
  setMergeData,

  // Music
  MusicData,
  SetMusicData,

  // Bulk image & compress
  selectedUser,
  bulkImageData,
  setBulkImageData,
  compressdata,
  setcompressdata,
}) {
  // Theme colors
  const panelBg = useColorModeValue("white", "gray.800");
  const textcolor = useColorModeValue("black", "white");
  const { colorMode } = useColorMode();
  const toast = useToast();


  console.log(bulkImageData)
  // ---------------------------
  // State variables
  // ---------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useCases, setUseCases] = useState([]);
  const [loadingUseCase, setLoadingUseCase] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [lifestyleIds, setLifestyleIds] = useState([]);
  const [dropdownData, setDropdownData] = useState({
    video_dimensions_choices: {},
    sector_choices: [],
    M_key: {},
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const prevUserIdRef = useRef(null);
  const searchTimeout = useRef(null);

  // ---------------------------
  // Helpers
  // ---------------------------
  const generateShortUUID = () =>
    `PRD-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`.slice(0, 48);

  // ---------------------------
  // API Calls
  // ---------------------------

  const loadAllGuidelines = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const selected = JSON.parse(localStorage.getItem("selected_user"));
      const userId = selected?.user_id || user?.user_id;

      const res = await axiosInstance.get("/list_active_image_guidelines/", {
        params: { name: "", user_id: userId, limit: 50, page: 1 },
      });

      const result = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data)
        ? res.data
        : [];

      setGuidelines(result);
    } catch (err) {
      console.error("Error fetching guidelines:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async (searchTerm = "") => {
    setLoadingProjects(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const selected = JSON.parse(localStorage.getItem("selected_user"));
      const userId = selected?.user_id || user?.user_id;

      const res = await axiosInstance.get("/saved_projects/", {
        params: { user_id: userId, project_name: searchTerm },
      });

      const result = Array.isArray(res.data?.data) ? res.data.data : [];
      setProjects(result);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const fetchUseCases = useCallback(async () => {
    setLoadingUseCase(true);
    try {
      const res = await axiosInstance.get("/get_image_guideline_choices");
      const data = res.data?.data?.use_case_choices || {};
      setUseCases(Object.entries(data).map(([label, value]) => ({ label, value })));
    } catch (err) {
      console.error("Error fetching use case choices:", err);
    } finally {
      setLoadingUseCase(false);
    }
  }, []);

  const fetchDropdowns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/get_creation_dropdowns/");
      if (res.data.status === "success") setDropdownData(res.data.data);
    } catch (err) {
      toast({
        title: "Error fetching dropdown data",
        description: err.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchLifestyleIds = useCallback(async () => {
    if (!selectedUser?.user_id) return;
    try {
      const res = await axiosInstance.get(`/get_lifestyle_ids/?user_id=${selectedUser.user_id}`);
      setLifestyleIds(res.data.lifestyle_ids || []);
    } catch (err) {
      console.error("Error fetching lifestyle IDs", err);
    }
  }, [selectedUser]);

  // ---------------------------
  // Upload Handlers
  // ---------------------------
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video_files", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const res = await axiosInstance.post("/upload_direct_video/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });

      const url = res.data?.video_urls?.[0];
      if (url) {
        startTransition(() => setMergeData({ ...MergeData, brand_outro_video_url: url }));
        toast({
          title: "Video Uploaded Successfully",
          description: "Brand outro URL filled automatically.",
          status: "success",
          duration: 2000,
        });
      }
    } catch (err) {
      toast({ title: "Upload Failed", status: "error", duration: 2500 });
    } finally {
      setUploading(false);
    }
  };

  // ---------------------------
  // Effects
  // ---------------------------
  useEffect(() => {
    if (activeTab === "Image Creation") fetchUseCases();
  }, [activeTab, fetchUseCases]);

  useEffect(() => {
    if (activeTab === "Image to Video") fetchLifestyleIds();
  }, [activeTab, fetchLifestyleIds]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.user_id)
      setImageToVideoSettings((prev) => ({
        ...prev,
        customer_ID: `CRM-${user.user_id}`,
        product_ID: generateShortUUID(),
      }));
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    const currentUserId = selectedUser?.user_id;
    if (!currentUserId) return;

    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      loadAllGuidelines();
      fetchProjects();
    }
  }, [selectedUser, loadAllGuidelines, fetchProjects]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      loadAllGuidelines();
      fetchProjects();
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      loadAllGuidelines();
      fetchProjects(searchTerm);
    }, 400);
  }, [searchTerm, loadAllGuidelines, fetchProjects]);

  // ---------------------------
  // Render Panel Content
  // ---------------------------
  const renderPanelContent = () => {
    switch (activeTab) {
      case "Studio Shot":
        return <StudioShotPanel bulkImageData={bulkImageData} setBulkImageData={setBulkImageData} guidelines={guidelines} searchTerm={searchTerm} setSearchTerm={setSearchTerm} loading={loading} colorMode={colorMode} textcolor={textcolor} />;
      case "Image Creation":
        return <ImageCreationPanel imageCreationSettings={imageCreationSettings} setImageCreationSettings={setImageCreationSettings} guidelines={guidelines} useCases={useCases} searchTerm={searchTerm} setSearchTerm={setSearchTerm} loading={loading} loadingUseCase={loadingUseCase} colorMode={colorMode} textcolor={textcolor} />;
      case "Resize Image":
        return <ResizeImagePanel resizeImageSettings={resizeImageSettings} setResizeImageSettings={setResizeImageSettings} colorMode={colorMode} textcolor={textcolor} />;
      case "Compress Image":
        return <CompressImagePanel compressdata={compressdata} setcompressdata={setcompressdata} textcolor={textcolor} />;
      case "Image to Video":
        return <ImageToVideoPanel imageToVideoSettings={imageToVideoSettings} setImageToVideoSettings={setImageToVideoSettings} lifestyleIds={lifestyleIds} sector_choices={dropdownData.sector_choices} M_key={dropdownData.M_key} video_dimensions_choices={dropdownData.video_dimensions_choices} projectSearch={projectSearch} setProjectSearch={setProjectSearch} projects={projects} loadingProjects={loadingProjects} fetchProjects={fetchProjects} colorMode={colorMode} textcolor={textcolor} panelBg={panelBg} />;
      case "Edit Video":
        return <EditVideoPanel mergeData={MergeData} setMergeData={setMergeData} textcolor={textcolor} />;
      case "Caption Segment":
        return <CaptionSegmentPanel captionData={captionData} setCaptionData={setCaptionData} colorMode={colorMode} textcolor={textcolor} />;
      case "Merge Video":
        return <MergeVideoPanel MergeData={MergeData} setMergeData={setMergeData} colorMode={colorMode} textcolor={textcolor} handleVideoUpload={handleVideoUpload} uploading={uploading} uploadProgress={uploadProgress} />;
      case "Add Music":
        return <AddMusicPanel MusicData={MusicData} SetMusicData={SetMusicData} textcolor={textcolor} axiosInstance={axiosInstance} />;
      default:
        return <Text>⚙️ Adjust your {activeTab} settings here</Text>;
    }
  };

  // ---------------------------
  // Main Render
  // ---------------------------
  if (loading && !dropdownData.sector_choices.length) return <Spinner size="lg" mt={5} />;

  return (
    <VStack
      w="100%"
      h="100%"
      bg={panelBg}
      p={4}
      borderRadius="lg"
      align="stretch"
      spacing={6}
      overflowY="auto"
      sx={{
        "&::-webkit-scrollbar": { width: "6px", background: "transparent" },
        "&::-webkit-scrollbar-thumb": { background: "transparent", borderRadius: "3px" },
        "&:hover::-webkit-scrollbar-thumb": { background: "#ccc" },
      }}
    >
      <React.Suspense fallback={<Spinner size="md" />}>{renderPanelContent()}</React.Suspense>
    </VStack>
  );
});
