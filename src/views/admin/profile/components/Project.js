// Chakra imports
import {
  Box,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
// Assets
import { MdEdit } from "react-icons/md";

export default function Project(props) {
  const { title, image, createdAt, projectId, boxShadow,subtitle, ...rest } = props;

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.500";
  const brandColor = useColorModeValue("brand.500", "white");
  const bg = useColorModeValue("white", "navy.700");

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card bg={bg} boxShadow={boxShadow} {...rest} p="14px">
      <Flex align="center" direction={{ base: "column", md: "row" }}>
        <Image h="80px" w="80px" src={image} borderRadius="8px" me="20px" />
        <Box mt={{ base: "10px", md: "0" }}>
          <Text
            color={textColorPrimary}
            fontWeight="500"
            fontSize="md"
            mb="4px"
          >
            {title}
          </Text>
          <Text fontSize="sm" color={textColorSecondary}>
            {/* Created on {formatDate(createdAt)} •{" "} */}
            {/* <Link
              color={brandColor}
              fontWeight="semibold"
              href={`/projects/${projectId}`}
            >
              See project details
            </Link> */}
            {subtitle}
          </Text>
        </Box>
        <Link
          href={`/projects/${projectId}`}
          variant="no-hover"
          me="16px"
          ms="auto"
          p="0px !important"
        >
          <Icon as={MdEdit} color="secondaryGray.500" h="18px" w="18px" />
        </Link>
      </Flex>
    </Card>
  );
}
