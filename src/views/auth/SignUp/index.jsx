import React, { useState } from "react";
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
  Button,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  HStack,
  Circle,
} from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import axiosInstance from "utils/AxiosInstance";

function SignUp() {
  const navigate = useNavigate();
  const toast = useToast();

  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  // form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleClick = () => setShow(!show);

  // ✅ Password validation rules
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const handleSignup = async () => {
    if (!username || !email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Weak Password",
        description: "Password must meet all requirements",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/signup/", {
        username,
        email,
        password,
      });

      const { status, data, message } = response.data;

      if (status === "success") {
        toast({
          title: "Account Created",
          description: `Welcome ${data.username}, please sign in`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        navigate("/auth/sign-in");
      } else {
        toast({
          title: "Signup Failed",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
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
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "8vh" }}
        flexDirection="column"
      >
        <Flex justify="center" align="center" w="100%">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Sign Up
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
              {/* Username */}
              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                Username<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
                type="text"
                placeholder="Enter your username"
                mb="24px"
                fontWeight="500"
                size="lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {/* Email */}
              <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                Email<Text color={brandStars}>*</Text>
              </FormLabel>
              <Input
                isRequired
                variant="auth"
                fontSize="sm"
                type="email"
                placeholder="mail@simmmple.com"
                mb="24px"
                fontWeight="500"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Password */}
              <FormLabel ms="4px" fontSize="sm" fontWeight="500" color={textColor} display="flex">
                Password<Text color={brandStars}>*</Text>
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Min. 8 characters"
                  mb="12px"
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

              {/* Password Validation Rules */}
              <VStack align="start" spacing={2} mb="20px" fontSize="sm">
                <HStack>
                  <Circle size="18px" bg={rules.length ? "green.500" : "gray.300"} color="white">
                    {rules.length ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
                  </Circle>
                  <Text color="gray.600">At least 8 characters</Text>
                </HStack>
                <HStack>
                  <Circle size="18px" bg={rules.uppercase ? "green.500" : "gray.300"} color="white">
                    {rules.uppercase ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
                  </Circle>
                  <Text color="gray.600">At least 1 uppercase letter</Text>
                </HStack>
                <HStack>
                  <Circle size="18px" bg={rules.special ? "green.500" : "gray.300"} color="white">
                    {rules.special ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
                  </Circle>
                  <Text color="gray.600">At least 1 special character (@$!%*?&)</Text>
                </HStack>
              </VStack>

              {/* Sign Up Button */}
<Button
  fontSize="sm"
  variant="brand"
  fontWeight="500"
  w="100%"
  h="50"
  mb="24px"
  onClick={handleSignup}
  isLoading={loading}
  isDisabled={!isPasswordValid}
  _hover={{
    bg: !isPasswordValid ? "brand.600" : "brand.600", // show hover color
    cursor: !isPasswordValid ? "not-allowed" : "pointer", // disable pointer when invalid
  }}
>
  Sign Up
</Button>

            </FormControl>

            {/* Already have account? */}
            <Flex flexDirection="column" justifyContent="center" alignItems="center" maxW="100%" mt="0px">
              <Text color={textColorDetails} fontWeight="400" fontSize="14px">
                Already have an account?
                <NavLink to="/auth/sign-in">
                  <Text color={textColorBrand} as="span" ms="5px" fontWeight="500">
                    Sign In
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

export default SignUp;
