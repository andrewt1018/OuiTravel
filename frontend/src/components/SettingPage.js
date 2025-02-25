import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from './helpers/user-verification';
import SettingsSidebar from './SettingSidebar';
import "../index.css";
import EditProfile from './EditProfile';
import NotificationSetting from './NotificationSetting';
import EditPreference from './EditPreference';

function SettingPage() {

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedSetting, setSelectedSetting] = useState('Account');
    const navigate = useNavigate();

    const verifyUser = async () => {
        try {
            const user = await getUser();
            if (!user) {
                alert("User not logged in!");
                navigate('/login');
                return;
            } 
            setCurrentUser(user);

        } catch (error) {
            console.error("Error fetching user: ", error);
            alert("An error occured while fetching user data.");
            navigate('/login');
        }
    };

    useEffect(() => {
        verifyUser();
    }, []);

    if (currentUser === null) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='w-16 h-16 bg-purple-300 rounded-full animate-pulse'></div>
            </div>
        );
    }

    // Display setting options
    return (
        <div className='bg-[#f7fbfc] min-h-screen max-w-screen-xl'>
            <h1 className='border-b py-6 text-4xl font-semibold'>Settings</h1>
            <div className="grid grid-cols-8 pt-3 sm:grid-cols-10">
                <div className="col-span-2 hidden sm:block ">

                    <SettingsSidebar
                    selectedSetting={selectedSetting}
                    setSelectedSetting={setSelectedSetting}
                    />
                </div>
                <div className="col-span-8 overflow-hidden rounded-xl sm:bg-gray-50 sm:px-8 sm:shadow">
                    {selectedSetting === 'Account' ? (<EditProfile/>) : 
                    (selectedSetting === 'Notification' ? (<NotificationSetting/>) : (<EditPreference/>)) }
                </div>
            </div>
        </div>
    )
}


export default SettingPage;