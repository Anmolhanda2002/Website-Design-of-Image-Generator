import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdVideoLibrary,
  MdSettings,
  MdImage,
  MdSmartDisplay,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import DataTables from 'views/admin/dataTables';
import DashboardLayout from 'views/admin/NextPageGenerateVedio/GenerateVedio';
import ForgotPassword from 'views/auth/forgetpassword/ForgetPassword';
import SignInCentered from 'views/auth/signIn';
import SignUp from 'views/auth/SignUp';
import UserSettings from 'views/admin/profilesetting/Profilesetting';
import AssetsPage from 'views/admin/AssertsPage/AssertsPage';
import VideosPage from 'views/admin/VideoPage/VideoAsserts';
import Usertable from "views/admin/Usertable/UserTable.jsx"
import EditUser from 'views/admin/EditUser/EditUser';
import Guideline from "views/admin/GuideLine/Index"
import AddGuideline from "views/admin/GuideLine/Pages/AddImageGuideLine"
import EditGuideLine from "views/admin/GuideLine/Pages/EditImageGuideLine"
// video GuideLine Route
import VideoGuideLine from "views/admin/VideoGuideLine/Index"
import AddVideoGuideLine from "views/admin/VideoGuideLine/Pages/AddImageGuideLine"
import EditVideoGuideLine from "views/admin/VideoGuideLine/Pages/EditImageGuideLine"
const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <MainDashboard />,
    showInSidebar: true,
  },
  // {
  //   name: 'Products',
  //   layout: '/admin',
  //   path: '/products',
  //   icon: <Icon as={MdOutlineShoppingCart} w="20px" h="20px" color="inherit" />,
  //   component: <NFTMarketplace />,
  //   showInSidebar: true,
  //   roles: ['Administrator'],
  // },
  {
    name: 'Admin List',
    layout: '/admin',
    path: '/adminlist',
    icon: <Icon as={MdBarChart} w="20px" h="20px" color="inherit" />,
    component: <DataTables />,
    showInSidebar: true,
    roles: ['Administrator','SuperAdmin'],
  },
    {
    name: 'User List',
    layout: '/admin',
    path: '/userlist',
    icon: <Icon as={MdBarChart} w="20px" h="20px" color="inherit" />,
    component: <Usertable />,
    showInSidebar: true,
    roles: ['Administrator','Manager','SuperAdmin'],
  },
  {
    name: 'Generate Video',
    layout: '/admin',
    path: '/generatevideo',
    icon: <Icon as={MdSmartDisplay} w="20px" h="20px" color="inherit" />,
    component: <Profile />,
    showInSidebar: true,
  },
  // {
  //   name: 'Next Generate Video',
  //   layout: '/admin',
  //   path: '/nextgeneratevideo',
  //   icon: <Icon as={MdSmartDisplay} w="20px" h="20px" color="inherit" />,
  //   component: <DashboardLayout />,
  //   showInSidebar: true,
  // },
    {
    name: 'Edit User',
    layout: '/admin',
    path: '/edit_user/:id',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <EditUser/>,
    showInSidebar: false, // hidden from sidebar
  },
  {
    name: 'Profile Setting',
    layout: '/admin',
    path: '/profile-setting',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <UserSettings />,
    showInSidebar: false, // hidden from sidebar
  },
  {
    name: 'Assets',
    layout: '/admin',
    path: '/assets',
    icon: <Icon as={MdImage} w="20px" h="20px" color="inherit" />,
    component: <AssetsPage />,
    showInSidebar: true,
  },
  {
    name: 'Video Assets',
    layout: '/admin',
    path: '/videoassets',
    icon: <Icon as={MdVideoLibrary} w="20px" h="20px" color="inherit" />,
    component: <VideosPage />,
    showInSidebar: true,
  },
  // Auth Routes
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <SignInCentered />,
    showInSidebar: false,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <SignUp />,
    showInSidebar: false,
  },
  {
    name: 'Forget Password',
    layout: '/auth',
    path: '/forgot-password',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <ForgotPassword />,
    showInSidebar: false,
  },
  {
    name: 'Forget Password',
    layout: '/videocreate',
    path: '/createvideo',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <ForgotPassword />,
    showInSidebar: false,
  },
    {
    name: 'Image Guidelines',
    layout: '/admin',
    path: '/guidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <Guideline />,
    showInSidebar: true,
  },

// Sidebar True
// video Guideline 
      {
    name: 'Video Guidelines',
    layout: '/admin',
    path: '/videoguidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <VideoGuideLine />,
    showInSidebar: true,
  },


  //show Sidebar False 
  //video GuideLine
      {
    name: 'Add Guidelines',
    layout: '/admin',
    path: '/add/videoguidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <AddVideoGuideLine />,
    showInSidebar:false,
  },

        {
    name: 'Edit Guidelines',
    layout: '/admin',
    path: '/edit/videoguidelines/:id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditVideoGuideLine />,
    showInSidebar:false,
  },


      {
    name: 'Guidelines',
    layout: '/admin',
    path: '/add/guidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <AddGuideline />,
    showInSidebar:false,
  },
        {
    name: 'Edit Guidelines',
    layout: '/admin',
    path: '/edit_guideline/:guideline_id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditGuideLine />,
    showInSidebar:false,
  },
];

export default routes;
