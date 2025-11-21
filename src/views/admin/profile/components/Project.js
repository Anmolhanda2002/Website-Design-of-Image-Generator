// Chakra imports
import {
  Box,
  Flex,
  Icon,
  Image,
  Link,
  Text,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
import React from "react";
// Assets
import { MdMoreVert, MdEdit, MdDelete } from "react-icons/md";

export default function Project(props) {
  const { title, image, createdAt, projectId, boxShadow, subtitle, onEdit, onDelete, ...rest } = props;

  // Chakra Color Mode
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = "gray.500";

  return (
    <Card boxShadow={boxShadow} {...rest} p="14px">
      <Flex align="center">
        <Image h="80px" w="80px" src={image} borderRadius="8px" me="20px" />
        <Box flex="1">
          <Text
            color={textColorPrimary}
            fontWeight="500"
            fontSize="md"
            mb="4px"
            noOfLines={1}
            maxW={"120px"}
          >
            {title}
          </Text>

          <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
            {subtitle}
          </Text>
        </Box>

        {/* 3 Dots Menu */}
        {/* <Menu>
          <MenuButton
            as={IconButton}
            icon={<MdMoreVert />}
            variant="ghost"
            color={textColorSecondary}
            cursor="pointer"
          />
          <MenuList>
            <MenuItem icon={<MdEdit />} onClick={() => onEdit(projectId)}>
              Edit
            </MenuItem>
            <MenuItem
              icon={<MdDelete />}
              color="red.500"
              onClick={() => onDelete(projectId)}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu> */}
      </Flex>
    </Card>
  );
}
