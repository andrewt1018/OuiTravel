import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const MessageContainer = ({ userId, selectedUser }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [canMessage, setCanMessage] = useState(true);
    const messageEnd = useRef(null);
    const messageContainerRef = useRef(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true); 

    useEffect(() => {
        if (!selectedUser) return;

        setCanMessage(true);
        setIsFirstLoad(true);

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await axios.get(`http://localhost:3001/api/message/getMessage/${selectedUser.userId}`, {
                    headers: { 'x-access-token': `${token}`}
                });

                const newMessages = res.data.data.reverse();
                setMessages(newMessages);
                if (isFirstLoad) {
                    autoScroll(); 
                    setIsFirstLoad(false);
                } else if (isAtBottom) {
                    autoScroll(); 
                }

            } catch (error) {
                console.error("Error loading messages:", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 1000000); // Auto-refresh every 500ms
        return () => clearInterval(interval);
    }, [selectedUser, userId]);
    
    
    const sendMessage = async () => {
        if (!messageText.trim() || !canMessage) return;

        try {
            const token = localStorage.getItem("token");

            const res = await axios.post("http://localhost:3001/api/message/sendMessage", 
            {
                receiverId: selectedUser.userId,
                content: messageText,
            },
            { 
                headers: { 'x-access-token': `${token}`},
            }
            );

            setMessageText("");
            setIsAtBottom(true); 
            autoScroll();
        } catch (error) {
            if (error.response.status === 403 && error.response.data.message === 'You can only message people who follow you back.') {
                setCanMessage(false);
                toast.error("You can only message people who follow you back.");
            }
            console.error("Error sending message:", error);
            setMessageText("");
        }
    };

    const handleEnter = (e) => {
        if (e.key === "Enter" ) {
            e.preventDefault();
            sendMessage();
        }
    };

    const autoScroll = () => {
        messageEnd.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = () => {
        if (!messageContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 10);
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            <div className="p-4 bg-white shadow-md flex items-center">
                <img
                src={selectedUser.profilePic || "/selena.jpg"}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full mr-3"
                />
                <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
            </div>

            <div 
                className="flex-1 overflow-y-auto p-4"
                ref={messageContainerRef}
                onScroll={handleScroll}
            >

                {messages.length === 0 ? (
                <p className="text-center text-gray-50000">No messages yet</p>
                ) : (
                messages.map((msg) => (
                    <div
                    key={msg._id}
                    className={`mb-2 flex ${
                        msg.senderId === userId ? "justify-end" : "justify-start"
                    }`}
                    >
                    {/* Display opponent's profile picture only when the message is from the opponent */}
                    {msg.senderId !== userId && (
                    <div className="mr-2">
                        <img
                        src={selectedUser.profilePic || "/selena.jpg"} // Display opponent's avatar or fallback image
                        className="w-10 h-10 rounded-full"
                        alt={selectedUser.username}
                        />
                    </div>
                    )}
                    <div
                        className={`p-2.5 rounded-lg max-w-xs ${
                        msg.senderId === userId
                            ? "bg-blue-400 text-white"
                            : "bg-gray-200 text-gray-800"
                        }`}
                    >
                        {msg.content}
                    </div>
            </div>
                ))
                )}
            <div ref={messageEnd} />
        </div>

        <div className="p-4 bg-white border-t flex items-center">
            {canMessage ? (
                        <>
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={handleEnter}
                                placeholder="Type a message..."
                                className="flex-1 p-2 border rounded-lg"
                            />
                            <button
                                onClick={sendMessage}
                                className="ml-2 px-4 py-2 bg-blue-400 text-white rounded-lg"
                            >
                                Send
                            </button>
                        </>
                    ) : (
                        <p className="text-center text-red-500">You can only message users who follow you.</p>
                    )}
                </div>
        </div>
    );
};

export default MessageContainer;
