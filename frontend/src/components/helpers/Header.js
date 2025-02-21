import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ children }) => {
  return (
    <header className="fixed top-0 left-5 right-5 h-header bg-greyish flex items-center justify-between px-6 z-10 border-b border-grey-500">
      <div className="flex-1 min-w-60">
          {/* Empty div for spacing */}
      </div>
      {children}
      <div className="flex-1 flex justify-end">
          <Link to="/profile">
              <div className="w-10 h-10 rounded-full bg-gray-300 hover:opacity-80 transition-opacity">
                  <img
                      src=""
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                  />
              </div>
          </Link>
      </div>
    </header>
  );
};

export default Header;
