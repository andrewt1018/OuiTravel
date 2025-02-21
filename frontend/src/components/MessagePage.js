import { useState, useEffect } from 'react'; 

import NoChatSelected from './helpers/messageComponents/NoChatSelected.js';
import MessageSidebar from './helpers/messageComponents/MessageSidebar.js';
import MessageContainer from './helpers/messageComponents/MessageContainer.js';
import { getUser } from './helpers/user-verification.js';
import { Navigate, useNavigate } from 'react-router-dom';

import axios from 'axios'; 

import "../index.css";

function MessagePage() {

    // const currentUser = '67af70f25e51fce3c060ab4d';  // Mock user ID
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    
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
        verifyUser();
    }, []);

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
