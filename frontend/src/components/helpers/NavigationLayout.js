import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "./Header";
import NotificationSidebar from "./NotificationSidebar";

import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ForumIcon from "@mui/icons-material/Forum";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { getUser } from "./user-verification";
// Icons can be found here: https://mui.com/material-ui/material-icons/

const NavigationLayout = ({
  children,
  showHeader = false,
  headerSearchBar = null,
  headerSearchButton = null,
}) => {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(location.pathname === "/");
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);

  const [loggedInUsername, setLoggedInUsername] = useState(""); // Store the current user's username
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const user = await getUser();
        if (!user) {
          navigate("/login");
          return;
        }
        setLoggedInUsername(user.username); // Ensures state update
        console.log("WHERE IS MY " + loggedInUsername);
      } catch (error) {
        console.error("Error verifying user:", error);
      }
    };
    verifyUser();
  }, []);

  // Update expansion state when route changes
  useEffect(() => {
    setIsExpanded(location.pathname === "/");
  }, [location.pathname]);

  const navLinkStyles =
    "text-black no-underline px-2 py-2 rounded-md hover:bg-[#F4F5F6] transition-colors flex items-center gap-5";
  const labelStyles =
    "transition-all duration-300 overflow-hidden whitespace-nowrap";

  const toggleNotifications = () => {
    if (isExpanded) {
      setIsExpanded(false);
      setIsNotificationsVisible(true);
    } else {
      setIsNotificationsVisible(!isNotificationsVisible);
    }
  };

  // Add Navigation Items with Material UI icons here:

  const navItems = [
    { path: "/", label: "Home", icon: <HomeIcon /> },
    { path: "/my-map", label: "My Map", icon: <MapIcon /> },
    { path: "", label: "Explore", icon: <TravelExploreIcon /> },
    { path: "/itinerary", label: "Itineraries", icon: <ListAltIcon /> },
    { path: "", label: "Journals", icon: <DriveFileRenameOutlineIcon /> },
    { path: "/messages", label: "Messages", icon: <ForumIcon /> },
    {
      path: "",
      label: "Notifications",
      icon: <NotificationsIcon />,
      onClick: toggleNotifications,
    },
    {
      path: `/profile/${loggedInUsername}`,
      label: "Profile",
      icon: <PersonIcon />,
    },
    { path: "/logout", label: "Logout", icon: <LogoutIcon /> },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setIsNotificationsVisible(false);
  };

  console.log(isNotificationsVisible);

  return (
    <div className="min-h-screen bg-greyish">
      {/* Navigation Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50
        ${isExpanded ? "w-sidebar-expanded" : "w-sidebar-collapsed"}`}
      >
        <div className="h-full p-4 flex flex-col">
          {/* Menu Toggle Item */}
          <div
            className={`${navLinkStyles} mb-2`}
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
          >
            <div
              className={`min-w-[24px] transition-all duration-300 ease-in-out ${
                isExpanded ? "-rotate-90" : "rotate-0"
              }`}
            >
              <MenuIcon />
            </div>
            <span
              className={`${labelStyles} ${
                isExpanded ? "w-20 opacity-100" : "w-0 opacity-0"
              }`}
            >
              Menu
            </span>
          </div>

          {/* Divider */}
          <div className="mb-12"></div>

          {/* Navigation Items */}
          <div className="flex-1 flex flex-col gap-4">
            {navItems.map((item) => {
              if (item.label === "Profile") {
                return (
                  <Link
                    key="profile"
                    to={`/profile/${loggedInUsername}`}
                    className={navLinkStyles}
                  >
                    <span className="min-w-[24px]">{item.icon}</span>
                    <span
                      className={`${labelStyles} ${
                        isExpanded ? "w-24 opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      Profile
                    </span>
                  </Link>
                );
              } else if (item.label === "Notifications") {
                return (
                  <div
                    key="notifications"
                    className={navLinkStyles}
                    onClick={toggleNotifications}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="min-w-[24px]">
                      <NotificationsIcon />
                    </span>
                    <span
                      className={`${labelStyles} ${
                        isExpanded ? "w-24 opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      Notifications
                    </span>
                  </div>
                );
              } else {
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    className={navLinkStyles}
                  >
                    <span className="min-w-[24px]">{item.icon}</span>
                    <span
                      className={`${labelStyles} ${
                        isExpanded ? "w-24 opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              }
            })}
          </div>

          {/* Notification Sidebar */}
          {!isExpanded && isNotificationsVisible && (
            <NotificationSidebar
              closePanel={() => setIsNotificationsVisible(false)}
            />
          )}

          {/* Settings at bottom */}
          <div>
            <Link to="/settings" className={navLinkStyles}>
              <span className="min-w-[24px]">
                <SettingsIcon />
              </span>
              <span
                className={`${labelStyles} ${
                  isExpanded ? "w-24 opacity-100" : "w-0 opacity-0"
                }`}
              >
                Settings
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable Main Content */}
      <div
        className={`min-h-screen transition-all duration-300 ease-in-out
        ${isExpanded ? "ml-sidebar-expanded" : "ml-sidebar-collapsed"}`}
      >
        {showHeader && (
          <Header>
            {headerSearchBar}
            {headerSearchButton}
          </Header>
        )}
        <div className={`${showHeader ? "pt-header" : ""}`}>{children}</div>
      </div>
    </div>
  );
};
export default NavigationLayout;
