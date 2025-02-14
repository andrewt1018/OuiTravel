"use client";

import React, { useState, useLayoutEffect, useEffect } from "react";
import axios from "axios"
import {getUser} from "./helpers/user-verification"
import { useNavigate } from 'react-router-dom';
import SearchBar from './helpers/search-bar'
import {
    APIProvider,
    Map,
    AdvancedMarker,
    useMapsLibrary,
    InfoWindow,
} from "@vis.gl/react-google-maps";

function MyMap() {
    const [currLocation, setCurrLocation] = useState(null);
    const [marker, setMarker] = useState(null);
    const [openInfo, setOpenInfo] = useState(false);
    const [savedIcons, setSavedIcons] = useState([]);
    const navigate = useNavigate();

    function getLocationSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCurrLocation({
            lat: latitude,
            lng: longitude
        })
      }
      
    function getLocationError() {
        console.log("Unable to retrieve your location");
    }

    useEffect(() => {
        console.log("Saved icons:", savedIcons)
    }, [savedIcons])

    useEffect(() => {
         /** Verify user first */
         const verifyUser = async () => {
            const user = await getUser();
            if (!user) {
                alert("User not logged in!")
                navigate("/login")
                return;
            }
            console.log("user: ", user);
            setSavedIcons(user.savedIcons);
        }
        verifyUser();

        /** Get's the user's current location */
        if (navigator.geolocation) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError);
            } else {
                console.log("Geolocation not supported");
            }
        }
    }, []);
    
    const onMapClick = (e) => {
        if (openInfo) {
            setOpenInfo(false);
            return;
        }
        if (marker) {
            setMarker(null);
            return;
        }
        setMarker({
            position: {
                lat: e.detail.latLng.lat,
                lng: e.detail.latLng.lng
            }
        })
    }

    const addIcon = async () => {
        /* Sanity checks */
        if (!marker || !openInfo) {
            console.error("Something wrong when adding icon!")
            return;
        }
        try {
            const token = localStorage.getItem("token");
            const ret = await axios.post('http://localhost:3001/api/user/save-icon', { marker },
                {headers: { 'x-access-token': `${token}`}});
            console.log("Successfully saved icon!")
            console.log(ret)
            setSavedIcons(savedIcons => [...savedIcons, ret.data.newIcon])
            setOpenInfo(false);
            setMarker(null);
        } catch (error) {
            if (error.response.status === 403) {
                alert("User is not logged in!")
                navigate("/login");
                return;
            }
            if (error.response.data.message) {
                alert(error.response.data.message);
            } else {
                console.log("Error: " + error);
            }
        }
    }

    function SavedMarkers(props) {
        return (
            props.savedIcons.map((icon) => (
                <AdvancedMarker
                    key={icon._id}
                    position={icon.position}
                >
                    <span style={{fontSize:"2rem"}}>{icon.char}</span>
                </AdvancedMarker>
            ))
        )
    }

    return currLocation ? (
        <div style={{ height: "100vh", width: "100vw" }}>
            <APIProvider apiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
            <div style={{ height: "75%", width: "75%" }}>
                <Map 
                    defaultZoom={16} 
                    defaultCenter={currLocation} 
                    mapId={process.env.REACT_APP_PERSONAL_MAP_ID}
                    onClick={onMapClick}
                    fullscreenControl={false}
                    >
                    {/* <SavedMarkers 
                        savedIcons={savedIcons} /> */}
                    {savedIcons && savedIcons.map(icon => (
                        <AdvancedMarker
                            key={icon._id}
                            position={icon.position}
                        >
                            <span style={{fontSize:"2rem"}}>{icon.char}</span>
                        </AdvancedMarker>
                    ))}

                    {marker && (
                        <AdvancedMarker
                            position={marker.position}
                            onClick={() => setOpenInfo(true)}>
                        </AdvancedMarker>
                    )}
                    
                    {openInfo && (
                        <InfoWindow 
                            position={marker.position}
                            onCloseClick={() => setOpenInfo(false)}
                            options={{
                                pixelOffset: new window.google.maps.Size(0, -40),
                            }}
                        >
                                <div>
                                    <p>
                                        ASDLKFJAS;LDKFJA;SLDKFJAS;LDKFJA;SLDKJFA;SLJFAS;KLDJFSAD;FSL
                                    </p>
                                    <br />
                                    <br /><br /><br />
                                    <button
                                        type="submit"
                                        className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm`}
                                        onClick={() => addIcon()}
                                    >
                                        Save icon
                                    </button>
                                </div>
                        </InfoWindow>
                    )}
                </Map>
            </div>
            </APIProvider>
            <div>
                <SearchBar />
            </div>
            <div>
                <p>Number of icons: {savedIcons.length}</p>
            </div>
        </div>
    ) : (
        <div>Retrieving your location ...</div>
    );
}

export default React.memo(MyMap)
