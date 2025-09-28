
import { Box, Grid } from "@chakra-ui/react";

// Custom components
import Banner from "views/admin/profile/components/Banner";
import General from "views/admin/profile/components/General";
import Notifications from "views/admin/profile/components/Notifications";
import Projects from "views/admin/profile/components/Projects";
import Storage from "views/admin/profile/components/Storage";
import Upload from "views/admin/profile/components/Upload";
import TextFieldComponent from "./components/TextField";
// Assets
import banner from "assets/img/auth/banner.png";
import avatar from "assets/img/avatars/avatar4.png";
import React from "react";
import GradientHeading from "./components/Heading";
export default function Overview() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Main Fields */}
      <Grid
        templateColumns={{
          base: "1fr",
          
        }}
  
        // gap={{ base: "20px", xl: "20px" }}
        
        mb='20px'>
        {/* <Banner
          gridArea='1 / 1 / 2 / 2'
          banner={banner}
          avatar={avatar}
          name='Adela Parkson'
          job='Product Designer'
          posts='17'
          followers='9.7k'
          following='274'
        /> */}
        {/* <Storage
          gridArea={{ base: "2 / 1 / 3 / 2", lg: "1 / 2 / 2 / 3" }}
          used={25.6}
          total={50}
        /> */}
<GradientHeading/>
<TextFieldComponent
  gridColumn="1 / -1"   // spans all columns
  w="100%"              // ensures full width
  minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
  pe="20px"
  mb='20px'
  pb={{ base: "100px", lg: "20px" }}
/>




        {/* <Upload
          gridArea={{
            base: "3 / 1 / 4 / 2",
            lg: "1 / 3 / 2 / 4",
          }}
          minH={{ base: "auto", lg: "420px", "2xl": "365px" }}
          pe='20px'
          pb={{ base: "100px", lg: "20px" }}
        /> */}
      </Grid>
      <Grid
        mb='20px'
        templateColumns={{
          base: "1fr",
 
        }}
   
        gap={{ base: "20px", xl: "20px" }}>
      <Projects
  gridColumn="1 / -1"
  banner={banner}
  avatar={avatar}
  name='Adela Parkson'
  job='Product Designer'
  posts='17'
  followers='9.7k'
  following='274'
/>

        {/* <General
          gridArea={{ base: "2 / 1 / 3 / 2", lg: "1 / 2 / 2 / 3" }}
          minH='365px'
          pe='20px'
        />
        <Notifications
          used={25.6}
          total={50}
          gridArea={{
            base: "3 / 1 / 4 / 2",
            lg: "2 / 1 / 3 / 3",
            "2xl": "1 / 3 / 2 / 4",
          }}
        /> */}
      </Grid>
    </Box>
  );
}
