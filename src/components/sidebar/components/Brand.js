import React from "react";

// Chakra imports
import { Flex, useColorModeValue } from "@chakra-ui/react";

// Custom components
import { HorizonLogo } from "components/icons/Icons";
import { HSeparator } from "components/separator/Separator";

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue("navy.700", "white");

  return (
    <Flex align='center' direction='column'>
      {/* <HorizonLogo h='26px' w='175px' my='32px' color={logoColor} /> */}
<h1
  style={{
    fontSize: "25px",
    fontWeight: "bold",
    
    margin: "25px",
    letterSpacing: "-0.5px"
  }}
  color={logoColor}
>
  PROJECT <span style={{ fontWeight: "normal" }}>NAME</span>
</h1>
      <HSeparator mb='20px' />
    </Flex>
  );
}

export default SidebarBrand;
