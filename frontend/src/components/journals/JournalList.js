import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JournalList = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/journal/list', {
          headers: { 'x-access-token': token }
        });
        setJournals(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching journals:', error);
        setLoading(false);
      }
    };

    fetchJournals();
  }, []);

  if (loading) return <div>Loading journals...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Travel Journals</h1>
        <Link
          to="/journals/create"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Journal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {journals.map((journal) => (
          <Link
            key={journal._id}
            to={`/journals/${journal._id}`}
            className="block p-4 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold mb-2">{journal.title}</h2>
                <p className="text-gray-600">
                  {new Date(journal.startDate).toLocaleDateString()} - 
                  {new Date(journal.endDate).toLocaleDateString()}
                </p>
                <p className="text-gray-500 mt-2">
                  {journal.entries?.length || 0} entries
                </p>
              </div>
              <span className="text-sm text-gray-500 capitalize">
                {journal.privacy}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {journals.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No journals yet. Start by creating one!
        </div>
      )}
    </div>
  );
};

export default JournalList;
