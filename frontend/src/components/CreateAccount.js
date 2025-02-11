import React, { useState } from "react";
import axios from 'axios';
import "./styles/general.css"

function CreateAccount() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPass, setReenterPass] = useState('');
    const [err, setErr] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        // Add your login logic here
        console.log("Username:", username);
        console.log("Password:", password);
        if (password !== reenterPass) {
            setErr('Passwords do not match!');
            return;
        }

        try {
            await axios.post('http://localhost:3001/api/auth/register', {
                username,
                email,
                password,
            });
            alert('Account created successfully');
            window.location.href = '/login'; 
        } catch (error) {
            console.error(err.message);
            alert(error);
        }
      };

    return (
        <div className="main">
            <p className="title">Create Account</p>
            <div className="wrapper">
                <form onSubmit={handleSubmit}>
                    <div className="usernameBox">
                        <p>
                            Please enter your username:
                        </p>
                        <input
                            className="inputs"
                            type="text"
                            placeholder="bob123"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />                                
                    </div>
                    <div className="emailBox">
                        <p>
                            Please enter your email:
                        </p>
                        <input
                            className="inputs"
                            type="text"
                            placeholder="bob@xyz.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />                    
                    </div>
                    <div className="passwordBox">
                        <p>
                            Please enter your password:
                        </p>
                        <input
                            className="inputs"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />                    
                    </div>
                    <div className="reenterPasswordBox">
                        <p>
                            Please reenter your password:
                        </p>
                        <input
                            className="inputs"
                            type="password"
                            value={reenterPass}
                            onChange={(e) => setReenterPass(e.target.value)}
                        />      
                    </div>       
                    <button style={{"marginTop": "30px"}}>
                        Create account
                    </button>   
                </form>    
            </div>
        </div>
    )
}
export default CreateAccount;