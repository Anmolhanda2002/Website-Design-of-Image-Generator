// MobileLayout.jsx
import React, { Suspense } from "react";
import {
  Flex,
  Box,
  Slide,
  useDisclosure,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";

// Eager imports for small components that you already used
import CompressImage from "./components/CompressImage/CompressImage";
import BulkImageCreation from "./components/BulkImage/BulkImageCreation";

// Lazy-loaded heavy sections (keeps bundle small)
const Panel = React.lazy(() => import("./components/Panel"));
const PreviewArea = React.lazy(() => import("./components/Privewarea"));
const EditVedioComponent = React.lazy(() =>
  import("./components/EditPreviewBox/EditPreviewBox")
);
const CaptionedSegment = React.lazy(() =>
  import("./components/CaptionSegment/CaptionSegment")
);
const CaptionedEdit = React.lazy(() =>
  import("./components/CaptionEdit/CaptionEdit")
);
const MergeVideo = React.lazy(() => import("./components/MergeData/MergeVideo"));
const AddMusic = React.lazy(() => import("./components/AddMusicVideo/AddMusic"));

/**
 * MobileLayout
 * Accepts *all* props similar to DesktopLayout so mobile and desktop are functionally consistent.
 */
export default function MobileLayout(props) {
  // --- destructure EVERYTHING we might need and pass-through to children ---
  const {
    activeTab,
    setActiveTab,
    handleSetActiveTab, // optional alias used by desktop
    selectedUser,
    images,
    setImages,
    generatedVideo,
    setGeneratedVideo,
    generatedImage,
    setGeneratedImage,
    resizedImage,
    setResizedImage,
    previewData,
    setPreviewData,
    text,
    setText,
    loadingImages,
    setLoadingImages,
    sending,
    setSending,
    model,
    setModel,
    duration,
    setDuration,
    resolution,
    setResolution,
    ratio,
    setRatio,
    imageCreationSettings,
    setImageCreationSettings,
    resizeImageSettings,
    setResizeImageSettings,
    imageToVideoSettings,
    setImageToVideoSettings,
    captionData,
    setCaptionData,
    MergeData,
    setMergeData,
    BulkData,
    setBulkData,
    compressdata,
    setcompressdata,
    MusicData,
    SetMusicData,
    lastimagetovideo,
    setlastimagetovideo,
    lifestyleSelected,
    IsOutsideLifestyleShot,
    loading, // generic loading flag if used
    guidelines, // for studio shot panel
    searchTerm,
    setSearchTerm,
    colorMode,
    textcolor,
    isManager,
    resetTrigger,
    setclone,
    setclonecreationid,
    setclonecreationid: setCloneCreationIdAlias, // in case of different naming
    // anything else — pass via props variable
  } = props;

  // prefer handleSetActiveTab if provided, otherwise fallback to setActiveTab
  const changeTab = handleSetActiveTab || setActiveTab;

  const { isOpen, onToggle } = useDisclosure();

  return (
    <Flex direction="column" flex="1" overflow="auto" p={3} pb="120px">
      <Suspense
        fallback={
          <Flex flex="1" justify="center" align="center">
            <Spinner />
          </Flex>
        }
      >
        {/* ---------- FULL-PAGE / SINGLE-COMPONENT TABS ---------- */}
        {activeTab === "Studio Shot" && (
          <BulkImageCreation
            IsOutsideLifestyleShot={IsOutsideLifestyleShot}
            lifestyleSelected={lifestyleSelected}
            selectedUser={selectedUser}
            bulkImageData={BulkData}
            setBulkImageData={setBulkData}
            setImages={setImages}
            setlastimagetovideo={setlastimagetovideo}
            setActiveTab={changeTab}
            guidelines={guidelines}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            loading={loading}
            colorMode={colorMode}
            textcolor={textcolor}
          />
        )}

        {activeTab === "Edit Video" && (
          <EditVedioComponent
            selectedUser={selectedUser}
            previewData={previewData}
            setActiveTab={changeTab}
            setImages={setImages}
            setlastimagetovideo={setlastimagetovideo}
            setclone={setclone}
            setclonecreationid={setclonecreationid || setCloneCreationIdAlias}
          />
        )}

        {activeTab === "Caption Segment" && (
          <CaptionedSegment
            selectedUser={selectedUser}
            captionData={captionData}
            setCaptionData={setCaptionData}
          />
        )}

        {activeTab === "Captioned Edit" && (
          <CaptionedEdit
            selectedUser={selectedUser}
            MergeData={MergeData}
            setMergeData={setMergeData}
          />
        )}

        {activeTab === "Add Music" && (
          <AddMusic
            selectedUser={selectedUser}
            MusicData={MusicData}
            SetMusicData={SetMusicData}
          />
        )}

        {/* ---------- TABS THAT SHOW MAIN CONTENT (Preview / Compress / Merge) ---------- */}
        {/* Merge Video (main content) */}
        {activeTab === "Merge Video" && (
          <Box bg="gray.800" _light={{ bg: "white" }} p={4} rounded="2xl" shadow="md">
            <MergeVideo selectedUser={selectedUser} MergeData={MergeData} setMergeData={setMergeData} />
          </Box>
        )}

        {/* Compress Image (main content) */}
        {activeTab === "Compress Image" && (
          <Box bg="gray.800" _light={{ bg: "white" }} p={4} rounded="2xl" shadow="md">
            <CompressImage selectedUser={selectedUser} compressdata={compressdata} setcompressdata={setcompressdata} />
          </Box>
        )}

        {/* Tabs that show preview area (Preview + Panel) */}
        {["Image Creation", "Resize Image", "Image to Video"].includes(activeTab) && (
          <Box bg="gray.800" _light={{ bg: "white" }} p={4} rounded="2xl" shadow="md">
            <PreviewArea
              setlastimagetovideo={setlastimagetovideo}
              setActiveTab={changeTab}
              generatedVideo={generatedVideo}
              setGeneratedVideo={setGeneratedVideo}
              generatedImage={generatedImage}
              setGeneratedImage={setGeneratedImage}
              resizedImage={resizedImage}
              setResizedImage={setResizedImage}
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
              activeTab={activeTab}
              imageCreationSettings={imageCreationSettings}
              resizeImageSettings={resizeImageSettings}
              imageToVideoSettings={imageToVideoSettings}
              selectedUser={selectedUser}
              resetTrigger={resetTrigger}
            />
          </Box>
        )}

        {/* ---------- SLIDE-UP PANEL (GLOBAL for mobile) ---------- */}
        {/* The slide can be toggled via the floating arrow. The inner panel content is a scrollable box. */}
        <Slide direction="bottom" in={isOpen} style={{ zIndex: 9999 }}>
          <Box
            bg="gray.900"
            _light={{ bg: "white" }}
            pt="60px" // space for the circle arrow handle
            pb={5}
            px={4}
            shadow="xl"
            roundedTop="2xl"
            borderTop="3px solid"
            borderColor="blue.400"
            position="relative"
            maxH="75vh"
          >
            {/* Center circular arrow handle */}
            <Box
              position="absolute"
              top="-28px"
              left="50%"
              transform="translateX(-50%)"
              w="55px"
              h="55px"
              bg="gray.900"
              _light={{ bg: "white" }}
              rounded="full"
              border="2px solid"
              borderColor="blue.400"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="lg"
              cursor="pointer"
              onClick={onToggle}
              zIndex="10000"
            >
              {isOpen ? (
                <ChevronDownIcon boxSize={7} color="blue.300" />
              ) : (
                <ChevronUpIcon boxSize={7} color="blue.300" />
              )}
            </Box>

            {/* Scrollable inner panel content (only this scrolls) */}
            <Box
              maxH="60vh"
              overflowY="auto"
              pr={2}
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#4A90E2",
                  borderRadius: "10px",
                },
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Pass full set of props to Panel to match Desktop behavior */}
              <Panel
                setImages={setImages}
                bulkImageData={BulkData}
                setBulkImageData={setBulkData}
                selectedUser={selectedUser}
                activeTab={activeTab}
                onDataChange={setPreviewData}
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
                MergeData={MergeData}
                setMergeData={setMergeData}
                compressdata={compressdata}
                setcompressdata={setcompressdata}
                MusicData={MusicData}
                SetMusicData={SetMusicData}
                lifestyleSelected={lifestyleSelected}
                IsOutsideLifestyleShot={IsOutsideLifestyleShot}
                guidelines={guidelines}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                loading={loading}
                colorMode={colorMode}
                textcolor={textcolor}
                isManager={isManager}
                resetTrigger={resetTrigger}
              />
            </Box>
          </Box>
        </Slide>
      </Suspense>
    </Flex>
  );
}
