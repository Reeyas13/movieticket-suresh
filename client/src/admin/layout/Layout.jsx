import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Check if the screen is mobile and handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Only auto-collapse sidebar on mobile, keep user preference on desktop
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarMobileOpen(!sidebarMobileOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Close sidebar when clicking outside on mobile
  const closeSidebarOnMobile = () => {
    if (isMobile && sidebarMobileOpen) {
      setSidebarMobileOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebarOnMobile}
        ></div>
      )}
      
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
        isVisible={isMobile ? sidebarMobileOpen : true}
      />
      
      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          (!isMobile && !sidebarCollapsed) ? 'lg:ml-64' : 
          (!isMobile && sidebarCollapsed) ? 'lg:ml-16' : 'ml-0'
        }`}
      >
        <Header 
          toggleSidebar={toggleSidebar} 
          isMobile={isMobile}
          sidebarCollapsed={sidebarCollapsed}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 pt-16">
          {children}
        </main>
        
        <footer className="bg-white p-3 sm:p-4 text-center text-gray-600 text-xs sm:text-sm border-t">
          <strong>Copyright &copy; {new Date().getFullYear()}</strong> Admin LTE Dashboard
          <span className="float-right hidden md:inline">Powered by <a href="#" className="text-blue-600 hover:underline">Jobportal</a></span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
