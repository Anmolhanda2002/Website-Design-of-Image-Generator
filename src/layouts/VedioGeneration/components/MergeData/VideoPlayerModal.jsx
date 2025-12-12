import React, { useState } from "react";
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody } from "@chakra-ui/react";

export default function VideoPlayerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  const openVideo = (url) => {
    setVideoUrl(url);
    setIsOpen(true);
  };

  const closeVideo = () => {
    setIsOpen(false);
    setVideoUrl(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeVideo} size="5xl">
      <ModalOverlay />
      <ModalContent bg="black">
        <ModalCloseButton color="white" />
        <ModalBody p={0}>
          {videoUrl && (
            <video src={videoUrl} controls autoPlay style={{ width: "100%", height: "500px", objectFit: "contain" }} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
