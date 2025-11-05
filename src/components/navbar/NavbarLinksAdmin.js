import React, { useState, useEffect, startTransition } from "react";
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { FaEthereum } from "react-icons/fa";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import { SearchIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "utils/AxiosInstance";
import routes from "routes";
import NavbarClock from "./NavbarClock";
import { SidebarResponsive } from "components/sidebar/Sidebar";

export default function HeaderLinks({ secondary }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // === Colors & Styles ===
  const menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("gray.800", "white");
  const navbarIcon = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");
  const shadow = useColorModeValue(
    "0 2px 8px rgba(0,0,0,0.05)",
    "0 2px 8px rgba(255,255,255,0.08)"
  );

  // === State ===
  const [user, setUser] = useState(null);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // === Selected user ===
  const [selectedUser, setSelectedUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("selected_user"));
    return storedUser || null;
  });

  // === Load user + routes ===
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) return setLoading(false);

    const normalizedUser = {
      ...storedUser,
      role:
        storedUser.roles && Array.isArray(storedUser.roles)
          ? storedUser.roles[0]
          : storedUser.role,
    };

    setUser(normalizedUser);
    setAllowedRoutes(
      routes.filter(
        (r) => r.layout === "/admin" && (!r.roles || r.roles.includes(normalizedUser.role))
      )
    );
    setLoading(false);
  }, []);

  // === Fetch user list (Manager only) ===
  useEffect(() => {
    if (!user || user.role !== "Manager") return;
    const fetchUsers = async () => {
      try {
        setDropdownLoading(true);
        const res = await axiosInstance.get("/my_user_dropdown/");
        if (res.data?.status === "success") {
          setAllUsers(res.data.users || []);
          setFilteredUsers(res.data.users || []);
        } else {
          toast({
            title: "Failed to load users",
            description: res.data?.message || "Unexpected response",
            status: "warning",
            duration: 2500,
          });
        }
      } catch (err) {
        toast({
          title: "Error fetching users",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 2500,
        });
      } finally {
        setDropdownLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  // === Search handler ===
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      allUsers.filter((u) => u.username.toLowerCase().includes(term))
    );
  };

  // === Select user ===
  const handleSelectUser = (u) => {
    if (u && Object.keys(u).length > 0) {
      setSelectedUser(u);
      localStorage.setItem("selected_user", JSON.stringify(u));
    } else {
      setSelectedUser(null);
      localStorage.removeItem("selected_user");
    }
  };

  // ✅ Sync localStorage every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = JSON.parse(localStorage.getItem("selected_user"));
      if (!stored && selectedUser) setSelectedUser(null);
      if (stored && (!selectedUser || stored.user_id !== selectedUser.user_id))
        setSelectedUser(stored);
    }, 2000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  // === Logout ===
  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      await axiosInstance.post("/auth/logout/", { refresh_token });
    } catch {}
    ["user", "access_token", "refresh_token"].forEach((k) =>
      localStorage.removeItem(k)
    );
    startTransition(() => navigate("/auth/sign-in", { replace: true }));
  };

  if (loading) return null;

  // === UI ===
  return (
    <Flex
      align="center"
      justify="space-between"
      w="100%"
      bg={menuBg}
      borderRadius="20px"
      px={{ base: 3, md: 5 }}
      py={{ base: 2, md: 3 }}
      boxShadow={shadow}
      flexWrap="wrap"
      gap={3}
    >
      {/* LEFT SECTION */}
      <Flex align="center" gap={3}>
        <NavbarClock />
        <SidebarResponsive routes={allowedRoutes} />
      </Flex>

      {/* CENTER SECTION */}
      {secondary && (
        <Flex
          align="center"
          bg={hoverBg}
          borderRadius="full"
          px={3}
          py={1}
          gap={2}
          display={{ base: "none", md: "flex" }}
        >
          <Icon as={FaEthereum} color={navbarIcon} />
          <Text fontSize="sm" fontWeight="600">
            1,924 ETH
          </Text>
        </Flex>
      )}

      {/* RIGHT SECTION */}
      <Flex align="center" gap={{ base: 2, md: 4 }}>
        {/* Manager Dropdown */}
        {user?.role === "Manager" && (
          <Menu>
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              borderColor={borderColor}
              _hover={{ bg: hoverBg }}
            >
              {selectedUser ? selectedUser.username : "Own"}
            </MenuButton>
            <MenuList
              p={3}
              borderRadius="md"
              bg={menuBg}
              boxShadow={shadow}
              minW="200px"
              maxH="260px"
              overflowY="auto"
            >
              <InputGroup mb={2}>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search users..."
                  size="sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>

              <MenuItem
                onClick={() => handleSelectUser(null)}
                borderRadius="md"
                _hover={{ bg: hoverBg }}
                fontWeight={!selectedUser ? "600" : "normal"}
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
                    _hover={{ bg: hoverBg }}
                    fontWeight={
                      selectedUser?.user_id === u.user_id ? "600" : "normal"
                    }
                  >
                    {u.username}
                  </MenuItem>
                ))
              ) : (
                <Text
                  fontSize="sm"
                  color="gray.500"
                  textAlign="center"
                  py={2}
                >
                  No users found
                </Text>
              )}
            </MenuList>
          </Menu>
        )}

        {/* Theme Toggle */}
        <Button
          onClick={toggleColorMode}
          bg="transparent"
          p={0}
          _hover={{ bg: "transparent" }}
        >
          <Icon
            as={colorMode === "light" ? IoMdMoon : IoMdSunny}
            color={navbarIcon}
            w={5}
            h={5}
          />
        </Button>

        {/* User Avatar */}
        <Menu>
          <MenuButton>
            <Avatar
              name={user?.username || "User"}
              size="sm"
              bg="blue.600"
              color="white"
              cursor="pointer"
            />
          </MenuButton>
          <MenuList
            border="none"
            borderRadius="lg"
            boxShadow={shadow}
            bg={menuBg}
            p={2}
          >
            <Box
              px={3}
              py={2}
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <Text fontWeight="600" color={textColor}>
                👋 {user?.username || "User"}
              </Text>
            </Box>
            <MenuItem onClick={() => navigate("/admin/profile-setting")}>
              Profile Settings
            </MenuItem>
            <MenuItem color="red.400" onClick={handleLogout}>
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
}
