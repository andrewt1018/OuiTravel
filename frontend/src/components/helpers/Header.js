import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import { useNavigate } from 'react-router-dom';
import { getUser } from './user-verification';

const Header = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        const loggedInUser = await getUser();
        if (!loggedInUser) {
          navigate("/login");
          return;
        }
        setUser(loggedInUser);
        console.log("logged in user: ", loggedInUser);
          
        // If user has a profile picture, set it
        if (loggedInUser.profilePic) {
          setProfilePic(`http://localhost:3001/api/upload/images/${loggedInUser.profilePic}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  // Handle image loading error
  const handleImageError = () => {
    setProfilePic(null);
  };

  return (
    <header className="fixed top-0 left-5 right-5 h-header bg-greyish flex items-center justify-between px-6 z-10 border-b border-grey-500">
      <div className="flex-1 min-w-60">
          {/* Empty div for spacing */}
      </div>
      {children}
      <div className="flex-1 flex justify-end">
          <Link to="/profile">
              <Avatar
                src={profilePic}
                alt={user?.username || 'Profile'}
                onError={handleImageError}
                sx={{ 
                  width: 40, 
                  height: 40,
                  '&:hover': { opacity: 0.8 },
                  transition: 'opacity 0.3s'
                }}
              />
          </Link>
      </div>
    </header>
  );
};

export default Header;
