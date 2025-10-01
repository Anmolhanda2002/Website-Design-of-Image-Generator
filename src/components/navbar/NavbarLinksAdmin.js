import { useNavigate } from "react-router-dom"; // <-- import useNavigate
// Chakra imports
import {
  Avatar,
  Button,
  Flex,
  Icon,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
  useColorMode,
  useToast
} from '@chakra-ui/react';
// Custom Components
import { ItemContent } from 'components/menu/ItemContent';
import { SearchBar } from 'components/navbar/searchBar/SearchBar';
import { SidebarResponsive } from 'components/sidebar/Sidebar';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// Assets
import navImage from 'assets/img/layout/Navbar.png';
import { MdNotificationsNone, MdInfoOutline } from 'react-icons/md';
import { IoMdMoon, IoMdSunny } from 'react-icons/io';
import { FaEthereum } from 'react-icons/fa';
import routes from 'routes';
import NavbarClock from './NavbarClock';
import { startTransition } from "react";
export default function HeaderLinks(props) {
  const { secondary } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  const navbarIcon = useColorModeValue('gray.400', 'white');
  const menuBg = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorBrand = useColorModeValue('brand.700', 'brand.400');
  const ethColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('#E6ECFA', 'rgba(135, 140, 189, 0.3)');
  const ethBg = useColorModeValue('secondaryGray.300', 'navy.900');
  const ethBox = useColorModeValue('white', 'navy.800');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(112, 144, 176, 0.06)',
  );
  const borderButton = useColorModeValue('secondaryGray.500', 'whiteAlpha.200');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (u) setUser(u);
  }, []);
  const navigate = useNavigate();
  const toast = useToast();

  // Logout function
const handleLogout = () => {
  localStorage.removeItem("user"); // remove user data

  toast({
    title: "Logged out",
    description: "You have been logged out successfully",
    status: "success",
    duration: 2000,
    isClosable: true,
  });

  startTransition(() => {
    navigate("/auth/sign-in", { replace: true }); // navigate safely
  });
};


  const handleProfilePage = ()=>{
     navigate("/admin/profile-setting", { replace: true }); // redirect to login page
  
  }
  return (
    <Flex
      w={{ sm: '100%', md: 'auto' }}
      alignItems="center"
      flexDirection="row"
      bg={menuBg}
      flexWrap={secondary ? { base: 'wrap', md: 'nowrap' } : 'unset'}
      p="10px"
      borderRadius="30px"
      boxShadow={shadow}
    >
      <SearchBar
        mb={() => secondary ? { base: '10px', md: 'unset' } : 'unset'}
        me="10px"
        borderRadius="30px"
      />
      <NavbarClock/>
      <Flex bg={ethBg} display={secondary ? 'flex' : 'none'} borderRadius="30px" ml="5" ms="auto" p="6px" align="center" me="6px">
        <Flex align="center" ml="5" justify="center" bg={ethBox} h="29px" w="29px" borderRadius="30px" me="7px">
          <Icon color={ethColor} w="9px" h="14px" as={FaEthereum} />
        </Flex>
        <Text w="max-content" color={ethColor} fontSize="sm" fontWeight="700" me="6px">
          1,924
          <Text as="span" display={{ base: 'none', md: 'unset' }}> ETH</Text>
        </Text>
      </Flex>
      <SidebarResponsive routes={routes} />

      {/* Other menus like notifications/info omitted for brevity */}

      <Button variant="no-hover"  ml="4"  bg="transparent" p="0px" minW="unset" minH="unset" h="18px" w="max-content" onClick={toggleColorMode}>
        <Icon me="10px" h="18px" w="18px" color={navbarIcon} as={colorMode === 'light' ? IoMdMoon : IoMdSunny} />
      </Button>

      {/* User Menu */}
      <Menu>
        <MenuButton p="0px">
          <Avatar
            _hover={{ cursor: 'pointer' }}
            color="white"
             name={user?.username || "User"}
            bg="#11047A"
            size="sm"
            w="40px"
            h="40px"
          />
        </MenuButton>
        <MenuList boxShadow={shadow} p="0px" mt="10px" borderRadius="20px" bg={menuBg} border="none">
          <Flex w="100%" mb="0px">
            <Text ps="20px" pt="16px" pb="10px" w="100%" borderBottom="1px solid" borderColor={borderColor} fontSize="sm" fontWeight="700" color={textColor}>
                👋 Hey, {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"}
            </Text>
          </Flex>
       <Flex flexDirection="column" p="10px">
  <MenuItem 
    borderRadius="8px" 
    px="14px" 
    bg="transparent" 
    _hover={{ bg: "transparent" }} 
    _focus={{ bg: "transparent" }}
     onClick={handleProfilePage}
  >
    <Text fontSize="sm" color="inherit">Profile Settings</Text>
  </MenuItem>

 

  <MenuItem
    borderRadius="8px"
    px="14px"
    bg="transparent"
    _hover={{ bg: "transparent" }}
    _focus={{ bg: "transparent" }}
    color="red.400"
    onClick={handleLogout}
  >
    <Text fontSize="sm" color="inherit">Log out</Text>
  </MenuItem>
</Flex>

        </MenuList>
      </Menu>
    </Flex>
  );
}

HeaderLinks.propTypes = {
  variant: PropTypes.string,
  fixed: PropTypes.bool,
  secondary: PropTypes.bool,
  onOpen: PropTypes.func,
};
