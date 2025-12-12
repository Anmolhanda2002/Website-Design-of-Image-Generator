import React, { startTransition } from "react";
import { VStack, Box, Input, Select, Progress, Text } from "@chakra-ui/react";

const MergeVideoPanel = ({
  MergeData,
  setMergeData,
  colorMode,
  textcolor,
  handleVideoUpload,
  uploading,
  uploadProgress,
}) => {
  return (
    <VStack align="stretch" spacing={4} p={4}>
      {/* User ID */}
      <Box>
        <Text fontWeight="bold">User ID</Text>
        <Input
          _placeholder={{ color: textcolor }}
          color={textcolor}
          type="text"
          placeholder="Enter User ID"
          value={MergeData.user_id || ""}
          onChange={(e) =>
            startTransition(() =>
              setMergeData({ ...MergeData, user_id: e.target.value })
            )
          }
          mt={2}
        />
      </Box>

      {/* Edit ID */}
      <Box>
        <Text fontWeight="bold">Edit ID</Text>
        <Input
          _placeholder={{ color: textcolor }}
          color={textcolor}
          type="text"
          placeholder="Enter Edit ID"
          value={MergeData.edit_id || ""}
          onChange={(e) =>
            startTransition(() =>
              setMergeData({ ...MergeData, edit_id: e.target.value })
            )
          }
          mt={2}
        />
      </Box>

      {/* Brand Outro Video URL */}
      <Box>
        <Text fontWeight="bold">Brand Outro Video URL</Text>
        <Input
          _placeholder={{ color: textcolor }}
          color={textcolor}
          type="text"
          placeholder="Enter Brand Outro Video URL"
          value={MergeData.brand_outro_video_url || ""}
          onChange={(e) =>
            startTransition(() =>
              setMergeData({ ...MergeData, brand_outro_video_url: e.target.value })
            )
          }
          mt={2}
        />
      </Box>

      {/* Upload Brand Outro Video */}
      <Box>
        <Text fontWeight="bold" mb={2}>
          Upload Brand Outro Video
        </Text>
        <Input type="file" accept="video/*" onChange={handleVideoUpload} p={1} />
        {uploading && <Progress value={uploadProgress} size="sm" mt={2} borderRadius="md" />}
      </Box>

      {/* Enable Custom Resize */}
      <Box>
        <Text fontWeight="bold" mb={2}>
          Enable Custom Resize
        </Text>
        <Select
          value={MergeData.custom_resize ? "true" : "false"}
          onChange={(e) =>
            startTransition(() =>
              setMergeData({ ...MergeData, custom_resize: e.target.value === "true" })
            )
          }
          mt={2}
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
            },
          }}
        >
          <option value="false">False</option>
          <option value="true">True</option>
        </Select>
      </Box>

      {/* Custom Resize Options */}
      {MergeData.custom_resize && (
        <>
          <Box>
            <Text fontWeight="bold">Merge ID</Text>
            <Input
              _placeholder={{ color: textcolor }}
              color={textcolor}
              type="text"
              placeholder="Enter Merge ID"
              value={MergeData.mearg_id || ""}
              onChange={(e) =>
                startTransition(() =>
                  setMergeData({ ...MergeData, mearg_id: e.target.value })
                )
              }
              mt={2}
            />
          </Box>

          <Box>
            <Text fontWeight="bold">Height (px)</Text>
            <Input
              _placeholder={{ color: textcolor }}
              color={textcolor}
              type="number"
              placeholder="1080"
              value={MergeData.height || ""}
              onChange={(e) =>
                startTransition(() =>
                  setMergeData({ ...MergeData, height: e.target.value })
                )
              }
              mt={2}
            />
          </Box>

          <Box>
            <Text fontWeight="bold">Width (px)</Text>
            <Input
              _placeholder={{ color: textcolor }}
              color={textcolor}
              type="number"
              placeholder="1920"
              value={MergeData.width || ""}
              onChange={(e) =>
                startTransition(() =>
                  setMergeData({ ...MergeData, width: e.target.value })
                )
              }
              mt={2}
            />
          </Box>
        </>
      )}
    </VStack>
  );
};

export default MergeVideoPanel;
