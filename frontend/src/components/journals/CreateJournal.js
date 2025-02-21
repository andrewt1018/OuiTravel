import React, { useState } from 'react';
import axios from 'axios';

const CreateJournal = () => {
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        privacy: 'private'
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/journal/create',
                formData,
                { headers: { 'x-access-token': token } }
            );
            // Handle success (e.g., redirect to the new journal)
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating journal');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <div className="mb-4">
                <label className="block mb-2">Title</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                    minLength={3}
                    maxLength={100}
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Start Date</label>
                <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">End Date</label>
                <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Privacy</label>
                <select
                    value={formData.privacy}
                    onChange={(e) => setFormData({...formData, privacy: e.target.value})}
                    className="w-full p-2 border rounded"
                >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                </select>
            </div>
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Create Journal
            </button>
        </form>
    );
};

export default CreateJournal;
