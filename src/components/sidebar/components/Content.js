import { Box, Flex, Stack } from "@chakra-ui/react";
import Brand from "components/sidebar/components/Brand";
import Links from "components/sidebar/components/Links";
import SidebarCard from "components/sidebar/components/SidebarCard";
import React from "react";

function SidebarContent(props) {
  const { routes, currentUserRole = "User" } = props;

  // Filter routes by role & visibility
  const filteredRoutes = routes.filter(
    (route) =>
      route.showInSidebar &&
      (!route.roles || route.roles.includes(currentUserRole))
  );

  return (
    <Flex direction="column" height="100%" pt="25px" px="16px" borderRadius="30px">
      <Brand />
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="20px" pe={{ md: "16px", "2xl": "1px" }}>
          <Links routes={filteredRoutes} />
        </Box>
      </Stack>

      <Box mt="60px" mb="40px" borderRadius="30px">
        <SidebarCard />
      </Box>
    </Flex>
  );
}

export default SidebarContent;
