import { Flex, Box } from "@chakra-ui/react";
import Sidebar from "./Componensts/SideBar";
import MainContent from "./Componensts/MainContent";

const DashboardLayout = () => {
  return (
    <Flex h="100vh" w="100%" mt={10}>
      {/* Sidebar */}
      <Box
        w={{ base: "70px", md: "250px" }}   // responsive sidebar width

   
        p={4}
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box
        flex="1"
        bg="gray.50"
        p={6}
        overflowY="auto"
      >
        <MainContent />
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
