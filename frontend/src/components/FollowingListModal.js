import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FollowingListModal({ isOpen, onClose, followingList }) {
  if (!isOpen) return null; // Prevent rendering when modal is closed

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
          <h2 className="text-xl font-bold mb-4">Following</h2>
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            ✖
          </button>
          <FollowingList followingList={followingList} />
        </div>
      </div>
    </>
  );
}

function FollowingList({ followingList }) {
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    async function fetchUsersData() {
      try {
        const usersArray = [];

        for (const userId of followingList) {
          try {
            const res = await axios.get(
              `http://localhost:3001/api/user/${userId}`
            );
            const user = res.data;

            let profileImageUrl = null;

            if (user.profilePic) {
              try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                  `http://localhost:3001/api/upload/get-image?id=${user.profilePic}`,
                  {
                    headers: { "x-access-token": token },
                  }
                );

                if (response.data && response.data.imageUrl) {
                  profileImageUrl = response.data.imageUrl;
                }
              } catch (error) {
                console.error(
                  `Error fetching profile image for ${user.username}:`,
                  error
                );
              }
            }

            usersArray.push({ ...user, profilePic: profileImageUrl });
          } catch (error) {
            console.error(`Error fetching user data for ID ${userId}:`, error);
          }
        }

        setUsersData(usersArray);
      } catch (error) {
        console.error("Error fetching following users:", error);
      }
    }

    if (followingList.length > 0) {
      fetchUsersData();
    }
  }, [followingList]);

  return (
    <div className="max-h-80 overflow-y-auto">
      {followingList.length > 0 ? (
        usersData.length === 0 ? (
          <div>Loading...</div>
        ) : (
          usersData.map((user) => (
            <div
              key={user._id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <img
                src={user.profilePic || "/default-avatar.png"}
                alt="Profile"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                }}
              />
              <h3 style={{ marginLeft: "10px" }}>{user.username}</h3>
            </div>
          ))
        )
      ) : (
        <div>No Following</div>
      )}
    </div>
  );
}
