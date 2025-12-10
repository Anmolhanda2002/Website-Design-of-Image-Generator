import React from "react";
import Logo from "assets/image.png";
import { Flex, Image, Text, useColorModeValue } from "@chakra-ui/react";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  const logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align="center" direction="column" w="100%" py="10px">
      {/* TOP BRAND SECTION */}
      <Flex align="center" gap="12px">
        <Image
          src={Logo}
          alt="Logo"
          boxSize="38px"
          objectFit="contain"
        />

        <Flex direction="column" lineHeight="1.2">
          <Text
            fontSize="20px"
            fontWeight="700"
            color={logoColor}
            letterSpacing="-0.5px"
          >
            HYGAAR <span style={{ fontWeight: 400 }}></span>
          </Text>

          {/* SUBTITLE */}
          {/* <Text
            fontSize="12px"
            fontWeight="500"
            color="gray.500"
            letterSpacing="0.5px"
          >
            HYGRAR SYSTEM
          </Text> */}
        </Flex>
      </Flex>

      {/* SEPARATOR */}
      <HSeparator mt="20px" mb="10px" />
    </Flex>
  );
}

export default SidebarBrand;
