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
        navigate('/');
      } else {
      }
      setUsername('');
      setPassword('');
    } catch (error) {
      console.log("error: " + error);
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
            {'Forgot your password?'} <Link to="/password-reset">{'Reset your password'}</Link>.
          </p>
        </form>
      </div>  
    </div>
  );
};

export default Login;
