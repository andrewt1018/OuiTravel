"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios"
import {getUser} from "./helpers/user-verification"
import { useNavigate } from 'react-router-dom';
import {
    useJsApiLoader,
    Autocomplete,
    useGoogleMap
  } from '@react-google-maps/api'
import {
    APIProvider,
    Map,
    useMap,
    AdvancedMarker,
    useMapsLibrary,
    InfoWindow,
} from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const GOOGLE_PERSONAL_MAP_ID = process.env.REACT_APP_PERSONAL_MAP_ID

function MyMap() {
    const [currLocation, setCurrLocation] = useState(null);
    const [marker, setMarker] = useState(null);
    const [openInfo, setOpenInfo] = useState(false);
    const [savedIcons, setSavedIcons] = useState([]);
    const [mapCenter, setMapCenter] = useState(null);
    const navigate = useNavigate();

    const inputRef = useRef(null);
    const placesLibrary = useMapsLibrary("places");
    
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        libraries: ['places'],
    });

    useEffect(() => {
         /** Verify user first */
         const verifyUser = async () => {
            const user = await getUser();
            if (!user) {
                alert("User not logged in!")
                navigate("/login")
                return;
            }
            setSavedIcons(user.savedIcons);
        }
        verifyUser();
        const geoLocationOptions = {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: Infinity
        }
        /** Get's the user's current location */
        if (navigator.geolocation) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError, geoLocationOptions);
                console.log("Got current locations")
            } else {
                console.log("Geolocation not supported");
            }
        }
    }, []);

    function getLocationSuccess(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log("got lat:", latitude);
        console.log("got long:", longitude);
        setCurrLocation({
            lat: latitude,
            lng: longitude
        })
      };
      
    function getLocationError() {
        console.log("Unable to retrieve your location");
    }
    
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

    const handleCameraChange = useCallback((e) => {
        setMapCenter(e.detail.center);
    });

    const getGeocode = async (address) => {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
      
        try {
          const response = await fetch(url);
          const data = await response.json();
      
          if (data.status === "OK") {
            return data.results[0]; // Returns geocoded address details
          } else {
            console.error("Geocode API error:", data.status);
          }
        } catch (error) {
          console.error("Request failed:", error);
        }
    };
    
    const SearchButton = () => {
        const map = useMap();
        const handleSearchAddress = async () => {
            if (!inputRef.current.value) {
                alert("Please type a valid address!")
                return;
            }
            console.log("Inputref:", inputRef.current.value);
            const geocode = await getGeocode(inputRef.current.value);
            const location = geocode.geometry.location;
            console.log("location", location);

            // Pan to searched location and prepare marker
            map.panTo(location);
            setOpenInfo(false);
            setMarker({position:
                {
                    lat: location.lat,
                    lng: location.lng
                }
            });

        }
        return <button onClick={handleSearchAddress}>Search</button>
    }

    return (currLocation && isLoaded) ? (
        <div style={{ height: "100vh", width: "100vw" }}>
            <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <div style={{ height: "75%", width: "75%" }}>
                <Map 
                    defaultZoom={16} 
                    defaultCenter={currLocation} 
                    mapId={GOOGLE_PERSONAL_MAP_ID}
                    onClick={onMapClick}
                    fullscreenControl={false}
                    onCameraChanged={handleCameraChange}
                    reuseMaps={true}
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
                                        Save icon!
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Autocomplete>
                    <input type="text" placeholder="Search..." ref={inputRef} />
                </Autocomplete>
                <SearchButton />
            </div>
            </APIProvider>
            



            <div>
                <p>Number of icons: {savedIcons.length}</p>
            </div>
            {mapCenter ? 
            <div>
                <p>Map center: ({mapCenter.lat.toFixed(5)}, {mapCenter.lng.toFixed(5)})</p>
            </div> 
            :
            <div>
                <p>Map center has not been set.</p>
            </div>
            }
        </div>
    ) : (
        <div>Retrieving your location ...</div>
    );
}

export default React.memo(MyMap)