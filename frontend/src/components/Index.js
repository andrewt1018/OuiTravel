import {React, useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Index = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate()
    useEffect(() => {
        async function getUser() {
            console.log("In useEffect");
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get('http://localhost:3001/api/user/get-user', {
                    headers: { 'x-access-token': `${token}` } });   
                setUsername(res.data.message);
            } catch (error) {
                alert("User not logged in!")
                navigate("/login");
            }
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