import React from "react";
import { Box, VStack, Text, Input } from "@chakra-ui/react";

const CompressImagePanel = ({ compressdata, setcompressdata, textcolor }) => {
  return (
    <VStack align="stretch" spacing={4}>
      {/* Target Size */}
      <Box>
        <Text fontWeight="bold">Target Size (MB)</Text>
        <Input
          type="number"
          placeholder="Enter target size in MB"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={compressdata.target_size_mb}
          onChange={(e) =>
            setcompressdata((prev) => ({ ...prev, target_size_mb: e.target.value }))
          }
          mt={2}
        />
      </Box>

      {/* Quality */}
      <Box>
        <Text fontWeight="bold">Quality (1–100)</Text>
        <Input
          type="number"
          min="1"
          max="100"
          placeholder="85"
          _placeholder={{ color: textcolor }}
          color={textcolor}
          value={compressdata.quality}
          onChange={(e) =>
            setcompressdata((prev) => ({ ...prev, quality: e.target.value }))
          }
          mt={2}
        />
      </Box>
    </VStack>
  );
};

export default CompressImagePanel;
