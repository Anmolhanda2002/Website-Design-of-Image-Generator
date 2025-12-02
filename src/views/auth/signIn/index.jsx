import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// Chakra imports
import { useContext } from "react";
import {
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  Checkbox,
  Button,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
// import axiosInstance from "utils/AxiosInstance";
import axios from "axios";
import { UserContext } from "contexts/UserContext";
function SignIn() {
  const navigate = useNavigate();
  const toast = useToast();
  const { loginUser } = useContext(UserContext);
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleClick = () => setShow(!show);
const handleLogin = async () => {
  setLoading(true);
  try {
    const cleanedEmail = email.trim().replace(/\s+/g, "");
const cleanedPassword = password.trim().replace(/\s+/g, "");
    const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/login/`, {
      email:cleanedEmail,
      password:cleanedPassword,
    });

    const { status, message, data } = response.data;

    if (status === "success" && data) {
      const { access_token, refresh_token, user } = data;

      // 🔒 Approval & email verification checks
      if (!user.is_approved) {
        toast({
          title: "Login Failed",
          description: "Your account is not approved yet. Please wait for admin approval.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      if (!user.email_verification) {
        toast({
          title: "Login Failed",
          description: "Please verify your email before logging in.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setLoading(false);
        return;
      }

      // ✅ Save tokens + user info
      loginUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);

      // ✅ Check for existing API key


      // ✅ Success toast
      toast({
        title: "Login Successful",
        description: `Welcome ${user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // ✅ Role-based navigation
      if (user.roles.includes("Administrator")) {
        navigate("/admin/default");
      } else if (user.roles.includes("Standard User")) {
        navigate("/admin/default");
      } else if (user.roles.includes("SuperAdmin")) {
        navigate("/admin/default");
      } else {
        navigate("/");
      }
    } else {
      toast({
        title: "Login Failed",
        description: message || "Something went wrong",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (error) {
    toast({
      title: "Login Failed",
      description: error.response?.data?.message || error.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
};







  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="100%"
        justify="center"
        align="center"
        alignItems="center"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "8vh" }}
        flexDirection="column"
      >
        <Flex justify="center" align="center" w="100%">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Sign In
          </Heading>
        </Flex>
        <Flex w="100%">
          <Flex
            zIndex="2"
            direction="column"
            w={{ base: "100%", md: "420px" }}
            maxW="100%"
            background="transparent"
            borderRadius="15px"
          >
            <FormControl>
              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
                ms={{ base: "0px", md: "0px" }}
                type="email"
                placeholder="mail@simmmple.com"
                mb="24px"
                fontWeight="500"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <FormLabel ms="4px" fontSize="sm" fontWeight="500" color={textColor} display="flex">
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Min. 8 characters"
                  mb="24px"
                  size="lg"
                  type={show ? "text" : "password"}
                  variant="auth"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement display="flex" alignItems="center" mt="4px">
                  <Icon
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={handleClick}
                  />
                </InputRightElement>
              </InputGroup>

              <Flex justifyContent="space-between" align="center" mb="24px">
                <FormControl display="flex" alignItems="center">
                  <Checkbox
                    id="remember-login"
                    colorScheme="brandScheme"
                    me="10px"
                    isChecked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <FormLabel htmlFor="remember-login" mb="0" fontWeight="normal" color={textColor} fontSize="sm">
                    Keep me logged in
                  </FormLabel>
                </FormControl>
                <NavLink to="/auth/forgot-password">
                  <Text color={textColorBrand} fontSize="sm" w="124px" fontWeight="500">
                    Forgot password?
                  </Text>
                </NavLink>
              </Flex>

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50"
                mb="24px"
                onClick={handleLogin}
                isLoading={loading}
              >
                Sign In
              </Button>
            </FormControl>

            <Flex flexDirection="column" justifyContent="center" alignItems="center" maxW="100%" mt="0px">
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Not registered yet?
                <NavLink to="/auth/sign-up">
                  <Text color={textColorBrand} as="span" ms="5px" fontWeight="500">
                    Create an Account
                  </Text>
                </NavLink>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
