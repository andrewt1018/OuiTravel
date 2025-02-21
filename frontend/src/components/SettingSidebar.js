import React from 'react';

const SettingsSidebar = () => {
  return (
    <div className="col-span-2 hidden sm:block ">
      <ul>
        <li className="mt-3.5 cursor-pointer border-l-2 border-l-blue-700 px-2 py-2 font-semibold text-blue-700 transition hover:border-l-blue-700 hover:text-blue-700">Accounts</li>
        <li className="mt-3.5 cursor-pointer border-l-2 border-transparent px-2 py-2 font-semibold transition hover:border-l-blue-700 hover:text-blue-700">Notifications</li>
        <li className="mt-3.5 cursor-pointer border-l-2 border-transparent px-2 py-2 font-semibold transition hover:border-l-blue-700 hover:text-blue-700">Preferences</li>
      </ul>
    </div>
  );
};

export default SettingsSidebar;
