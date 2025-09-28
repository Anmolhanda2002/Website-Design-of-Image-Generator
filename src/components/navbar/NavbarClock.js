import React, { useState, useEffect } from "react";
import { Box, Text, Flex, useColorModeValue, Icon } from "@chakra-ui/react";
import { FiClock } from "react-icons/fi";

const NavbarClock = () => {
  const [time, setTime] = useState(new Date());

  const textColor = useColorModeValue("gray.800", "white");
  const bgColor = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Flex
      align="center"
      px={3}
      py={2}
      bg={bgColor}
      borderRadius="full"  // fully rounded
      boxShadow="sm"
      minW="110px"
      gap={2}
    >
      <Icon as={FiClock} w={5} h={5} color={textColor} />
      <Text fontSize="sm" fontWeight="bold" color={textColor}>
        {formatTime(time)}
      </Text>
    </Flex>
  );
};

export default NavbarClock;
