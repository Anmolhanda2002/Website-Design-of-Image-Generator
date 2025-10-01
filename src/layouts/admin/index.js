// Chakra imports
import { Portal, Box, useDisclosure } from '@chakra-ui/react';
import Footer from 'components/footer/FooterAdmin.js';
import Navbar from 'components/navbar/NavbarAdmin.js';
import Sidebar from 'components/sidebar/Sidebar.js';
import { SidebarContext } from 'contexts/SidebarContext';
import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import routes from 'routes.js';

export default function Dashboard(props) {
  const { ...rest } = props;
  const [loading, setLoading] = useState(true); // for checking auth
  const [user, setUser] = useState(null); // logged-in user
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const [allowedRoutes, setAllowedRoutes] = useState([]);
  const [fixed] = useState(false);
  const { onOpen } = useDisclosure();

  // Define role-based access
  const checkAccess = (route, user) => {
    if (!route.roles) return true; // if no roles defined, everyone can see
    return route.roles.includes(user.role);
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('user'));
    if (!u) {
      setLoading(false); // not logged in
    } else {
      setUser(u);
      // Filter routes based on user role
      const filtered = routes.filter(r => r.layout === '/admin' && checkAccess(r, u));
      setAllowedRoutes(filtered);
      setLoading(false);
    }
  }, []);

  if (loading) return null; // don't render anything until checked
  if (!user) return <Navigate to="/auth/sign-in" replace />; // redirect if not logged in

  const getRoute = () => window.location.pathname !== '/admin/full-screen-maps';

  const getActiveRoute = (routesList) => {
    let activeRoute = 'Default Brand Text';
    for (let i = 0; i < routesList.length; i++) {
      const route = routesList[i];
      if (route.collapse) {
        const collapseActiveRoute = getActiveRoute(route.items);
        if (collapseActiveRoute !== activeRoute) return collapseActiveRoute;
      } else if (route.category) {
        const categoryActiveRoute = getActiveRoute(route.items);
        if (categoryActiveRoute !== activeRoute) return categoryActiveRoute;
      } else {
        if (window.location.href.indexOf(route.layout + route.path) !== -1) {
          return route.name;
        }
      }
    }
    return activeRoute;
  };

  const getActiveNavbar = (routesList) => {
    let activeNavbar = false;
    for (let i = 0; i < routesList.length; i++) {
      const route = routesList[i];
      if (route.collapse) {
        const collapseActiveNavbar = getActiveNavbar(route.items);
        if (collapseActiveNavbar !== activeNavbar) return collapseActiveNavbar;
      } else if (route.category) {
        const categoryActiveNavbar = getActiveNavbar(route.items);
        if (categoryActiveNavbar !== activeNavbar) return categoryActiveNavbar;
      } else {
        if (window.location.href.indexOf(route.layout + route.path) !== -1) {
          return route.secondary;
        }
      }
    }
    return activeNavbar;
  };

  const getActiveNavbarText = (routesList) => {
    let activeNavbar = false;
    for (let i = 0; i < routesList.length; i++) {
      const route = routesList[i];
      if (route.collapse) {
        const collapseActiveNavbar = getActiveNavbarText(route.items);
        if (collapseActiveNavbar !== activeNavbar) return collapseActiveNavbar;
      } else if (route.category) {
        const categoryActiveNavbar = getActiveNavbarText(route.items);
        if (categoryActiveNavbar !== activeNavbar) return categoryActiveNavbar;
      } else {
        if (window.location.href.indexOf(route.layout + route.path) !== -1) {
          return route.messageNavbar;
        }
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routesList) =>
    routesList.map((route, key) => {
      if (route.layout === '/admin') {
        return <Route path={route.path} element={route.component} key={key} />;
      }
      if (route.collapse) return getRoutes(route.items);
      return null;
    });

  document.documentElement.dir = 'ltr';

  return (
    <Box>
      <SidebarContext.Provider value={{ toggleSidebar, setToggleSidebar }}>
        <Sidebar routes={allowedRoutes} display="none" {...rest} />
        <Box
          float="right"
          minHeight="100vh"
          height="100%"
          overflow="auto"
          position="relative"
          maxHeight="100%"
          w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
          transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
        >
          <Portal>
            <Box>
              <Navbar
                onOpen={onOpen}
                logoText="Project Name"
                brandText={getActiveRoute(allowedRoutes)}
                secondary={getActiveNavbar(allowedRoutes)}
                message={getActiveNavbarText(allowedRoutes)}
                fixed={fixed}
                {...rest}
              />
            </Box>
          </Portal>

          {getRoute() && (
            <Box mx="auto" p={{ base: '20px', md: '30px' }} pe="20px"  minH="100vh" pt="50px">
              <Routes>
                {getRoutes(allowedRoutes)}
                <Route path="/" element={<Navigate to="/admin/default" replace />} />
              </Routes>
            </Box>
          )}
        </Box>
      </SidebarContext.Provider>
    </Box>
  );
}
