import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleClick = () => setShow(!show);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const cleanedEmail = email.trim().replace(/\s+/g, "");
      const cleanedPassword = password.trim().replace(/\s+/g, "");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}auth/login/`,
        { email: cleanedEmail, password: cleanedPassword }
      );

      const { status, message, data } = response.data;

      if (status === "success" && data) {
        const { access_token, refresh_token, user } = data;

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

        loginUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);

        toast({
          title: "Login Successful",
          description: `Welcome ${user.username}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Navigate based on role
        if (user.roles.includes("SuperAdmin")) navigate("/admin/default");
        else navigate("/admin/generatevideo");
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
        direction="column"
        align="center"
        justify="center"
        w="100%"
        px={{ base: 5, md: 0 }}
        mt={{ base: 10, md: "8vh" }}
        mb={{ base: 10, md: 20 }}
      >
        <Heading color={textColor} fontSize={{ base: "28px", md: "36px" }} mb={6}>
          Sign In
        </Heading>

        <Flex
          direction="column"
          w={{ base: "100%", sm: "400px", md: "420px" }}
          bg="transparent"
          borderRadius="15px"
        >
          <FormControl>
            <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb={2}>
              Email<Text color={brandStars}>*</Text>
            </FormLabel>
            <Input
              isRequired
              variant="auth"
              fontSize="sm"
              type="email"
              placeholder="mail@example.com"
              mb={4}
              fontWeight="500"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormLabel ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb={2}>
              Password<Text color={brandStars}>*</Text>
            </FormLabel>
            <InputGroup size="md" mb={4}>
              <Input
                isRequired
                fontSize="sm"
                placeholder="Min. 8 characters"
                size="lg"
                type={show ? "text" : "password"}
                variant="auth"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement display="flex" alignItems="center">
                <Icon
                  color={textColorSecondary}
                  _hover={{ cursor: "pointer" }}
                  as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                  onClick={handleClick}
                />
              </InputRightElement>
            </InputGroup>

            <Flex justify="space-between" align="center" mb={6}>
              <Checkbox
                colorScheme="brandScheme"
                isChecked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              >
                Keep me logged in
              </Checkbox>
              <NavLink to="/auth/forgot-password">
                <Text color={textColorBrand} fontSize="sm" fontWeight="500">
                  Forgot password?
                </Text>
              </NavLink>
            </Flex>

            <Button
              fontSize="sm"
              variant="brand"
              fontWeight="500"
              w="100%"
              h="50px"
              mb={6}
              onClick={handleLogin}
              isLoading={loading}
            >
              Sign In
            </Button>
          </FormControl>

          <Flex justify="center" align="center" mt={0}>
            <Text color={textColorDetails} fontWeight="400" fontSize="14px" textAlign="center">
              Not registered yet?
              <NavLink to="/auth/sign-up">
                <Text color={textColorBrand} as="span" ms={1} fontWeight="500">
                  Create an Account
                </Text>
              </NavLink>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default SignIn;
