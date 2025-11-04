import { useNavigate } from "react-router-dom";
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
} from "@chakra-ui/react";
import { FaEthereum } from "react-icons/fa";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import { SearchIcon } from "@chakra-ui/icons";
import React, { useState, useEffect, startTransition } from "react";
import routes from "routes";
import { SidebarResponsive } from "components/sidebar/Sidebar";
import NavbarClock from "./NavbarClock";
import axiosInstance from "utils/AxiosInstance";

export default function HeaderLinks(props) {
  const { secondary } = props;
  const { ...rest } = props;

  const navigate = useNavigate();
  const toast = useToast();

  // === Theme variables ===
  const { colorMode, toggleColorMode } = useColorMode();
  const navbarIcon = useColorModeValue("gray.400", "white");
  const menuBg = useColorModeValue("white", "navy.800");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("#E6ECFA", "rgba(135, 140, 189, 0.3)");
  const ethColor = useColorModeValue("gray.700", "white");
  const ethBg = useColorModeValue("secondaryGray.300", "navy.900");
  const ethBox = useColorModeValue("white", "navy.800");
  const shadow = useColorModeValue(
    "14px 17px 40px 4px rgba(112, 144, 176, 0.18)",
    "14px 17px 40px 4px rgba(112, 144, 176, 0.06)"
  );

  // === State ===
  const [user, setUser] = useState(null);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  // For dropdown user list
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // === Access Check ===
  const checkAccess = (route, user) => {
    if (!route.roles) return true;
    return route.roles.includes(user.role);
  };

  // === Load Logged-in User + Filter Routes ===
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      setLoading(false);
      return;
    }

    const normalizedUser = {
      ...storedUser,
      role:
        storedUser.roles && Array.isArray(storedUser.roles)
          ? storedUser.roles[0]
          : storedUser.role,
    };

    setUser(normalizedUser);

    const filteredRoutes = routes.filter(
      (r) => r.layout === "/admin" && checkAccess(r, normalizedUser)
    );
    setAllowedRoutes(filteredRoutes);
    setLoading(false);
  }, []);

  // === Fetch All Users (only for Admin/SuperAdmin) ===
  useEffect(() => {
    if (!user || !["Manager"].includes(user.role)) return;

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
            description: res.data?.message || "Unexpected API response",
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        toast({
          title: "Error fetching users",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setDropdownLoading(false);
      }
    };

    fetchUsers();
  }, [user]);

  // === Handle Search in Dropdown ===
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredUsers(
      allUsers.filter((u) => u.username.toLowerCase().includes(term))
    );
  };

  // === Handle Select User ===
const handleSelectUser = async (u) => {
  setSelectedUser(u);
  localStorage.setItem("selected_user", JSON.stringify(u)); // 🟢 Save for axiosInstance


};


  // === Logout ===
  const handleLogout = async () => {
    try {
      const refresh_token = localStorage.getItem("refresh_token");
      if (!refresh_token) throw new Error("No refresh token found");

      await axiosInstance.post("/auth/logout/", { refresh_token });
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("selected_user");

      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      startTransition(() => navigate("/auth/sign-in", { replace: true }));
    } catch (error) {
      localStorage.clear();
      startTransition(() => navigate("/auth/sign-in", { replace: true }));
    }
  };

  const handleProfilePage = () => navigate("/admin/profile-setting", { replace: true });

  return (
    <Flex
      w={{ sm: "100%", md: "auto" }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: "wrap", md: "nowrap" } : "unset"}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
      gap={3}
    >
      <NavbarClock />

      {/* ETH Box */}
      <Flex
        bg={ethBg}
        display={secondary ? "flex" : "none"}
        borderRadius="30px"
        ml="5"
        p="6px"
        align="center"
        me="6px"
      >
        <Flex
          align="center"
          justify="center"
          bg={ethBox}
          h="29px"
          w="29px"
          borderRadius="30px"
          me="7px"
        >
          <Icon color={ethColor} w="9px" h="14px" as={FaEthereum} />
        </Flex>
        <Text w="max-content" color={ethColor} fontSize="sm" fontWeight="700" me="6px">
          1,924 ETH
        </Text>
      </Flex>

      <SidebarResponsive routes={allowedRoutes} {...rest} />

      {/* 🌟 USER DROPDOWN (only for Admins) */}
      {user && ["Manager"].includes(user.role) && (
        <Menu>
          <MenuButton
            as={Button}
            variant="outline"
            size="sm"
            borderRadius="md"
            borderColor={borderColor}
            _hover={{ bg: "gray.100" }}
          >
            {selectedUser ? selectedUser.username : "Select User"}
          </MenuButton>
          <MenuList p={3} borderRadius="12px" bg={menuBg} boxShadow={shadow}>
            <InputGroup mb={2}>
              <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.400" />} />
              <Input
                placeholder="Search users..."
                size="sm"
                value={searchTerm}
                onChange={handleSearch}
              />
            </InputGroup>

            {dropdownLoading ? (
              <Flex justify="center" align="center" py={3}>
                <Spinner size="sm" />
              </Flex>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <MenuItem
                  key={u.user_id}
                  onClick={() => handleSelectUser(u)}
                  borderRadius="8px"
                  _hover={{ bg: "gray.100" }}
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
        </Menu>
      )}

      {/* Color Mode Button */}
      <Button
        variant="no-hover"
        ml="4"
        bg="transparent"
        p="0px"
        h="18px"
        w="max-content"
        onClick={toggleColorMode}
      >
        <Icon
          me="10px"
          h="18px"
          w="18px"
          color={navbarIcon}
          as={colorMode === "light" ? IoMdMoon : IoMdSunny}
        />
      </Button>

      {/* Avatar Menu */}
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: "pointer" }}
            color="white"
            name={user?.username || "User"}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
          <Flex w="100%">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor={borderColor}
              fontSize="sm"
              fontWeight="700"
              color={textColor}
            >
              👋 Hey, {user?.username || "User"}
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem onClick={handleProfilePage}>
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem color="red.400" onClick={handleLogout}>
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
