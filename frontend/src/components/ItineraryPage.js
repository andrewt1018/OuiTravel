import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";

export default function ItineraryPage() {
  const [showModal, setShowModal] = useState(true);
  const [step, setStep] = useState(1);
  const [itineraryName, setItineraryName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [itineraryDays, setItineraryDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showFinalPage, setShowFinalPage] = useState(false);

  const wishlistedLocations = [
    { name: "Eiffel Tower" },
    { name: "Louvre Museum" },
    { name: "Notre Dame Cathedral" },
    { name: "Champs-Élysées" },
    { name: "Montmartre" },
  ];

  // Handle itinerary creation
  const createItinerary = () => {
    if (!itineraryName || !location || !startDate || !endDate) return;
    let days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      days.push({ date: new Date(currentDate), activities: [] });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setItineraryDays(days);
    setStep(2);
  };

  // Add activity to a selected day
  const assignLocationToDay = (location) => {
    const updatedDays = [...itineraryDays];
    if (!updatedDays[selectedDay].activities.includes(location)) {
      updatedDays[selectedDay].activities.push(location);
      setItineraryDays(updatedDays);
    }
  };

  // Remove activity from a specific day
  const removeActivityFromDay = (location) => {
    const updatedDays = [...itineraryDays];
    updatedDays[selectedDay].activities = updatedDays[selectedDay].activities.filter(
      (act) => act !== location
    );
    setItineraryDays(updatedDays);
  };

  // Finish itinerary and show the final page
  const finishItinerary = () => {
    setShowModal(false);
    setShowFinalPage(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        {/* Custom Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
              {/* Step 1: Itinerary Creation */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Create Itinerary</h2>
                  
                  <input
                    type="text"
                    placeholder="Itinerary Name"
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                    value={itineraryName}
                    onChange={(e) => setItineraryName(e.target.value)}
                  />
                  
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />

                  {/* Start & End Date (Side by Side) */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-600">Start Date:</label>
                      <DatePicker
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">End Date:</label>
                      <DatePicker
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <button
                    onClick={createItinerary}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Step 2: Assign Locations */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Assign Locations to Days</h2>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Select a Day */}
                    <div className="border-r p-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Day:</h3>
                      <div className="space-y-2">
                        {itineraryDays.map((day, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedDay(index)}
                            className={`block w-full p-2 rounded-lg text-gray-700 ${
                              selectedDay === index ? "bg-blue-200" : "bg-gray-200"
                            }`}
                          >
                            {day.date.toDateString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: Wishlisted Locations */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Add Locations to {itineraryDays[selectedDay]?.date.toDateString()}:
                      </h3>
                      <div className="space-y-2">
                        {wishlistedLocations.map((loc, index) => (
                          <div key={index} className="flex justify-between bg-gray-100 p-2 rounded-lg">
                            <span className="text-gray-700">{loc.name}</span>
                            <button
                              className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                              onClick={() => assignLocationToDay(loc.name)}
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Show Assigned Locations */}
                      <h3 className="text-lg font-semibold text-gray-700 mt-4">Assigned Activities:</h3>
                      <ul className="mt-2 space-y-2">
                        {itineraryDays[selectedDay]?.activities.map((activity, index) => (
                          <li key={index} className="flex justify-between bg-gray-200 p-2 rounded-lg">
                            <span className="text-gray-700">{activity}</span>
                            <button
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                              onClick={() => removeActivityFromDay(activity)}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between mt-4">
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      onClick={finishItinerary}
                    >
                      Finish Itinerary
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Itinerary View */}
        {showFinalPage && (
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-5xl min-h-[80vh] flex flex-col">
            <h1 className="text-4xl font-bold text-center mb-6">{itineraryName}</h1>
            <p className="text-center text-gray-600 mb-6 text-lg">Location: {location}</p>

            {/* Navigation for Days */}
            <div className="flex justify-center space-x-3 overflow-x-auto p-4">
              {itineraryDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`px-6 py-3 rounded-lg text-lg ${
                    selectedDay === index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                  } hover:bg-blue-400 transition`}
                >
                  {day.date.toDateString()}
                </button>
              ))}
            </div>

            {/* Activities for Selected Day */}
            <div className="mt-6 flex-grow">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                Activities for {itineraryDays[selectedDay].date.toDateString()}
              </h2>
              <ul className="list-none mx-auto max-w-3xl">
                {itineraryDays[selectedDay].activities.length === 0 ? (
                  <p className="text-gray-500 text-lg text-center">No activities assigned.</p>
                ) : (
                  itineraryDays[selectedDay].activities.map((activity, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-3">
                      <span className="text-gray-700 text-lg">{activity}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}
