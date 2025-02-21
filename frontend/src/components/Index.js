import {React, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import {getUser} from './helpers/user-verification';
import Header from './helpers/Header';
import IndexSearchBar from './helpers/IndexSearchBar';

const Index = () => {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-greyish">
            <Header>
                <IndexSearchBar />
            </Header>
            <div className="pt-header">
                {/* Main Content */}
            </div>
        </div>
    ) : (
        <></>
    );
};

export default Index;