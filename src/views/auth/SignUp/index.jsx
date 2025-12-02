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
  Select,
} from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
// import axiosInstance from "utils/AxiosInstance";
import axios from "axios";

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

  // Step management
  const [step, setStep] = useState(1);

  // Step 1
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [userType, setUserType] = useState("");

  const handleClick = () => setShow(!show);

  // Password rules
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };
  const isPasswordValid = Object.values(rules).every(Boolean);

  const handleNext = () => {
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
    setStep(2);
  };

const handleSignup = async () => {
  if (!userType) {
    toast({
      title: "Select User Type",
      description: "Please choose Admin or User",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  setLoading(true);
  try {
    const cleanedUsername = username.trim().replace(/\s+/g, "");
const cleanedEmail = email.trim().replace(/\s+/g, "");
const cleanedPassword = password.trim().replace(/\s+/g, "");
    const response = await axios.post(`${process.env.REACT_APP_API_URL}auth/signup/`, {
      username:cleanedUsername,
      email:cleanedEmail,
      password:cleanedPassword,
      user_type: userType.toLowerCase(), // send snake_case
    });

    const { status, message } = response.data;

    if (status === "success") {
      toast({
        title: "Account Created",
        description: `Welcome ${username}, your account has been created! Please sign in.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/auth/sign-in");
    } else {
      toast({
        title: "Signup Failed",
        description: message || "Something went wrong",
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
              {step === 1 && (
                <>
                  {/* Username */}
                  <FormLabel display="flex" fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                    Username<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired
                    variant="auth"
                    fontSize="sm"
                    type="text"
                    placeholder="Enter your username"
                    mb="15px"
                    fontWeight="500"
                    size="lg"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  {/* Email */}
                  <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                    Email<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Input
                    isRequired
                    variant="auth"
                    fontSize="sm"
                    type="email"
                    placeholder="mail@simmmple.com"
                    mb="15px"
                    fontWeight="500"
                    size="lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {/* Password */}
                  <FormLabel fontSize="sm" fontWeight="500" color={textColor} display="flex">
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

                  {/* Password Validation */}
                  <VStack align="start" spacing={2} mb="15px" fontSize="sm">
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

                  {/* Next Button */}
                  <Button
                    fontSize="sm"
                    variant="brand"
                    fontWeight="500"
                    w="100%"
                    h="50"
                    mb="15px"
                    onClick={handleNext}
                    isDisabled={!isPasswordValid}
                  >
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  {/* User Type */}
                  <FormLabel display="flex" fontSize="sm" fontWeight="500" color={textColor} mb="4px">
                    Select User Type<Text color={brandStars}>*</Text>
                  </FormLabel>
                  <Select
                    placeholder="Select user type"
                    value={userType}
                       fontSize="sm"
                    size="lg"
                    onChange={(e) => setUserType(e.target.value)}
                    mb="24px"
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </Select>

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
                  >
                    Sign Up
                  </Button>

                  {/* Back Button */}
                  <Button
                    fontSize="sm"
                    variant="outline"
                    fontWeight="500"
                    w="100%"
                    h="50"
                    mb="15px"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </>
              )}
            </FormControl>

            {/* Already have account */}
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
