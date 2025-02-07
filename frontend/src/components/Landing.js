import React, { useState } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./styles/general.css"

const Landing = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Username:", username);
    console.log("Password:", password);
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
            {"Don't have an account?"} <Link to="/createaccount">{'Create one here'}</Link>.
          </p>
          <p>
            {'Forgot your password?'} <Link to="/passwordreset">{'Reset your password'}</Link>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Landing;
