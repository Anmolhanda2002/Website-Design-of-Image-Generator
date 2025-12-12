import React from "react";
import { VStack, Box, Text, Input, useToast } from "@chakra-ui/react";
import axios from "axios";

const AddMusicPanel = ({ MusicData, SetMusicData, textcolor, axiosInstance }) => {
  const toast = useToast();

  // Handle Brand Outro Music Upload
  const handleMusicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Replace previous music (Re-Upload supported)
    SetMusicData((prev) => ({
      ...prev,
      brand_outro_music: file,
      brand_music_url: "", // clear previous URL
    }));

    try {
      const formData = new FormData();
      formData.append("music_urls", file);

      const res = await axiosInstance.post("/upload_direct_music/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.music_urls?.length > 0) {
        const url = res.data.music_urls[0];

        SetMusicData((prev) => ({
          ...prev,
          brand_music_url: url, // new URL from API
        }));

        toast({
          title: "Music Uploaded Successfully!",
          status: "success",
          position: "top-right",
        });
      } else {
        throw new Error("URL not found");
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to upload music",
        status: "error",
        position: "top-right",
      });
    }
  };

  return (
    <VStack align="stretch" spacing={4} p={4}>
      {/* Merge ID */}
      <Box>
        <Text fontWeight="bold">Merge ID</Text>
        <Input
          type="text"
          placeholder="Enter merge ID"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.merge_id}
          onChange={(e) =>
            SetMusicData((prev) => ({ ...prev, merge_id: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* User ID */}
      <Box>
        <Text fontWeight="bold">User ID</Text>
        <Input
          type="text"
          placeholder="Enter user ID"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.user_id}
          onChange={(e) =>
            SetMusicData((prev) => ({ ...prev, user_id: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* Brand Music URL */}
      <Box>
        <Text fontWeight="bold">Brand Music URL (Optional)</Text>
        <Input
          type="text"
          placeholder="Paste music URL"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={MusicData.brand_music_url}
          onChange={(e) =>
            SetMusicData((prev) => ({
              ...prev,
              brand_music_url: e.target.value,
            }))
          }
          mt={2}
        />
      </Box>

      {/* Brand Outro Music Upload */}
      <Box>
        <Text fontWeight="bold">
          {MusicData.brand_outro_music
            ? "Re-Upload Music"
            : "Brand Outro Music (Upload)"}
        </Text>

        <Input
          type="file"
          accept="audio/*"
          color={textcolor}
          onChange={handleMusicUpload}
          mt={2}
        />
      </Box>
    </VStack>
  );
};

export default AddMusicPanel;
