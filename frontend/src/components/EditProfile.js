import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getUser } from './helpers/user-verification';

const EditProfile = () => {
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newProfilePic, setNewProfilePic] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newGender, setNewGender] = useState('');
    const [newDOB, setNewDOB] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const verifyUser = async () => {
        const user = await getUser();
        if (!user) {
            alert("User not logged in!");
            navigate('/login');
            return;
        }
        console.log(user);

        setNewFirstName(user.firstName);
        setNewLastName(user.lastName);
        setNewProfilePic(user.profilePic);
        setNewUsername(user.username);
        setNewEmail(user.email);
        setNewBio(user.bio);
        setNewGender(user.gender);
        const formattedDOB = user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
        setNewDOB(formattedDOB);
    };

    useEffect(() => {
        verifyUser();
    }, []);

    const handleSubmit = async (event) => {
        
        const formData = {
            newProfilePic: newProfilePic,
            newFirstName: newFirstName,
            newLastName: newLastName,
            newUsername: newUsername,
            newEmail: newEmail,
            newBio: newBio,
            newGender: newGender,
            newDOB: newDOB,
            
        };
        console.log(formData);

        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://localhost:3001/api/user/edit-profile`,
                formData,
                {
                    headers: { 'x-access-token': `${token}`},
                });

            alert("Profile updated successfully!");
            
        } catch (error) {
            console.error("Error updating profile: ", error);
            alert("An error occured. Try again later.");
        }
    };

    const handleRetypePassword = async (e) => {
        const value = e.target.value;
        setRetypePassword(value);
        if (value !== newPassword) {
            setPasswordError("Password does not match!");
        }
        else {
            setPasswordError("");
        }
    };

    const handlePasswordChange = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:3001/api/auth/changePassword",
            { 
                currentPassword: currentPassword,
                newPassword : newPassword
            }, 
            {
                headers: {'x-access-token' : `${token}`}
            });

            alert("Password updated successfully.");


        } catch (error) {
            console.error("Error changing password: ", error);
            alert("An error occured. Please try again");
        }
    };

    return (
        <div >
                

            {/* Main Content */}
            <div className="pt-4">
                <h1 className="py-2 text-2xl font-semibold">Account settings</h1>
            </div>
            <hr className="mt-4 mb-8" />

            {/* Profile Section */}
            <p className="py-2 text-xl font-semibold">Profile Picture</p>
            <div className="flex items-center gap-6 mb-8">
                <img
                    className="h-16 w-16 object-cover rounded-full"
                    src="/selena.jpg"
                    alt="Profile Avatar"
                />
                <div className="flex flex-col items-start">
                    <span className='text-xl font-semibold text-gray-800'>{newUsername}</span>
                    <button className="inline-flex text-sm font-semibold text-blue-600 underline decoration-2">Change photo</button>
                {/* <span className="text-sm text-gray-500">For best results, upload an image axa or larger.</span> */}
                </div>
            </div>

            {/* General info Fields */}
            <p className="py-2 text-xl font-semibold">Account Information</p>
            <div className="flex items-center gap-4 mb-8">
                <div className="flex flex-col w-full">
                <label htmlFor="first-name" className="text-sm text-gray-500">First Name</label>
                <input
                    type="text"
                    id="first-name"
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Selena"
                    className="p-2 border rounded"
                />
                </div>
                <div className="flex flex-col w-full">
                <label htmlFor="last-name" className="text-sm text-gray-500">Last Name</label>
                <input
                    type="text"
                    id="last-name"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Gomez"
                    className="p-2 border rounded"
                />
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="flex flex-col w-full">
                    <label htmlFor="email" className="text-sm text-gray-500">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="selenagomez@gmail.com"
                        className="p-2 border rounded"
                    />
                </div>
                {/* <button className="inline-flex text-sm font-semibold text-blue-600 underline decoration-2">Change</button> */}
            </div>

            <div className='flex items-center gap-4 mb-8'>
                <div className='flex flex-col w-full'>
                    <label htmlFor='Bio' className='text-sm text-gray-500'>Bio</label>
                    <input
                        type="bio"
                        id="bio"
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        placeholder="This is my bio"
                        className="p-2 border rounded"
                    />
                </div>
            </div>

            <div className='flex items-top gap-4 mb-8'>
                <div className='flex flex-col w-full'>
                    <label htmlFor='DOB' className='text-sm text-gray-500'>Date of Birth</label>
                    <input
                    type="date"
                    value={newDOB}
                    onChange={(e) => setNewDOB(e.target.value)}
                    className="p-2 w-full border rounded"
                    />
                </div>
                <div className='flex flex-col w-full'>
                    <label htmlFor='Gender' className='text-sm text-gray-500'>Gender</label>
                    <select 
                        value={newGender}
                        onChange={(e) => setNewGender(e.target.value)}
                        className='p-2 w-full border rounded' 
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select> 
                </div>
            </div>


            <button
            onClick={handleSubmit}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white"
            >Save change</button>

            <hr className="mt-4 mb-8" />

            {/* Password Section */}
            <p className="py-2 text-xl font-semibold">Password</p>
            <div className="flex items-center mb-8">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
                <label htmlFor="current-password" className="text-sm text-gray-500">Current Password</label>
                <input
                    type="password"
                    id="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="***********"
                    className="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none rounded-md"
                />
                <label htmlFor="new-password" className="text-sm text-gray-500">New Password</label>
                <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="***********"
                    className="w-full flex-shrink appearance-none border-gray-300 bg-white py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none rounded-md"
                />
                </div>
                <label htmlFor="retype-password" className="text-sm text-gray-500">Retype New Password</label>
                <input
                    type="password"
                    id="retype-password"
                    value={retypePassword}
                    onChange={handleRetypePassword}
                    placeholder="***********"
                    className={`w-full flex-shrink appearance-none border-2 py-2 px-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none rounded-md ${passwordError ? 'border-red-500' : 'border-gray-300'}`}                 
                />

                {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p> // Display error message
                )}
                
                {/* <button 
                className="mt-5 ml-2 h-6  cursor-pointer text-sm font-semibold text-gray-600 underline decoration-2">Show Password</button> */}
            </div>
            <p className="mt-2">Can't remember your current password? <a className="text-sm font-semibold text-blue-600 underline decoration-2" href="/reset-password">Reset </a></p>
            <button onClick={handlePasswordChange}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white">Save Password</button>

            <hr className="mt-4 mb-8" />

            {/* Delete Account Section */}
            {/* <div className="mb-10">
                <p className="py-2 text-xl font-semibold">Delete Account</p>
                <p className="inline-flex items-center rounded-full bg-rose-100 px-4 py-1 text-rose-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                Proceed with caution
                </p>
                <p className="mt-2">Make sure you have taken backup of your account in case you ever need to get access to your data. We will completely wipe your data. There is no way to access your account after this action.</p>
                <button className="ml-auto text-sm font-semibold text-rose-600 underline decoration-2">Continue with deletion</button>
            </div> */}
        </div>
    );
};

export default EditProfile;
