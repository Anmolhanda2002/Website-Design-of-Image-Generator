import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useToast,
  Flex,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  InputGroup,
  InputRightElement,
  IconButton,
  VStack,
  HStack,Circle
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import axiosInstance from "utils/AxiosInstance";

export default function CreateNewPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ✅ Validation rules
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!isPasswordValid) {
      toast({
        title: "Weak Password",
        description: "Password does not meet all requirements",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid or missing token",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/reset_password/", {
        token,
        new_password: password,
      });

      const { status, message } = response.data;

      if (status === "success") {
        toast({
          title: "Password Updated",
          description: message || "Your password has been reset successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/auth/sign-in");
      } else {
        toast({
          title: "Error",
          description: message || "Something went wrong.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
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
        flexDirection="column"
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "8vh" }}
      >
        <Heading mb="10px">Create New Password</Heading>
        <Text mb="24px" textAlign="center">
          Enter your new password below
        </Text>

        <FormControl>
          <FormLabel>New Password</FormLabel>
          <InputGroup mb="10px">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Toggle Password"
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
              />
            </InputRightElement>
          </InputGroup>

          <FormLabel>Confirm Password</FormLabel>
          <InputGroup mb="24px">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                aria-label="Toggle Confirm Password"
                icon={showConfirm ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowConfirm(!showConfirm)}
              />
            </InputRightElement>
          </InputGroup>

          <Button
            variant="brand"
            w="100%"
            onClick={handleSubmit}
            isLoading={loading}
            isDisabled={!isPasswordValid}
          >
            Reset Password
          </Button>

          {/* ✅ Show Validation Rules Below the Button */}
        <VStack align="start" spacing={2} mt="15px" fontSize="sm">
  <HStack>
    <Circle size="18px" bg={rules.length ? "green.500" : "gray.300"} color="white">
      {rules.length ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
    </Circle>
    <Text color="gray.600">Must be at least 8 characters</Text>
  </HStack>

  <HStack>
    <Circle size="18px" bg={rules.special ? "green.500" : "gray.300"} color="white">
      {rules.special ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
    </Circle>
    <Text color="gray.600">Must contain one special character</Text>
  </HStack>

  <HStack>
    <Circle size="18px" bg={rules.uppercase ? "green.500" : "gray.300"} color="white">
      {rules.uppercase ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
    </Circle>
    <Text color="gray.600">Must contain at least 1 uppercase letter</Text>
  </HStack>

  <HStack>
    <Circle size="18px" bg={rules.lowercase ? "green.500" : "gray.300"} color="white">
      {rules.lowercase ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
    </Circle>
    <Text color="gray.600">Must contain at least 1 lowercase letter</Text>
  </HStack>

  <HStack>
    <Circle size="18px" bg={rules.number ? "green.500" : "gray.300"} color="white">
      {rules.number ? <CheckIcon boxSize={3} /> : <CloseIcon boxSize={3} />}
    </Circle>
    <Text color="gray.600">Must contain at least 1 number</Text>
  </HStack>
</VStack>

        </FormControl>
      </Flex>
    </DefaultAuth>
  );
}
