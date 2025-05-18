import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ collapsed, toggleSidebar, isMobile, isVisible }) => {
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      path: '/',
    },
    {
      title: 'Companies',
      icon: 'fas fa-building',
      path: '/admin/companies',
      // submenu: [
      //   { title: 'Add Company', path: '/admin/companies/add' },
      // ],
    },
    {
      title: 'Users',
      icon: 'fas fa-users',
      path: '/admin/users',
      // submenu: [
      //   { title: 'Add User', path: '/admin/users/add' },
      //   { title: 'Show Users', path: '/admin/users/show' },
      // ],
    },
    {
      title: 'Job Categories',
      icon: 'fas fa-list',
      path: '/admin/categories',
    },
    {
      title: 'Jobs',
      icon: 'fas fa-briefcase',
      path: '/admin/jobs',
    },
    {
      title: 'JobSeeker',
      icon: 'fas fa-user-tie',
      path: '/admin/jobseekers',
    },
    {
      title: 'Job Applications',
      icon: 'fas fa-file-alt',
      path: '/admin/job-applications',
    },
    {
      title: 'Platform Notice',
      icon: 'fas fa-bullhorn',
      path: '/admin/notices',
    },
    {
      title: 'Skills',
      icon: 'fas fa-certificate',
      path: '/admin/skills',
    },
    {
      title: 'Job Skills',
      icon: 'fas fa-tasks',
      path: '/admin/jobskills',
    }
  ];

  const isActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.path);
    }
    return false;
  };

  const isSubMenuActive = (path) => {
    return location.pathname === path;
  };

  const toggleMenu = (index) => {
    setActiveMenu(activeMenu === index ? null : index);
  };

  React.useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu && item.submenu.some(subItem => location.pathname === subItem.path)) {
        setActiveMenu(index);
      }
    });
  }, [location.pathname]);

  const sidebarClasses = `bg-gray-800 text-white h-screen transition-all duration-300 fixed left-0 top-0 z-50 
    ${collapsed && !isMobile ? 'w-16' : 'w-64'} 
    ${isMobile ? (isVisible ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    flex flex-col shadow-xl`;

  return (
    <div className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
        {(!collapsed || isMobile) && (
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-400">Admin</span>
            <span className="text-xl font-bold ml-1">LTE</span>
          </Link>
        )}
        {collapsed && !isMobile && (
          <Link to="/" className="w-full flex justify-center">
            <span className="text-xl font-bold text-blue-400">A</span>
          </Link>
        )}
        
        {!isMobile && (
          <button 
            onClick={toggleSidebar} 
            className="text-gray-400 hover:text-white focus:outline-none transition-colors duration-200 h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            <i className={`fas ${collapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        )}
        
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white focus:outline-none h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      <div className="py-4 overflow-y-auto scrollbar-thin flex-1">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-1 px-2">
              {item.submenu ? (
                <div>
                  <div 
                    className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 rounded-md ${
                      isActive(item) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                    onClick={() => toggleMenu(index)}
                  >
                    <i className={`${item.icon} ${collapsed && !isMobile ? 'w-full text-center text-lg' : 'w-6 text-center'}`}></i>
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="ml-3 font-medium">{item.title}</span>
                        <i className={`fas fa-angle-${activeMenu === index ? 'down' : 'left'} ml-auto`}></i>
                      </>
                    )}
                  </div>
                  {(!collapsed || isMobile) && activeMenu === index && (
                    <ul className="bg-gray-700 mt-1 rounded-md overflow-hidden">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center pl-12 pr-4 py-2 text-sm transition-colors duration-200 ${
                              isSubMenuActive(subItem.path) ? 'bg-gray-600 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                            }`}
                          >
                            <span className="font-medium">{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 rounded-md ${
                    isActive(item) ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                  }`}
                >
                  <i className={`${item.icon || 'fas fa-circle'} ${collapsed && !isMobile ? 'w-full text-center text-lg' : 'w-6 text-center'}`}></i>
                  {(!collapsed || isMobile) && <span className="ml-3 font-medium">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-auto p-4 border-t border-gray-700">
        <div className="flex items-center">
          <img 
            src="https://randomuser.me/api/portraits/men/1.jpg" 
            alt="User" 
            className="h-8 w-8 rounded-full object-cover"
          />
          {(!collapsed || isMobile) && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
