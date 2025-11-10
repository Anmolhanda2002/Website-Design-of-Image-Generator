import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,

  MdHome,
  MdLock,
  // MdOutlineShoppingCart,
  MdVideoLibrary,
  MdSettings,
  MdImage,
  MdSmartDisplay,
  MdPeople,
  MdApps,
  MdLibraryBooks,
} from 'react-icons/md';

// ✅ Admin Imports
import MainDashboard from 'views/admin/default';
import DataTables from 'views/admin/dataTables';
import Profile from 'views/admin/profile';
import UserSettings from 'views/admin/profilesetting/Profilesetting';
import AssetsPage from 'views/admin/AssertsPage/AssertsPage';
import VideosPage from 'views/admin/VideoPage/VideoAsserts';
import Usertable from "views/admin/Usertable/UserTable.jsx";
import EditUser from 'views/admin/EditUser/EditUser';
import AssignUsersPage from 'views/admin/EditUser/pages/AssignUser';

// ✅ Guidelines
import Guideline from "views/admin/GuideLine/Index";
import AddGuideline from "views/admin/GuideLine/Pages/AddImageGuideLine";
import EditGuideLine from "views/admin/GuideLine/Pages/EditImageGuideLine";
import VideoGuideLine from "views/admin/VideoGuideLine/Index";
import AddVideoGuideLine from "views/admin/VideoGuideLine/Pages/AddImageGuideLine";
import EditVideoGuideLine from "views/admin/VideoGuideLine/Pages/EditImageGuideLine";

// ✅ Sidebar User Guideline
import ImageGuidelineSidebar from "views/admin/SideBarUserGuidelinePage/ImageGuideLine";
import VideoGuidelineSidebar from "views/admin/SideBarUserGuidelinePage/VideoGuideLine";
import ImageGuideUser from "views/admin/SideBarUserGuidelinePage/ImageGuideLine";
import VideoGuideline from "views/admin/SideBarUserGuidelinePage/VideoGuideLine";

// ✅ Auth
import SignInCentered from 'views/auth/signIn';
import SignUp from 'views/auth/SignUp';
import ForgotPassword from 'views/auth/forgetpassword/ForgetPassword';

// ✅ Video Layouts
// import DashboardLayout from 'views/admin/NextPageGenerateVedio/GenerateVedio';

// 🧠 Utility function: Assign icons automatically
const getIcon = (name) => {
  const map = {
    'Main Dashboard': MdHome,
    'Admin List': MdBarChart,
    'User List': MdPeople,
    'Assets': MdImage,
    'Video Assets': MdVideoLibrary,
    'Generate Video': MdSmartDisplay,
    'Profile Setting': MdSettings,
    'Image Guideline': MdLibraryBooks,
    'Video Guideline': MdLibraryBooks,
    'Image Guidelines Admin': MdLibraryBooks,
    'Video Guidelines Admin': MdLibraryBooks,
  };

  return map[name] ? (
    <Icon as={map[name]} w="20px" h="20px" color="inherit" />
  ) : (
    <Icon as={MdApps} w="20px" h="20px" color="inherit" /> // default icon
  );
};

const routes = [
  // ✅ Sidebar Routes (visible)
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: getIcon('Main Dashboard'),
    component: <MainDashboard />,
    showInSidebar: true,
  },
  {
    name: 'Admin List',
    layout: '/admin',
    path: '/adminlist',
    icon: getIcon('Admin List'),
    component: <DataTables />,
    showInSidebar: true,
    roles: ['Administrator', 'SuperAdmin'],
  },
  {
    name: 'User List',
    layout: '/admin',
    path: '/userlist',
    icon: getIcon('User List'),
    component: <Usertable />,
    showInSidebar: true,
    roles: ['Administrator', 'Manager', 'SuperAdmin'],
  },
  {
    name: 'Assets',
    layout: '/admin',
    path: '/assets',
    icon: getIcon('Assets'),
    component: <AssetsPage />,
    showInSidebar: true,
    roles: ['Administrator', 'Manager', 'Standard User'],
  },
  {
    name: 'Video Assets',
    layout: '/admin',
    path: '/videoassets',
    icon: getIcon('Video Assets'),
    component: <VideosPage />,
    showInSidebar: true,
    roles: ['Administrator', 'Manager', 'Standard User'],
  },
  {
    name: 'Generate Video',
    layout: '/admin',
    path: '/generatevideo',
    icon: getIcon('Generate Video'),
    component: <Profile />,
    showInSidebar: true,
    roles: ['Standard User', 'Manager'],
  },
  {
    name: 'Image Guideline',
    layout: '/admin',
    path: '/image_guideline_user',
    icon: getIcon('Image Guideline'),
    component: <ImageGuidelineSidebar />,
    showInSidebar: true,
    roles: ['Administrator', 'Manager', 'Standard User'],
  },
  {
    name: 'Video Guideline',
    layout: '/admin',
    path: '/video_guideline_user',
    icon: getIcon('Video Guideline'),
    component: <VideoGuidelineSidebar />,
    showInSidebar: true,
    roles: ['Administrator', 'Manager', 'Standard User'],
  },
  {
    name: 'Image Guideline',
    layout: '/admin',
    path: '/imageguideline',
    icon: getIcon('Image Guideline'),
    component: <ImageGuideUser />,
    showInSidebar: true,
    roles: ['Standard User'],
  },
  {
    name: 'Video Guideline',
    layout: '/admin',
    path: '/videoguideline',
    icon: getIcon('Video Guideline'),
    component: <VideoGuideline />,
    showInSidebar: true,
    roles: ['Standard User'],
  },

  // 🧩 Hidden (not in sidebar)
  {
    name: 'Edit User',
    layout: '/admin',
    path: '/edit_user/:id',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <EditUser />,
    showInSidebar: false,
  },
  {
    name: 'Profile Setting',
    layout: '/admin',
    path: '/profile-setting',
    icon: <Icon as={MdSettings} w="20px" h="20px" color="inherit" />,
    component: <UserSettings />,
    showInSidebar: false,
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
    name: 'Image Guidelines Admin',
    layout: '/admin',
    path: '/guidelines',
    icon: getIcon('Image Guidelines Admin'),
    component: <Guideline />,
    showInSidebar: false,
  },
  {
    name: 'Video Guidelines Admin',
    layout: '/admin',
    path: '/videoguidelines',
    icon: getIcon('Video Guidelines Admin'),
    component: <VideoGuideLine />,
    showInSidebar: false,
  },
  {
    name: 'Add Guidelines',
    layout: '/admin',
    path: '/add/guidelines/:id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <AddGuideline />,
    showInSidebar: false,
  },
  {
    name: 'Edit Guidelines',
    layout: '/admin',
    path: '/edit_guideline/:guideline_id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditGuideLine />,
    showInSidebar: false,
  },
  {
    name: 'Add Video Guidelines',
    layout: '/admin',
    path: '/add/videoguidelines/:id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <AddVideoGuideLine />,
    showInSidebar: false,
  },
  {
    name: 'Edit Video Guidelines',
    layout: '/admin',
    path: '/edit/videoguidelines/:guideline_id',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <EditVideoGuideLine />,
    showInSidebar: false,
  },
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
    name: 'Forgot Password',
    layout: '/auth',
    path: '/forgot-password',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <ForgotPassword />,
    showInSidebar: false,
  },
];

export default routes;
