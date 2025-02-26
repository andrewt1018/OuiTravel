const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../modules/User');
const Notification = require('../modules/Notification');

const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided.' });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.log("Verifying token failed.");
            return res.status(403).send({ message: 'Unauthorized' });
        }
        req.user = { id: decoded.id };
        console.log('Token verified successfully.');
        next();
    });
};


/* Get all the notifications of the users */
/* Might be redundant if the frontend retrieve all the user's info */
router.get('/getNoti', verifyToken, async (req, res) => {

    const userId = req.user.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(500).json({ message: 'User not found' });
        }

        const notifications = await Notification.find({
            receiverId: userId
        }).sort({ timestamp : -1});

        // TODO: Check noti settings

        return res.status(201).json({ notifications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error getting notifications.' });
    }
});


/* Delete a notification */

router.delete('/delete/:notiId', verifyToken, async (req, res) => {

    const userId = req.user.id;
    const notificationId = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(500).json({ message: 'User not found.' });
        }

        const deletedNoti = await Notification.findByIdAndDelete(notificationId);
        console.log(deletedNoti);

        return res.status(200).json({ message: 'Notification deleted successfully. '});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error deleting notification. '});
    }
});

router.post('/markNotiAsRead', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const {notificationId} = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(500).json({ message: 'User not found. '});
        }

        const noti = await Notification.findById(notificationId);
        noti.read = true;
        console.log("noti: ", noti);

        // Mark all message noti from the same user as read
        if (noti.type === 'New Message') {
            await Notification.updateMany(
                { senderId: noti.senderId, receiverId: userId}, 
                { $set : { read : true }}
            );
        }
        await noti.save();

        console.log(noti);
        
        return res.status(200).json({ message: 'Notification marked as read. '});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error marking noti as read.' });
    }

})

module.exports = router;