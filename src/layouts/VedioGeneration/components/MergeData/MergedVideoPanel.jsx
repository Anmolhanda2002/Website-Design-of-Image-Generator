import React from "react";
import { VStack, Button, Text } from "@chakra-ui/react";
import VideoCard from "./VideoCard";

export default function MergedVideoPanel({ mergedVideo, resizedVideo, onBack }) {
  return (
    <VStack spacing={4} mt={4}>
      {mergedVideo && <VideoCard video={{ captioned_final_video_url: mergedVideo }} onSelect={() => {}} />}
      {resizedVideo && <VideoCard video={{ captioned_final_video_url: resizedVideo }} onSelect={() => {}} />}
      <Button variant="ghost" onClick={onBack}>
        Back
      </Button>
    </VStack>
  );
}
