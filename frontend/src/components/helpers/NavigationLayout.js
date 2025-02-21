import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import ForumIcon from '@mui/icons-material/Forum';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
// Icons can be found here: https://mui.com/material-ui/material-icons/

const NavigationLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const navLinkStyles = "text-black no-underline px-2 py-2 rounded-md hover:bg-[#F4F5F6] transition-colors flex items-center gap-5";
  const labelStyles = "transition-all duration-300 overflow-hidden whitespace-nowrap";
  
  // Add Navigation Items with Material UI icons here:
  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/my-map', label: 'My Map', icon: <MapIcon /> },
    { path: '', label: 'Explore', icon: <TravelExploreIcon /> },
    { path: '', label: 'Journals', icon: <DriveFileRenameOutlineIcon /> },
    { path: '', label: 'Messages', icon: <ForumIcon /> },
    { path: '', label: 'Notifications', icon: <NotificationsIcon /> },
    { path: '/profile', label: 'Profile', icon: <PersonIcon /> },

  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="min-h-screen bg-">
      {/* Navigation Sidebar */}
      <div className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50
        ${isExpanded ? 'w-sidebar-expanded' : 'w-sidebar-collapsed'} bg-greyish`}>
        <div className="h-full p-4 flex flex-col">
          {/* Menu Toggle Item */}
          <div 
            className={`${navLinkStyles} mb-2`}
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
          >
            {/* MenuIcon */}
            <div className={`min-w-[24px] transition-all duration-300 ease-in-out ${isExpanded ? '-rotate-90' : 'rotate-0'}`}>
              <MenuIcon />
            </div>
            <span className={`${labelStyles} ${isExpanded ? 'w-20 opacity-100' : 'w-0 opacity-0'}`}>
              Menu
            </span>
          </div>

          {/* Divider */}
          <div className="border-b border-grey-50 mb-12"></div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={navLinkStyles}
              >
                <span className="min-w-[24px]">{item.icon}</span>
                <span className={`${labelStyles} ${isExpanded ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Settings at bottom */}
          <div>
            <Link 
              to="/settings"
              className={navLinkStyles}
            >
              <span className="min-w-[24px]">
                <SettingsIcon />
              </span>
              <span className={`${labelStyles} ${isExpanded ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out
        ${isExpanded ? 'ml-sidebar-expanded' : 'ml-sidebar-collapsed'}`}>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default NavigationLayout;
