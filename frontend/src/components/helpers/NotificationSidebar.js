import React, { useState, useEffect } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MessageIcon from "@mui/icons-material/Message";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TagIcon from "@mui/icons-material/Tag";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatTimestamp } from "./messageComponents/formatTimestamp";

const notificationIcons = {
  "Follow Request": <PersonAddIcon />,
  "New Message": <MessageIcon />,
  "New Review": <StarIcon />,
  "New Journal": <AssignmentIcon />,
  "Post Liked": <ThumbUpIcon />,
  "Post Commented": <CommentIcon />,
  "End-of-day Reminder": <EventIcon />,
  "Upcoming Trip": <LocationOnIcon />,
  "Achievement Unlocked": <StarIcon />,
  Tagged: <TagIcon />,
  "Recommended Location": <VisibilityIcon />,
};

const NotificationSidebar = ({ isNotificationsVisible, closePanel }) => {
  const [notifications, setNotifications] = useState([]);
  const [handledRequests, setHandledRequests] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/api/noti/getNoti`,
          {
            headers: { "x-access-token": `${token}` },
          }
        );
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error loading notifications: ", error);
      }
    };

    getNotifications();
  }, []);

  const handleNotificationClick = async (noti) => {
    if (!noti.read) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:3001/api/noti/markNotiAsRead`,
          { notificationId: noti._id },
          {
            headers: { "x-access-token": `${token}` },
          }
        );

        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === noti._id
              ? { ...notification, read: true }
              : notification
          )
        );
      } catch (error) {
        console.error("Error marking message as read: ", error);
      }
    }
    if (noti.type === "New Message") {
      closePanel();
      navigate("/messages", { state: { selectedUserId: noti.senderId } });
    }
  };

  const handleFollowRequest = async (noti, action) => {
    const updatedStatus = action === "accept" ? "Accepted" : "Rejected";

    // Update UI immediately
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification._id === noti._id
          ? { ...notification, requestStatus: updatedStatus }
          : notification
      )
    );

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/api/noti/updateRequestStatus`,
        {
          notificationId: noti._id,
          requestStatus: updatedStatus,
        },
        { headers: { "x-access-token": token } }
      );

      // If accepted, call the follow route
      if (action === "accept") {
        await axios.post(
          `http://localhost:3001/api/user/acceptFollow/${noti._id}`,
          {},
          { headers: { "x-access-token": token } }
        );
      }

      if (action === "reject") {
        await axios.post(
          `http://localhost:3001/api/user/rejectFollow/${noti._id}`,
          {},
          { headers: { "x-access-token": token } }
        );
      }
    } catch (error) {
      console.error(`Error updating follow request status: `, error);
    }
  };

  return (
    <div
      className={`fixed top-0 h-full w-80 bg-greyish shadow-lg transform ${
        isNotificationsVisible ? "translate-x-0" : "translate-x-10"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="p-5 border-b flex justify-between items-center">
        <h3 className="font-semibold">Notifications</h3>
        <button className="text-gray-500 hover:text-black" onClick={closePanel}>
          ✖
        </button>
      </div>
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          <ul>
            {notifications.map((notif) => (
              <li
                key={notif._id}
                className={`flex items-center gap-3 p-2 border-b cursor-pointer
                          ${notif.read ? "" : "font-semibold"}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <span className="text-blue-300">
                  {notificationIcons[notif.type]}
                </span>
                <div>
                  <p className="text-sm">{notif.content}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimestamp(notif.timestamp)}
                  </span>
                  {notif.type === "Follow Request" && (
                    <div className="flex gap-2 mt-2">
                      {notif.requestStatus !== "NoActionYet" ? (
                        <span
                          className={`${
                            notif.requestStatus === "Accepted"
                              ? "text-green-600"
                              : "text-red-600"
                          } font-bold`}
                        >
                          {notif.requestStatus}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowRequest(notif, "accept");
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowRequest(notif, "reject");
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationSidebar;
