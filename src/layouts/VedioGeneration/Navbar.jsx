// src/components/Navbar.jsx
import React from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
  VStack,
} from "@chakra-ui/react";
import { MdArrowBack } from "react-icons/md";
import { SearchIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import Image from "assets/image.png";

const Navbar = ({
  isManager,
  selectedUser,
  setSelectedUser,
  filteredUsers,
  handleSearch,
  dropdownLoading,
  onOpen,
}) => {
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const bg = useColorModeValue("white", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const menuBg = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "0 2px 8px rgba(0,0,0,0.05)",
    "0 2px 8px rgba(255,255,255,0.08)"
  );
  const inputBg = useColorModeValue("gray.50", "#0B1437");
  const inputBorder = useColorModeValue("gray.200", "#1A2A6C");
  const inputColor = useColorModeValue("gray.800", "white");
  const placeholderColor = useColorModeValue("gray.500", "gray.300");
  const selectedBg = useColorModeValue("gray.200", "#24357A");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleSelectUser = (u) => {
    if (!u) {
      setSelectedUser(user);
      localStorage.setItem("selected_user", JSON.stringify(user));
    } else {
      setSelectedUser(u);
      localStorage.setItem("selected_user", JSON.stringify(u));
    }
  };

  const renderMenuList = () => (
    <MenuList
      p={3}
      borderRadius="md"
      bg={menuBg}
      boxShadow={shadow}
      minW="220px"
      maxH="300px"
      overflowY="auto"
    >
      <InputGroup mb={2}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search users..."
          size="sm"
          onChange={handleSearch}
          bg={inputBg}
          borderColor={inputBorder}
          color={inputColor}
          _placeholder={{ color: placeholderColor }}
        />
      </InputGroup>

      <MenuItem
        onClick={() => handleSelectUser(null)}
        borderRadius="md"
        _hover={{ bg: hoverBg }}
        fontWeight={!selectedUser || selectedUser?.user_id === user.user_id ? "600" : "normal"}
        bg={!selectedUser ? selectedBg : "transparent"}
      >
        Own
      </MenuItem>

      {dropdownLoading ? (
        <Flex justify="center" align="center" py={2}>
          <Spinner size="sm" />
        </Flex>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((u) => (
          <MenuItem
            key={u.user_id}
            onClick={() => handleSelectUser(u)}
            borderRadius="md"
            fontWeight={selectedUser?.user_id === u.user_id ? "600" : "normal"}
            bg={selectedUser?.user_id === u.user_id ? selectedBg : "transparent"}
            _hover={{ bg: selectedUser?.user_id === u.user_id ? selectedBg : hoverBg }}
          >
            {u.username}
          </MenuItem>
        ))
      ) : (
        <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
          No users found
        </Text>
      )}
    </MenuList>
  );

  return (
    <Box w="100%" bg={bg} borderBottom="1px solid" borderColor={borderColor} shadow="sm">
      <Flex h="60px" px={{ base: 3, md: 6 }} align="center" justify="space-between">
        {/* Left Section */}
        <Flex align="center" gap={3}>
          <Button
            onClick={() => navigate(-1)}
            size="sm"
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            p={2}
            borderRadius="full"
          >
            <MdArrowBack size={18} />
          </Button>

          <Flex align="center" gap={2}>
            <Box as="img" src={Image} alt="Hygaar Logo" boxSize="30px" borderRadius="md" />
            <Text fontSize="lg" fontWeight="bold" noOfLines={1} maxW="120px">
              Hygaar
            </Text>
          </Flex>
        </Flex>

        {/* Right Section */}
        <HStack spacing={2}>
          {isManager && isDesktop && (
            <Menu isLazy>
              <MenuButton
                as={Button}
                size="sm"
                variant="outline"
                borderRadius="md"
              >
                {selectedUser ? selectedUser.username : "Own"}
              </MenuButton>
              {renderMenuList()}
            </Menu>
          )}

          <Button
            onClick={toggleColorMode}
            size="sm"
            variant="ghost"
            p={2}
            borderRadius="full"
          >
            {colorMode === "light" ? "🌙" : "☀️"}
          </Button>

          {isMobile && (
            <Button onClick={onOpen} variant="ghost" p={2} borderRadius="full">
              <HamburgerIcon boxSize={6} />
            </Button>
          )}
        </HStack>
      </Flex>

      {/* Mobile Dropdown below navbar */}
      {isManager && isMobile && (
        <VStack
          px={3}
          py={2}
          bg={bg}
          align="start"
          spacing={2}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Menu isLazy>
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              borderColor={borderColor}
              _hover={{ bg: hoverBg }}
              w="100%"
              textAlign="left"
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              {selectedUser ? selectedUser.username : "Own"}
            </MenuButton>
            {renderMenuList()}
          </Menu>
        </VStack>
      )}
    </Box>
  );
};

export default Navbar;
