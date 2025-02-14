import {React, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import {getUser} from './helpers/user-verification'

const Index = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate()

    useEffect( () => {
        const verifyUser = async () => {
            const resp = await getUser();
            if (resp) {
                setUsername(resp.username);
            } else {
                alert("User not logged in!")
                navigate("/login")
            }
        }
        verifyUser()
      }, []);

    return username ? (
        <div>
            <p>Hello {username}!</p>
            <Link 
                to={`/profile`} 
                className="text-blue-600 hover:underline"
            >
            Go to your profile
            </Link>
        </div>
    ) : (
        <></>
    );
};

export default Index;