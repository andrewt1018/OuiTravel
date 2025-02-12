import React, { useState } from "react";
import axios from 'axios';
import "./styles/general.css"

function CreateAccount() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reenterPass, setReenterPass] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Add your login logic here
        console.log("Username:", username);
        console.log("Password:", password);
        if (password !== reenterPass) {
            alert('Passwords do not match!');
            return;
        }
        var res;
        try {
            res = await axios.post('http://localhost:3001/api/auth/register', {
                username,
                email,
                password,
            });
            alert('Account created successfully');
            window.location.href = '/login'; 
        } catch (error) {
            console.error(error.message);
            if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
            } else {
                alert("An error has occured ...");
            }
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