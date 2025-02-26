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
    <div className="main">
      <p className="title">Login</p>
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <div className="usernameInput">
            <input
              className="inputs"
              type="text"
              placeholder={'Username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="passwordInput">
            <input
              className="inputs"
              type="password"
              placeholder={'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button>
            {'Login'}
          </button>
          <p>
            {"Don't have an account?"} <Link to="/create-account">{'Create one here'}</Link>.
          </p>
          <p>
            {'Forgot your password?'} <Link to="/reset-password">{'Reset your password'}</Link>.
          </p>
        </form>
      </div>  
    </div>
  );
};

export default Login;
