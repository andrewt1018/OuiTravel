import { useState, useEffect } from 'react';
import { Checkbox, FormControlLabel, Grid, Input, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getUser } from './helpers/user-verification';
import axios from 'axios';

import MuseumIcon from '@mui/icons-material/Museum';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HikingIcon from '@mui/icons-material/Hiking';
import CampingIcon from '@mui/icons-material/Cabin';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import NaturePeopleIcon from '@mui/icons-material/NaturePeople';
import CultureIcon from '@mui/icons-material/Diversity1';
import RelaxationIcon from '@mui/icons-material/SelfImprovement';
import SightseeingIcon from '@mui/icons-material/Landscape';
import SoloTravelIcon from '@mui/icons-material/Hail';
import LuxuryIcon from '@mui/icons-material/Villa';

const activityOptions = ['Museum Visits', 'Food Tasting', 'Shopping', 'Hiking', 'Camping', 'Beach Activities'];
const cuisineOptions = ['Italian', 'Vietnamese', 'Japanese', 'Mexican', 'French', 'Korean', 'Thai', 'Indian', 'Chinese', 'Greek', 'Spanish', 'American'];
const typeOptions = ['Adventure', 'Culture', 'Relaxation', 'Sightseeing', 'Solo Travel', 'Luxury Travel'];

function EditPreference({ userId }) {
    const [preferences, setPreferences] = useState({
        activities: [],
        activitiesOther: '',
        cuisines: [],
        travelTypes: [],  
        destinations: [],
    });
    const navigate = useNavigate();

    const verifyUser = async () => {
        const user = await getUser();
        if (!user) {
            alert("User not logged in!");
            navigate('/login');
            return;
        }
        console.log(user);
        const token = localStorage.getItem("token");
        const res = await axios.get('http://localhost:3001/api/user/getPreferences', {
            headers: {'x-access-token' : `${token}`}
        });
        console.log(res.data);
        setPreferences(res.data.preferences || {
            activities: [],
            activitiesOther: '',
            cuisines: [],
            travelTypes: [],
            destinations: []
        });

    };

    useEffect(() => {
        verifyUser();
    }, []);

    const handleCheckboxChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`http://localhost:3001/api/user/preferences`, {
                preferences
            }, {
                headers: { 'x-access-token': token },
            });

            if (response.status === 200) {
                alert("Preferences updated successfully!");
            }

        } catch (error) {
            console.log(error);
            alert("Error updating preferences");
        }
    };

    const handleDestinationsChange = (e) => {
        const value = e.target.value;
        setPreferences(prev => ({
            ...prev,
            destinations: value ? value.split(',').map(item => item.trim()) : []
        }));
    };

    return (
        <div>
            <div className="pt-4">
                <h1 className="py-2 text-2xl font-semibold">Edit Preferences</h1>
            </div>
            <hr className="mt-4 mb-8" />
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Favorite Activities */}
                <label className="block">
                    <span className="font-semibold">Favorite Activities:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                        {activityOptions.map((activity, index) => (
                            <FormControlLabel
                                key={activity}
                                control={
                                    <Checkbox
                                        checked={preferences.activities.includes(activity)}
                                        onChange={() => handleCheckboxChange('activities', activity)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {index === 0 && <MuseumIcon style={{ marginRight: 8 }} />}
                                        {index === 1 && <RestaurantIcon style={{ marginRight: 8 }} />}
                                        {index === 2 && <ShoppingCartIcon style={{ marginRight: 8 }} />}
                                        {index === 3 && <HikingIcon style={{ marginRight: 8 }} />}
                                        {index === 4 && <CampingIcon style={{ marginRight: 8 }} />}
                                        {index === 5 && <BeachAccessIcon style={{ marginRight: 8 }} />}
                                        <span>{activity}</span>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                    <Input
                        type="text"
                        placeholder="Other activity..."
                        value={preferences.activitiesOther}
                        onChange={(e) => setPreferences({ ...preferences, activitiesOther: e.target.value })}
                        fullWidth
                        className="mt-2"
                    />
                </label>

                {/* Favorite Cuisines */}
                <label className="block">
                    <span className="font-semibold">Favorite Cuisines:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                        {cuisineOptions.map(cuisine => (
                            <FormControlLabel
                                key={cuisine}
                                control={
                                    <Checkbox
                                        checked={preferences.cuisines.includes(cuisine)}
                                        onChange={() => handleCheckboxChange('cuisines', cuisine)}
                                        color="primary"
                                    />
                                }
                                label={<span>{cuisine}</span>}
                            />
                        ))}
                    </div>
                </label>

                {/* Travel Type */}
                <label className="block">
                    <span className="font-semibold">Travel Type:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                        {typeOptions.map((option, index) => (
                            <FormControlLabel
                                key={option}
                                control={
                                    <Checkbox
                                        checked={preferences.travelTypes.includes(option)}
                                        onChange={() => handleCheckboxChange('travelTypes', option)}
                                        color="primary"
                                    />
                                }
                                label={
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {index === 0 && <NaturePeopleIcon style={{ marginRight: 8 }} />}
                                        {index === 1 && <CultureIcon style={{ marginRight: 8 }} />}
                                        {index === 2 && <RelaxationIcon style={{ marginRight: 8 }} />}
                                        {index === 3 && <SightseeingIcon style={{ marginRight: 8 }} />}
                                        {index === 4 && <SoloTravelIcon style={{ marginRight: 8 }} />}
                                        {index === 5 && <LuxuryIcon style={{ marginRight: 8 }} />}
                                        <span>{option}</span>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </label>

                {/* Favorite Destinations */}
                <label className="block">
                    <span className="font-semibold">Favorite Destinations:</span>
                    <Input
                        type="text"
                        placeholder="Enter destinations separated by commas..."
                        value={preferences.destinations.join(', ')}
                        onChange={handleDestinationsChange}
                        fullWidth
                        className="mt-2"
                    />
                </label>

                <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    className="mt-4"
                >
                    Save Preferences
                </Button>
            </form>
        </div>
    );
}

export default EditPreference;
