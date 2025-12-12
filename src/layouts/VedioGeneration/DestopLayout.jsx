// DesktopLayout.jsx
import React, { Suspense } from "react";
import {
  Box,
  Flex,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import Sidebar from "./components/Sidebar";
const EditVedioComponent = React.lazy(() =>
  import("./components/EditPreviewBox/EditPreviewBox")
);
const CaptionedSegment = React.lazy(() =>
  import("./components/CaptionSegment/CaptionSegment")
);
const CaptionedEdit = React.lazy(() =>
  import("./components/CaptionEdit/CaptionedCombine")
);
const MergeVideo = React.lazy(() =>
  import("./components/MergeData/MergeVideo")
);
const AddMusic = React.lazy(() =>
  import("./components/AddMusicVideo/AddMusic")
);
const BulkImageCreation = React.lazy(() =>
  import("./components/BulkImage/BulkImageCreation")
);
const Panel = React.lazy(() => import("./components/Panel"));
const PreviewArea = React.lazy(() => import("./components/Privewarea"));
const CompressImage = React.lazy(() =>
  import("./components/CompressImage/CompressImage")
);

export default function DesktopLayout(props) {
  const {
    activeTab,
    handleSetActiveTab,
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
    resetTrigger
  } = props;

  const bgColor = useColorModeValue("gray.200", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");


  console.log("bulk",BulkData)
  return (
    <Flex flex="1" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="100px"
        h="calc(100vh - 70px)"
        overflowY="auto"
        flexShrink={0}
        sx={{
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      </Box>

      {/* Main content */}
      <Suspense
        fallback={
          <Flex flex="1" justify="center" align="center">
            <Spinner size="xl" thickness="4px" />
          </Flex>
        }
      >
        {activeTab === "Edit Video" ? (
          <Box
            flex="1"
            bg={bgColor}
            overflowY="auto"
            mt="-50px"
            sx={{
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <EditVedioComponent
              selectedUser={selectedUser}
              previewData={previewData}
              setActiveTab={handleSetActiveTab}
              setImages={setImages}
              setlastimagetovideo={setlastimagetovideo}
              setclone={props.setclone}
              setclonecreationid={props.setclonecreationid}
            />
          </Box>
        ) : activeTab === "Compress Image" ? (
          <Flex flex="1" overflow="auto">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                selectedUser={selectedUser}
                setcompressdata={setcompressdata}
                compressdata={compressdata}
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
              />
            </Box>

            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="auto"
              display="flex"
              flexDirection="column"
            >
              <CompressImage
                selectedUser={selectedUser}
                setcompressdata={setcompressdata}
                compressdata={compressdata}
              />
            </Box>
          </Flex>
        ) : activeTab === "Caption Segment" ? (
          <Flex flex="1" overflow="hidden">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                setcompressdata={setcompressdata}
                compressdata={compressdata}
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
              />
            </Box>
            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <CaptionedSegment
                selectedUser={selectedUser}
                captionData={captionData}
                setCaptionData={setCaptionData}
              />
            </Box>
          </Flex>
        ) : activeTab === "Captioned Edit" ? (
          <Box
            flex="1"
            h="calc(100vh - 70px)"
            p={6}
            overflow="auto"
            display="flex"
            flexDirection="column"
          >
            <CaptionedEdit
              selectedUser={selectedUser}
              MergeData={MergeData}
              setMergeData={setMergeData}
            />
          </Box>
        ) : activeTab === "Merge Video" ? (
          <Flex flex="1" overflow="hidden">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                setcompressdata={setcompressdata}
                compressdata={compressdata}
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
              />
            </Box>
            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="auto"
              display="flex"
              flexDirection="column"
            >
              <MergeVideo
                selectedUser={selectedUser}
                MergeData={MergeData}
                setMergeData={setMergeData}
              />
            </Box>
          </Flex>
        ) : activeTab === "Add Music" ? (
          <Flex flex="1" overflow="hidden">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                setcompressdata={setcompressdata}
                compressdata={compressdata}
                selectedUser={selectedUser}
                MusicData={MusicData}
                SetMusicData={SetMusicData}
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
              />
            </Box>
            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="auto"
              display="flex"
              flexDirection="column"
            >
              <AddMusic
                selectedUser={selectedUser}
                MusicData={MusicData}
                SetMusicData={SetMusicData}
              />
            </Box>
          </Flex>
        ) : activeTab === "Studio Shot" ? (
          <Flex flex="1" overflow="auto">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                setcompressdata={setcompressdata}
                compressdata={compressdata}
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
              />
            </Box>
            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="auto"
              display="flex"
              flexDirection="column"
            >
              <BulkImageCreation
                IsOutsideLifestyleShot={IsOutsideLifestyleShot}
                lifestyleSelected={lifestyleSelected}
                selectedUser={selectedUser}
                bulkImageData={BulkData}
                setBulkImageData={setBulkData}
                setImages={setImages}
                setlastimagetovideo={setlastimagetovideo}
                setActiveTab={handleSetActiveTab}
              />
            </Box>
          </Flex>
        ) : (
          <Flex flex="1" overflow="hidden">
            <Box
              w={{ base: "100%", md: "350px" }}
              h="calc(100vh - 70px)"
              overflowY="auto"
              p={4}
              flexShrink={0}
              sx={{
                "&::-webkit-scrollbar": { display: "none" },
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <Panel
                setcompressdata={setcompressdata}
                compressdata={compressdata}
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
              />
            </Box>
            <Box
              flex="1"
              h="calc(100vh - 70px)"
              p={6}
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <PreviewArea
                setlastimagetovideo={setlastimagetovideo}
                setActiveTab={handleSetActiveTab}
                generatedVideo={generatedVideo}
                setGeneratedVideo={setGeneratedVideo}
                generatedImage={generatedImage}
                setGeneratedImage={setGeneratedImage}
                resizedImage={resizedImage}
                setResizedImage={setResizedImage}
                resetTrigger={resetTrigger}
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
                setDuration={setDuration}
                resolution={resolution}
                setResolution={setResolution}
                ratio={ratio}
                imageCreationSettings={imageCreationSettings}
                resizeImageSettings={resizeImageSettings}
                imageToVideoSettings={imageToVideoSettings}
                selectedUser={selectedUser}
              />
            </Box>
          </Flex>
        )}
      </Suspense>
    </Flex>
  );
}
