import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

function NewPassword() {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // if your reset URL contains ?token=xyz

  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  console.log("Asfda")
  const handleResetPassword = async () => {
    if (password.length < 8) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 8 characters.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Mismatch Password",
        description: "Both passwords must match.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}auth/reset-password/`,
        {
          token,
          new_password: password,
        }
      );

      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
        status: "success",
        duration: 3000,
      });

      navigate("/auth/sign-in");
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to reset password.",
        status: "error",
        duration: 3000,
      });
    }

    setLoading(false);
  };

  return (
    <DefaultAuth illustrationBackground={illustration} image={illustration}>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx="auto"
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
            Create New Password
          </Heading>
        </Flex>

        <Flex w="100%">
          <Flex
            direction="column"
            w={{ base: "100%", md: "420px" }}
            maxW="100%"
          >
            <FormControl>

              {/* New Password */}
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mb="8px">
                New Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Enter new password"
                  mb="20px"
                  size="lg"
                  type={show ? "text" : "password"}
                  variant="auth"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement mt="4px">
                  <Icon
                    as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={() => setShow(!show)}
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                  />
                </InputRightElement>
              </InputGroup>

              {/* Confirm Password */}
              <FormLabel fontSize="sm" fontWeight="500" color={textColor} mt="10px" mb="8px">
                Re-enter Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  isRequired
                  fontSize="sm"
                  placeholder="Re-enter new password"
                  mb="20px"
                  size="lg"
                  type={show2 ? "text" : "password"}
                  variant="auth"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <InputRightElement mt="4px">
                  <Icon
                    as={show2 ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                    onClick={() => setShow2(!show2)}
                    color={textColorSecondary}
                    _hover={{ cursor: "pointer" }}
                  />
                </InputRightElement>
              </InputGroup>

              {/* Submit Button */}
              <Button
                fontSize="sm"
                variant="brand"
                w="100%"
                h="50"
                mb="24px"
                onClick={handleResetPassword}
                isLoading={loading}
              >
                Update Password
              </Button>
            </FormControl>

            <Flex justify="center">
              <Text color="gray.500" fontSize="14px">
                Back to
                <Text
                  as="span"
                  color="brand.500"
                  ms="5px"
                  cursor="pointer"
                  onClick={() => navigate("/auth/sign-in")}
                >
                  Sign In
                </Text>
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}

export default NewPassword;
