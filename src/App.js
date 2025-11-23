import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState, lazy, Suspense,useEffect } from 'react';
import { UserProvider } from "./contexts/UserContext";
import CreateNnewPassword from 'views/auth/forgetpassword/Create_new_password';
import { SelectedUserProvider } from 'utils/SelectUserContext';
import {  useColorMode } from "@chakra-ui/react";
// Lazy load layouts and pages
import Swal from "sweetalert2";
const AuthLayout = lazy(() => import('./layouts/auth'));
const AdminLayout = lazy(() => import('./layouts/admin'));
const VideoLayout = lazy(() => import('./layouts/VedioGeneration/Index.jsx'));
const RTLLayout = lazy(() => import('./layouts/rtl'));
const NotFound = lazy(() => import('views/404Page'));

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

const { colorMode } = useColorMode();
const isDark = colorMode === "dark";

  function ThemeWrapper({ children }) {
  const { colorMode } = useColorMode();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", colorMode);
  }, [colorMode]);

  return children;
}


useEffect(() => {
  let hasShownOffline = false;
  let hasShownOnline = true; // 💡 assume initially online

  const showOfflineAlert = () => {
    Swal.fire({
      title: "No Internet!",
      text: "Please check your connection.",
      icon: "warning",
      allowOutsideClick: false,
      background: isDark ? "#14225C" : "#fff",
      color: isDark ? "#fff" : "#000",
      confirmButtonColor: isDark ? "#4A6CFF" : "#3085d6",
    });
  };

  const showOnlineAlert = () => {
    Swal.fire({
      title: "Back Online!",
      text: "Internet restored.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
      background: isDark ? "#14225C" : "#fff",
      color: isDark ? "#fff" : "#000",
    });
  };

  const handleConnectionChange = () => {
    if (!navigator.onLine) {
      if (!hasShownOffline) {
        showOfflineAlert();
        hasShownOffline = true;
        hasShownOnline = false;
      }
    } else {
      if (!hasShownOnline) {
        showOnlineAlert();
        hasShownOnline = true;
        hasShownOffline = false;
      }
    }
  };

  // Initial check
  handleConnectionChange();

  window.addEventListener("online", handleConnectionChange);
  window.addEventListener("offline", handleConnectionChange);

  return () => {
    window.removeEventListener("online", handleConnectionChange);
    window.removeEventListener("offline", handleConnectionChange);
  };
}, [isDark]);


  return (
    <UserProvider>
    <SelectedUserProvider>
      <ChakraProvider theme={currentTheme}>
        {/* ✅ Wrap all lazy routes with Suspense */}
        <ThemeWrapper>
        <Suspense
          fallback={
            <Center h="100vh">
              <Spinner size="xl" color="blue.500" />
            </Center>
          }
        >
          <Routes>
            <Route path="auth/*" element={<AuthLayout />} />
            <Route
              path="admin/*"
              element={<AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />}
            />
            <Route
              path="videocreate/*"
              element={<VideoLayout theme={currentTheme} setTheme={setCurrentTheme} />}
            />
            <Route path="rtl/*" element={<RTLLayout />} />
            <Route path="*" element={<NotFound />} />
            <Route
              path="/create-new-password/:token"
              element={<CreateNnewPassword />}
            />
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
        </ThemeWrapper>
      </ChakraProvider>
      </SelectedUserProvider>
    </UserProvider>
  );
}
