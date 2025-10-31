import React from "react";
import {
  Flex,
  Textarea,
  IconButton,
  Box,
  Image,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon, ArrowUpIcon } from "@chakra-ui/icons";

export default function ResizeImageInput({
  text,
  setText,
  images,
  uploading,
  submitting,
  handleImageChangeSingle,
  handleSubmit,
  borderColor,
  panelBg,
}) {
  return (
    <Flex
      direction="column"
      bg={panelBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      p={3}
      gap={3}
    >
      <Textarea
        placeholder="Write something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        resize="none"
        bg={useColorModeValue("gray.100", "gray.700")}
        borderColor={borderColor}
        fontSize="sm"
      />

      <Flex justify="space-between" align="center" gap={2}>
        <label htmlFor="file-upload-single">
          <IconButton
            as="span"
            icon={uploading ? <Spinner size="sm" /> : <AddIcon />}
            aria-label="Upload"
            bg="blue.500"
            color="white"
            borderRadius="md"
            size="sm"
            _hover={{ bg: "blue.600" }}
            isDisabled={uploading}
          />
        </label>
        <input
          id="file-upload-single"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChangeSingle}
        />

        <Box flex="1" h="60px" display="flex" alignItems="center" justifyContent="center">
          {images[0] && (
            <Image
              src={images[0].url}
              alt="preview"
              boxSize="50px"
              objectFit="cover"
              borderRadius="sm"
              border="1px solid"
              borderColor={borderColor}
            />
          )}
        </Box>

        <IconButton
          icon={submitting ? <Spinner size="sm" /> : <ArrowUpIcon />}
          aria-label="Send"
          bg="green.500"
          color="white"
          borderRadius="md"
          size="sm"
          _hover={{ bg: "green.600" }}
          onClick={handleSubmit}
          isDisabled={submitting || uploading}
        />
      </Flex>
    </Flex>
  );
}
