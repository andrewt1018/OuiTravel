import React, { useState, useEffect } from 'react';

const SettingsSidebar = ({ selectedSetting, setSelectedSetting }) => {

    console.log(selectedSetting);

    return (
        <div className="col-span-2 hidden sm:block ">
        <ul>
            <li className={`mt-3.5 cursor-pointer border-l-2   px-2 py-2 font-semibold  transition hover:border-l-blue-700 hover:text-blue-700 
                ${selectedSetting === 'Account' ? "border-l-blue-700 text-blue-700" : "" }
            `}
                onClick={() => setSelectedSetting('Account')}
            >Accounts</li>
            <li className={`mt-3.5 cursor-pointer border-l-2   px-2 py-2 font-semibold  transition hover:border-l-blue-700 hover:text-blue-700 
                ${selectedSetting === 'Notification' ? "border-l-blue-700 text-blue-700" : "" }
            `}
                onClick={() => setSelectedSetting('Notification')}
            >Notification</li>
            <li className={`mt-3.5 cursor-pointer border-l-2   px-2 py-2 font-semibold  transition hover:border-l-blue-700 hover:text-blue-700 
                ${selectedSetting === 'Preferences' ? "border-l-blue-700 text-blue-700" : "" }
            `}
                onClick={() => setSelectedSetting('Preferences')}
            >Preferences</li>
        </ul>
        </div>
    );
};

export default SettingsSidebar;
