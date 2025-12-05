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
MdVideoSettings
} from 'react-icons/md';
import { RiImageEditFill } from "react-icons/ri";
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
import AssignUsersPage from 'views/admin/EditUser/pages/AssignUser';
import EditPreviewBox from 'layouts/VedioGeneration/components/EditPreviewBox/EditPreviewBox';
import ImageGuideUser from "views/admin/SideBarUserGuidelinePage/ImageGuideLine"
import VideoGuideline from "views/admin/SideBarUserGuidelinePage/VideoGuideLine"
import ImageGuidelineSidebar from "views/admin/SideBarUserGuidelinePage/ImageGuideLine"
import VideoGuidelineSidebar from "views/admin/SideBarUserGuidelinePage/VideoGuideLine"
import ViewProjectDetails from "views/admin/profile/components/ViewProjectDetails"
import EditImageGuidelineUser from 'views/admin/EditUser/ImageGuideline.jsx/EditGuideline';
import VideoGuidelineAddSidebar from "views/admin/SideBarUserGuidelinePage/VideoGuidelineAdd.jsx"
import VideoGuidelineEditSidebar from "views/admin/SideBarUserGuidelinePage/VideoGuidelineEdit.jsx"
import NewPasswordCreate from "views/auth/forgetpassword/Create_new_password"
const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <MainDashboard />,
    showInSidebar: true,
  },
    {
    name: 'Reset Password',
    layout: '/auth',
    path: '/create-reset-password/:token',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <NewPasswordCreate />,
    showInSidebar:false,
  },

          {
    name: 'Edit Guidelines',
    layout: '/admin',
    path: '/edit_guideline_user/:guideline_id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditImageGuidelineUser />,
    showInSidebar:false,
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
    roles: ['Standard User','Manager'],
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
    name: 'Edit Video Guideline',
    layout: '/admin',
    path: '/edit/videoguidelinemain/:guideline_id',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <VideoGuidelineEditSidebar/>,
    showInSidebar: false, // hidden from sidebar
  },
        {
    name: 'Add Video Guideline',
    layout: '/admin',
    path: '/add/videoguidelinemain',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <VideoGuidelineAddSidebar/>,
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
    roles: ['Administrator','Manager','Standard User'],
  },
  {
    name: 'Video Assets',
    layout: '/admin',
    path: '/videoassets',
    icon: <Icon as={MdVideoLibrary} w="20px" h="20px" color="inherit" />,
    component: <VideosPage />,
    showInSidebar: true,
    roles: ['Administrator','Manager','Standard User'],
  },
    {
    name: 'Image Guideline',
    layout: '/admin',
    path: '/image_guideline_user',
    icon: <Icon as={RiImageEditFill} w="20px" h="20px" color="inherit" />,
    component: <ImageGuidelineSidebar />,
    showInSidebar: true,
    roles: ['Administrator','Manager','Standard User'],
  },
      {
    name: 'Video Guideline',
    layout: '/admin',
    path: '/video_guideline_user',
    icon: <Icon as={MdVideoSettings} w="20px" h="20px" color="inherit" />,
    component: <VideoGuidelineSidebar />,
    showInSidebar: true,
    roles: ['Administrator','Manager','Standard User'],
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
    name: 'Image Guidelines Admin',
    layout: '/admin',
    path: '/guidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <Guideline />,
    showInSidebar: false,
   
  },

// Sidebar True
// video Guideline 
      {
    name: 'Video Guidelines Admin',
    layout: '/admin',
    path: '/videoguidelines',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <VideoGuideLine />,
    showInSidebar: false,
  
  },


  //show Sidebar False 
  //video GuideLine
      {
    name: 'Add Guidelines',
    layout: '/admin',
    path: '/add/videoguidelines/:id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <AddVideoGuideLine />,
    showInSidebar:false,
  },

        {
    name: 'Edit Guidelines',
    layout: '/admin',
    path: '/edit/videoguideline/:guideline_id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditVideoGuideLine />,
    showInSidebar:false,
  },


      {
    name: 'Guidelines',
    layout: '/admin',
    path: '/add/guidelines/:id',
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
    {
    name: 'Assign User',
    layout: '/admin',
    path: '/assign_user/:id',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <AssignUsersPage />,
    showInSidebar: false,
  },
  {
     name: 'Image Guideline',
    layout: '/admin',
    path: '/imageguideline',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <ImageGuideUser />,
    showInSidebar: true,
    roles: ['Standard User']
  },
    {
     name: 'Video Guideline',
    layout: '/admin',
    path: '/videoguideline',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <VideoGuideline />,
    showInSidebar: true,
    roles: ['Standard User']
  },
      {
     name: 'Video Guideline',
    layout: '/admin',
    path: '/projectdetails/:id',
    icon: <Icon as={MdHome} w="20px" h="20px" color="inherit" />,
    component: <ViewProjectDetails />,
    showInSidebar: false,
    roles: ['Standard User','Manager']
  }
];

export default routes;
