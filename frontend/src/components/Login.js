import React, { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "./styles/general.css"

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Add your login logic here
    try {
      const res = await axios.post('http://localhost:3001/api/auth/login', { username, password });
      console.log(res.data);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('username', res.data.username);
        if (navigator.geolocation) {
          if (navigator.geolocation) {
              // navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError, geoLocationOptions);
              navigator.geolocation.getCurrentPosition(position => {
                const location = {
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude
                };
                console.log("Current location:", location);
                localStorage.setItem('currLocation', JSON.stringify(location));
              });
              console.log("Cached current locations")
          } else {
              console.log("Geolocation not supported");
          }
      }
        navigate('/');
      } else {
        console.error("Token not returned from login");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        console.log("Error: " + error);
      }
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800">Welcome to OuiTravel!</h1>
          <h2 className="text-xl font-medium text-center text-gray-600 mt-4">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Login
            </button>
            <p className="text-center text-gray-700">
              Don't have an account? <Link className="underline text-blue-600 hover:text-blue-800" to="/create-account">Create one here</Link>.
            </p>
            <p className="text-center text-gray-700">
              Forgot your password? <Link className="underline text-blue-600 hover:text-blue-800" to="/reset-password">Reset your password</Link>.
            </p>
          </form>
        </div>
      </div>
    );
};

export default Login;
