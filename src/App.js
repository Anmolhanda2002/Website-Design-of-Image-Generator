import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState, lazy, Suspense } from 'react';
import { UserProvider } from "./contexts/UserContext";
import CreateNnewPassword from 'views/auth/forgetpassword/Create_new_password';

// Lazy load layouts and pages
const AuthLayout = lazy(() => import('./layouts/auth'));
const AdminLayout = lazy(() => import('./layouts/admin'));
const VideoLayout = lazy(() => import('./layouts/VedioGeneration/Index.jsx'));
const RTLLayout = lazy(() => import('./layouts/rtl'));
const NotFound = lazy(() => import('views/404Page'));

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  return (
    <UserProvider>
      <ChakraProvider theme={currentTheme}>
        {/* ✅ Wrap all lazy routes with Suspense */}
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
      </ChakraProvider>
    </UserProvider>
  );
}
