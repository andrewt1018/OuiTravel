import { useState, useEffect } from "react";
import axios from "axios";

const MessageSidebar = ({ userId, selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false); 

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:3001/api/message/getUsersForSideBar`, {
          headers: { 'x-access-token': `${token}`}
        });
        console.log(res);
        setUsers(res.data.data);
      } catch (error) {
        console.error("Error fetching users for sidebar:", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 500000); // Auto-refresh every 500ms
    return () => clearInterval(interval);
  }, [userId]);

  // Toggle the sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleUserSelect = async(user) => {
    console.log(user)
    setSelectedUser(user);
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-100"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M2 10a2 2 0 012-2h12a2 2 0 012 2 2 2 0 01-2 2H4a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Sidebar content */}
      {users.length === 0 ? (
        <p className="p-4 text-gray-500">No messages yet</p>
      ) : (
        users.map((user) => (
          <div
            key={user.userId}
            className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 transition ${
              selectedUser?.userId === user.userId ? "bg-gray-200" : ""
            }${user.unread ? 'bg-gray-300' : ''}`}
            // onClick={() => setSelectedUser(user)}
            onClick={() => handleUserSelect(user)}
          >
            <img
              src={user.profilePic || "/selena.jpg"}
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

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

export default MessageSidebar;
