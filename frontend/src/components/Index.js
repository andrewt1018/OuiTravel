import {React, useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Index = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate()
    useEffect(() => {
        async function getUser() {
            console.log("In async function");
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/api/user/get-user', {
                headers: { 'x-access-token': `${token}` }
              });
            if (!res) {
                alert("User not logged in!");
                navigate("/login");
            }
            console.log(res);
            setUsername(res.data.message);
        }
        getUser()
      });

    return (
        <div>
            <p>Hello {username}!</p>
        </div>
    );
};

export default Index;