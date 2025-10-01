import React, { useState } from "react";
import { useToast, Flex, Heading, FormControl, FormLabel, Input, Button, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import DefaultAuth from "layouts/auth/Default";
import illustration from "assets/img/auth/auth.png";
import axiosInstance from "utils/AxiosInstance";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/forgot-password/", { email });
      const { status, message } = response.data;

      if (status === "success") {
        toast({
          title: "Email Sent",
          description: message || "Password reset email sent successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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
        <Heading mb="10px">Forgot Password</Heading>
        <Text mb="24px" textAlign="center">
          Enter your email to receive a password reset link
        </Text>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            mb="24px"
          />

          <Button
            variant="brand"
            w="100%"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Send Reset Link
          </Button>
        </FormControl>

        <Text mt="24px" textAlign="center">
          Back to{" "}
          <NavLink to="/auth/sign-in">
            <Text as="span" color="blue.500">Sign In</Text>
          </NavLink>
        </Text>
      </Flex>
    </DefaultAuth>
  );
}
