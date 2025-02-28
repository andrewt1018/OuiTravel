import { useState, useEffect } from "react";
import axios from "axios";
import { formatTimestamp } from "./formatTimestamp";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SearchIcon from '@mui/icons-material/Search';

const MessageSidebar = ({ userId, selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [query, setQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3001/api/message/getUsersForSideBar`, {
          headers: { 'x-access-token': `${token}`}
        });
        setUsers(res.data.data);

        const allUsersRes = await axios.get(`http://localhost:3001/api/message/getAllUsers`, 
          {
            headers: { 'x-access-token': `${token}`}
          }
        )
        setFilteredUsers(allUsersRes.data.data);
        setAllUsers(allUsersRes.data.data);
      } catch (error) {
        console.error("Error fetching users for sidebar:", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 500); // Auto-refresh every 500ms
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (query) {
      const results = allUsers.filter(user =>
        user.username.toLowerCase().startsWith(query.toLowerCase()) 
      );
      setFilteredUsers(results);    
    
    } else {
      setFilteredUsers(allUsers);
    }
  }, [query, allUsers]);

  // Toggle the sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleUserSelect = async(user) => {
    console.log(user)
    setSelectedUser(user);
    setQuery("");
    if (user.unread) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(`http://localhost:3001/api/message/markMessageAsRead`, 
          { receiverId: user.userId },
          { headers: { 'x-access-token': `${token}` } }
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
  }

  return (
    <div
      className={`w-1/4 border-r border-gray-300 bg-white h-screen overflow-y-auto transition-transform duration-300 ${
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <header className="flex items-center justify-between border-b bg-blue-400 p-4 text-white">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <div className="relative">
          <button
            id="menuButton"
            className="focus:outline-none"
            // onClick={toggleSidebar} // Toggle sidebar visibility
          >
          <ArrowBackIosIcon/>
          </button>
        </div>
      </header>
      
      {/* Search */}
      <div className="relative mt-4">
        <SearchIcon sx={{ fontSize: 30 }} className="absolute inset-y-2 left-2 text-gray-300" />
        <input 
          type="text" 
          className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-md focus:outline-none"
          placeholder="Search user"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        
        {/* Show dropdown of filtered users */}
        {filteredUsers.length > 0 && query && (
          <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredUsers.map((user) => (
              <li
                key={user.userId}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => handleUserSelect(user)}
              >
                {user.username}
              </li>
            ))}
          </ul>
        )}
      </div>


      {/* Sidebar content */}
      {users.length === 0 ? (
        <p className="p-4 text-gray-500">No messages yet</p>
      ) : (
        users.map((user) => (
          <div
            key={user.userId}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition ${
              selectedUser?.userId === user.userId ? "bg-gray-200" : ""
            }${user.unread && user.userId !== userId ? 'font-bold relative' : ''}`}
            // onClick={() => setSelectedUser(user)}
            onClick={() => handleUserSelect(user)}
          >
            <img
              src={user.profilePic || "/default-avatar.png"}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold">{user.username}</h4>
                
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600 truncate w-[75%]">{user.lastMessage}</p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimestamp(user.lastMessageTime)}
                    </span>
                </div>
            </div>
            {/* {user.unread && user.userId !== userId && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></div> // Red dot indicating unread
            )} */}
          </div>
        ))
      )}

      {/* Expand button */}
      <div className="p-4">
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="bg-white text-purple-400 p-2 rounded-md block"
          >
            Expand Sidebar
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageSidebar;
