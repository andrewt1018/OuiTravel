import {React, useEffect, useState} from "react";
import { Link, useNavigate } from 'react-router-dom';


const Index = () => {
    const [user, setUser] = useState('');
    const navigate = useNavigate()
    useEffect(() => {
        if (!user) {
            alert("User not logged in!")
            navigate("/login");
        }
      }, [user]);

    return (
        <div>
            <p>Hello !</p>
        </div>
    );
};

export default Index;