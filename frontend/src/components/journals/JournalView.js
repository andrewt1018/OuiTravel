import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const JournalView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/journal/${id}`, {
          headers: { 'x-access-token': token }
        });
        setJournal(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching journal:', error);
        setLoading(false);
      }
    };

    fetchJournal();
  }, [id]);

  if (loading) return <div>Loading journal...</div>;
  if (!journal) return <div>Journal not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{journal.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>{new Date(journal.startDate).toLocaleDateString()}</span>
            <span>-</span>
            <span>{new Date(journal.endDate).toLocaleDateString()}</span>
            <span className="capitalize ml-4">({journal.privacy})</span>
          </div>
        </div>
        <Link
          to={`/journals/${id}/new-entry`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Entry
        </Link>
      </div>

      {journal.entries?.map((entry, index) => (
        <div key={entry._id} className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{entry.title}</h2>
          <p className="whitespace-pre-wrap mb-4">{entry.content}</p>
        </div>
      ))}
    </div>
  );
};

export default JournalView;
