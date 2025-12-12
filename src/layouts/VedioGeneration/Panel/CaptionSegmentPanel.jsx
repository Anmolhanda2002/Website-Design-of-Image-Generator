import React from "react";
import { VStack, Box, Flex, Input, Select, Text } from "@chakra-ui/react";

const CaptionSegmentPanel = ({ captionData, setCaptionData, colorMode, textcolor }) => {
  return (
    <VStack align="stretch" spacing={4} p={4}>
      {/* Segment Number */}
      <Box>
        <Text fontWeight="bold">Segment Number</Text>
        <Input
          type="number"
          placeholder="Enter segment number"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={captionData.segment_number || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({
              ...prev,
              segment_number: e.target.value === "" ? "" : Number(e.target.value),
            }))
          }
          mt={2}
        />
      </Box>

      {/* Caption Text */}
      <Box>
        <Text fontWeight="bold">Caption Text</Text>
        <Input
          placeholder="Enter caption text"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={captionData.text || ""}
          onChange={(e) =>
            setCaptionData((prev) => ({ ...prev, text: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* Start / End Time */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Start Time</Text>
          <Input
            type="number"
            placeholder="e.g. 0.25"
            _placeholder={{ color: textcolor }}
            color={textcolor}
            value={captionData.start_time || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                start_time: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">End Time</Text>
          <Input
            type="number"
            placeholder="e.g. 4.0"
            _placeholder={{ color: textcolor }}
            color={textcolor}
            value={captionData.end_time || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                end_time: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* Font Settings */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Font Size (px)</Text>
          <Input
            type="number"
            placeholder="e.g. 52"
            _placeholder={{ color: textcolor }}
            color={textcolor}
            value={captionData.font_size || ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                font_size: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Font Color</Text>
          <Input
            type="color"
            value={captionData.font_color || "#ffffff"}
            
            onChange={(e) =>
              setCaptionData((prev) => ({ ...prev, font_color: e.target.value }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* Background Settings */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">Background Color</Text>
          <Input
            type="color"
            color={textcolor}
            value={captionData.background_color || "#000000"}
            onChange={(e) =>
              setCaptionData((prev) => ({ ...prev, background_color: e.target.value }))
            }
            mt={2}
          />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Background Opacity (0–1)</Text>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="1"
            color={textcolor}
            placeholder="e.g. 0.9"
            value={captionData.background_opacity ?? ""}
            onChange={(e) =>
              setCaptionData((prev) => ({
                ...prev,
                background_opacity: e.target.value === "" ? "" : Number(e.target.value),
              }))
            }
            mt={2}
          />
        </Box>
      </Flex>

      {/* Position */}
      <Flex gap={4}>
        <Box flex="1">
          <Text fontWeight="bold">X Position</Text>
          <Input
            placeholder="e.g. 5%"
            value={captionData.x || ""}
            onChange={(e) => setCaptionData((prev) => ({ ...prev, x: e.target.value }))}
            mt={2}
            color={textcolor}
          />
        </Box>
        <Box flex="1">
          <Text fontWeight="bold">Y Position</Text>
          <Input
            placeholder="e.g. 10%"
            value={captionData.y || ""}
            onChange={(e) => setCaptionData((prev) => ({ ...prev, y: e.target.value }))}
            mt={2}
            color={textcolor}
          />
        </Box>
      </Flex>

      {/* Animation */}
      <Box>
        <Text fontWeight="bold">Animation</Text>
        <Select
          placeholder="Select animation"
          value={captionData.animation || ""}
          onChange={(e) => setCaptionData((prev) => ({ ...prev, animation: e.target.value }))}
          mt={2}
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
            },
          }}
        >
          <option value="none">None</option>
          <option value="fade">Fade</option>
          <option value="flash">Flash</option>
          <option value="slide">Slide</option>
          <option value="zoom">Zoom</option>
        </Select>
      </Box>

      {/* Animation Speed */}
      <Box>
        <Text fontWeight="bold">Animation Speed</Text>
        <Select
          placeholder="Select speed"
          value={captionData.animation_speed || ""}
          onChange={(e) => setCaptionData((prev) => ({ ...prev, animation_speed: e.target.value }))}
          mt={2}
          sx={{
            "& option": {
              backgroundColor: colorMode === "dark" ? "#14225C" : "#FFFFFF",
              color: colorMode === "dark" ? "#FFFFFF" : "#14225C",
            },
          }}
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </Select>
      </Box>
    </VStack>
  );
};

export default CaptionSegmentPanel;
