import { useState, useEffect } from 'react'; 
import axios from 'axios';

import NoChatSelected from './helpers/messageComponents/NoChatSelected.js';
import MessageSidebar from './helpers/messageComponents/MessageSidebar.js';
import MessageContainer from './helpers/messageComponents/MessageContainer.js';
import { getUser } from './helpers/user-verification.js';
import { useNavigate, useLocation } from 'react-router-dom';


import "../index.css";

function MessagePage() {

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    const verifyUser = async () => {
        try {
            const user = await getUser();
            if (!user) {
                alert("User not logged in!");
                navigate('/login');
                return;
            }
            setCurrentUser(user._id);  
        } catch (error) {
            console.error("Error fetching user:", error);
            alert("An error occurred while fetching user data.");
            navigate('/login');
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                await verifyUser();

                console.log(location); 

                if (location.state && location.state.selectedUserId) {
                    const token = localStorage.getItem("token");

                    const res = await axios.get(`http://localhost:3001/api/message/getMessUser/${location.state.selectedUserId}`, {
                        headers: { 'x-access-token': `${token}` }
                    });

                    setSelectedUser(res.data);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchUser();
    }, [location.state]);  

    if (currentUser === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-16 h-16 bg-purple-300 rounded-full animate-pulse"></div>
            </div>
        );
    }



    return (
        <div className="bg-blue-100 h-screen w-full"> 
        <div className="flex items-center justify-center  h-full w-full">  {/* Padding: px-4 pt-20 */}
            <div className="bg-blue-100 shadow-cl h-full w-full max-w-full"> 
                <div className="flex h-full overflow-hidden ">
                    <MessageSidebar
                    userId={currentUser}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    />
                    {!selectedUser ? (
                    <NoChatSelected />
                    ) : (
                    <MessageContainer userId={currentUser} selectedUser={selectedUser} />
                    )}
                </div>
            </div>
        </div>
        </div>
    );
}

export default MessagePage;
