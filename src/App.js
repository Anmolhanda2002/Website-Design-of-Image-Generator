import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  ChakraProvider,
} from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState, lazy,  } from 'react';

// Lazy load layouts and pages
const AuthLayout = lazy(() => import('./layouts/auth'));
const AdminLayout = lazy(() => import('./layouts/admin'));
const RTLLayout = lazy(() => import('./layouts/rtl'));
const NotFound = lazy(() => import('views/404Page'));
import { UserProvider } from "./contexts/UserContext";
export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  return (
        <UserProvider>
    <ChakraProvider theme={currentTheme}>
      {/* Suspense shows fallback while lazy components load */}
      
        <Routes>
          <Route path="auth/*" element={<AuthLayout />} />
          <Route path="admin/*" element={<AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />} />
          <Route path="rtl/*" element={<RTLLayout />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
  
    </ChakraProvider>
    </UserProvider>
  );
}
