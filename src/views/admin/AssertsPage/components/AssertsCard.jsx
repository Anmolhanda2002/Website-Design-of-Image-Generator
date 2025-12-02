import React from "react";
import { GridItem, Image, Text, Flex, Button, Skeleton } from "@chakra-ui/react";
import { DownloadIcon, ViewIcon } from "@chakra-ui/icons";

const AssetCard = React.memo(({ item, imageUrl, title, statusText, isFailed, onView, onDownload, cardBg, textColor }) => {
  return (
    <GridItem
      borderWidth="1px"
      borderRadius="md"
      overflow="hidden"
      p={3}
      bg={cardBg}
      shadow="md"
      transition="all 0.3s"
      _hover={{ transform: "scale(1.03)", shadow: "xl" }}
    >
      <Image
        src={imageUrl}
        alt={title}
        loading="lazy"
        borderRadius="md"
        objectFit="cover"
        height="200px"
        width="100%"
        fallback={<Skeleton height="200px" width="100%" />}
        cursor="pointer"
        onClick={onView}
      />

      <Text fontWeight="bold" color={textColor} mt={2} noOfLines={1}>
        {title}
      </Text>

      <Text fontSize="sm" color={isFailed ? "red.500" : "green.500"} mt={1}>
        {statusText}
      </Text>

      <Flex justify="space-between" mt={2}>
        <Button size="sm" leftIcon={<DownloadIcon />} colorScheme="blue" onClick={onDownload}>
          Download
        </Button>

        <Button size="sm" colorScheme="teal" variant="solid" p={0} w="35px" h="35px" borderRadius="full" onClick={onView}>
          <ViewIcon />
        </Button>
      </Flex>
    </GridItem>
  );
});

export default AssetCard;
