import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
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
    name: 'Products',
    layout: '/admin',
    path: '/products',
    icon: <Icon as={MdOutlineShoppingCart} w="20px" h="20px" color="inherit" />,
    component: <NFTMarketplace />,
    showInSidebar: true,
    // roles: ['Administrator'], // only admin can see
  },
  {
    name: 'Data Tables',
    layout: '/admin',
    path: '/data-tables',
    icon: <Icon as={MdBarChart} w="20px" h="20px" color="inherit" />,
    component: <DataTables />,
    showInSidebar: true,
    // roles: ['Administrator', 'Manager'],
  },
  {
    name: 'GenerateVideo',
    layout: '/admin',
    path: '/generatevideo',
    icon: <Icon as={MdPerson} w="20px" h="20px" color="inherit" />,
    component: <Profile />,
    showInSidebar: true,
    // roles: ['User', 'Administrator'],
  },
  {
    name: 'NextGenerateVideo',
    layout: '/admin',
    path: '/nextgeneratevideo',
    icon: <Icon as={MdPerson} w="20px" h="20px" color="inherit" />,
    component: <DashboardLayout />,
    showInSidebar: true,
    // roles: ['Administrator'],
  },
  {
    name: 'Profile Setting',
    layout: '/admin',
    path: '/profile-setting',
    icon: <Icon as={MdPerson} w="20px" h="20px" color="inherit" />,
    component: <UserSettings />,
    showInSidebar: false,
   
  },

    {
    name: 'Asserts',
    layout: '/admin',
    path: '/asserts',
    icon: <Icon as={MdPerson} w="20px" h="20px" color="inherit" />,
    component: <AssetsPage />,
    showInSidebar: true,
   
  },
      {
    name: 'Video Asserts',
    layout: '/admin',
    path: '/videoasserts',
    icon: <Icon as={MdPerson} w="20px" h="20px" color="inherit" />,
    component: <VideosPage />,
    showInSidebar: true,
   
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} w="20px" h="20px" color="inherit" />,
    component: <SignInCentered />,
    showInSidebar: false, // hide from sidebar
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
];

export default routes;
