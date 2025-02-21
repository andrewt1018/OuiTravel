const express = require('express');
const User = require('../modules/User');
const Message = require('../modules/Message');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const router = express.Router();

// const { getReceiverSocketId, io } = require('../lib/socket.js');
const { verify } = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
    console.log("Verifying token")
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }
  
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log("Verifying token failed");
            return res.status(403).send({ message: 'Unauthorized' });
        }
        req.user = { id: decoded.id };
        console.log("Token verified successfully");
        next();
    });
};

/* Check if the user can send the message */
async function checkMutual(senderId, receiverId) {
    try {
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) return false;

        const senderFollowsReceiver = sender.followingList.includes(receiverId);
        const receiverFollowsSender = receiver.followingList.includes(senderId);

        return senderFollowsReceiver && receiverFollowsSender;
     
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;    
    }
} 


router.post('/sendMessage', verifyToken, async (req, res) => {

    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    console.log(req.body);

    try {
        if (!receiverId || !content) {
            return res.status(400).json({ message: 'Receiver and text are required.' });
        }
    
        const allowed = await checkMutual(senderId, receiverId);
    
        if (!allowed) {
            return res.status(403).json({ message: 'You can only message people who follow you back.' });
        }
    
        const newMessage = new Message({
            senderId,
            receiverId,
            content
        });
    
        await newMessage.save();
        console.log("new message: ", newMessage);

        // Socket
        // const receiverSocketId = getReceiverSocketId(receiverId);
        // if (receiverSocketId) {
        //     io.to(receiverSocketId).emit("newMessage", newMessage);
        // }

        res.status(201).json({ message: 'Message sent successfully.', data: newMessage });
    
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error sending message.' });

    }
});

/* Get message between 2 people */
router.get('/getMessage/:receiverId', verifyToken, async (req, res) => {

    const userId = req.user.id;
    // const userId = new mongoose.Types.ObjectId('67af70f25e51fce3c060ab4d');
    // const { receiverId } = req.params;
    const receiverId = new mongoose.Types.ObjectId(req.params.receiverId);
    console.log("userId: ", userId);
    console.log ("receiverId: ", receiverId);
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        }).sort({ timestamp: -1 }).lean();
        console.log("retrieve messages: ", messages);

        return res.status(200).json({ success: true, data: messages });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error loading message' });
    }
});


router.get('/getUsersForSideBar', verifyToken, async (req, res) => {

    // console.log(req.query);
    const userId = req.user.id;
    // const userId = new mongoose.Types.ObjectId(req.query.userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({ message: 'User not found' });
        }
        const messages = await Message.aggregate([
            { 
                $match: { 
                    $or: [{ senderId: user._id }, { receiverId: user._id }] 
                }
            },
            
            { 
                $sort: { timestamp: -1 } 
            },
        
            { 
                $group: {
                    _id: {
                        conversation: {
                            $cond: {
                                if: { $lt: ["$senderId", "$receiverId"] }, 
                                then: { $concat: [{ $toString: "$senderId" }, "_", { $toString: "$receiverId" }] },
                                else: { $concat: [{ $toString: "$receiverId" }, "_", { $toString: "$senderId" }] }
                            }
                        }
                    },
                    lastMessage: { $first: "$content" },       
                    lastMessageTime: { $first: "$timestamp" },  
                    senderId: { $first: "$senderId" },
                    receiverId: { $first: "$receiverId" },
                    unread: { $first: "$unread" }       
                }
            },
        
            { 
                $sort: { lastMessageTime: -1 }
            }
        ]);
        
        console.log("Final Result:", messages);

        let users = [];
        for (let msg of messages) {
            console.log("msg sender id: ", msg.senderId.toString());
            console.log("msg reciever id: ", msg.receiverId.toString());
            console.log("user id: ", user._id.toString());


            let otherUserId = msg.senderId.toString() === user._id.toString() 
                            ? msg.receiverId.toString() : msg.senderId.toString();
            let otherUser = await User.findById(otherUserId).select("username profilePic");
            
            if (otherUser) {
                users.push({
                    userId: otherUser._id,
                    username: otherUser.username,
                    profilePic: otherUser.profilePic,
                    lastMessage: msg.lastMessage,
                    lastMessageTime: msg.lastMessageTime,
                    unread: msg.unread && msg.receiverId.toString() === userId 
                });
            }
        }

        console.log("Side bar users data: ", users);
        return res.status(200).json({ data: users });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error loading users for sidebar' });
    }
});

router.post('/markMessageAsRead', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const {receiverId} = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(200).json({ message: 'User not found' });
        }
        await Message.updateMany({
            $or: [                   
                { senderId: receiverId, receiverId: userId }
            ],
            unread: true
        }, 
        {
            $set: {unread: false}
        }
        );

        return res.status(200).json({ message: "Messages marked as read"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error marking messages as read' });
    }
});

module.exports = router;