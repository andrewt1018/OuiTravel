import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const EntryEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:3001/api/journal/${id}/entry`,
                formData,
                {
                    headers: { 'x-access-token': token }
                }
            );
            navigate(`/journals/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating entry');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Add New Entry</h2>
            <form onSubmit={handleSubmit}>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                
                <div className="mb-4">
                    <label className="block mb-2">Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Content</label>
                    <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(content) => setFormData({...formData, content})}
                        className="h-64 mb-12"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Save Entry
                </button>
            </form>
        </div>
    );
};

export default EntryEditor;
