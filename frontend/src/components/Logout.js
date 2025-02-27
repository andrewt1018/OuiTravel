import React, { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            localStorage.clear();
            navigate('/login');
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
                <h1 className="text-3xl font-semibold text-center text-gray-800">Logout</h1>
                <h2 className="text-xl font-medium text-center text-gray-600 mt-4">Are you sure you want to logout?</h2>
                <div className="flex justify-center mt-6">
                    <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Logout</button>
                </div>
            </div>
        </div>
    );
}

export default Logout;