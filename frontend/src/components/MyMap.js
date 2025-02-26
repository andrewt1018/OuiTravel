"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios"

import {getUser} from "./helpers/user-verification"
import NavigationLayout from '../components/helpers/NavigationLayout.js';
import SearchBar from './helpers/MyMapSearchBar.js'

import {
    useJsApiLoader,
  } from '@react-google-maps/api'
import {
    APIProvider,
    Map,
    useMap,
    AdvancedMarker,
    useMapsLibrary,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import LocationOverlay from './helpers/LocationOverlay';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY
const GOOGLE_PERSONAL_MAP_ID = process.env.REACT_APP_PERSONAL_MAP_ID

const defaultLocation = {lat: 40.4259, lng: 86.9081}

function MyMap() {
    const [locationSupported, setLocationSupported] = useState(true);
    const [currLocation, setCurrLocation] = useState(null);
    const [marker, setMarker] = useState(null);
    const [openInfo, setOpenInfo] = useState(false);
    const [openIconInfo, setOpenIconInfo] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState('');
    const [savedIcons, setSavedIcons] = useState([]);
    const [mapCenter, setMapCenter] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [placeName, setPlaceName] = useState('');
    const [placeId, setPlaceId] = useState('');
    const [showOverlay, setShowOverlay] = useState(false);
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
            maximumAge: Infinity
        }
        const loc = JSON.parse(localStorage.getItem("currLocation"));
        console.log('loc:', loc);
        if (loc) {
            setCurrLocation(loc);
        } else if (navigator.geolocation) { /** Get's the user's current location */
            navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationError, geoLocationOptions);
        } else {
            console.log("Geolocation not supported");
            setCurrLocation(defaultLocation);
            setLocationSupported(false);
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
        setCurrLocation(defaultLocation);
        setLocationSupported(false);
    }
    
    const onMapClick = (e) => {
      setOpenInfo(false);
      setShowOverlay(false);
      setOpenInfo(false);
      setOpenIconInfo(false);
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
    
    const removeIcon = async () => {
        /* Sanity checks */
        if (!selectedIcon || !openIconInfo) {
          console.error("Something wrong when removing icon!")
          return;
        }
        try {
          const token = localStorage.getItem("token");
          await axios.post('http://localhost:3001/api/user/remove-icon', { selectedIcon },
              {headers: { 'x-access-token': `${token}`}});
          console.log("Successfully removed icon!")
          
          setSavedIcons(savedIcons.filter(item => item._id !== selectedIcon))
          setOpenIconInfo(false);
          setSelectedIcon('');
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

    const handleIconClick = (id) => {
      const icon = savedIcons.find(icon => icon._id === id);
      console.log("found icon:", icon);
      setOpenIconInfo(true);
      setSelectedIcon(id);
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

    async function getOrCreateLocation(placeIdObj) {
        const { placeId, name, address, coordinates } = placeIdObj;
    
        const token = localStorage.getItem('token');
    
        try {
            const res = await axios.post('http://localhost:3001/api/location/post-location', 
                { placeId, name, address, coordinates }, 
                { headers: { 'x-access-token': `${token}` } }
            );
    
            console.log("Location response:", res.data);
            return res.data;
        } catch (error) {
            console.error("Error updating/creating location:", error);
            throw error;
        }
    }
      
    
    function SearchButton() {
      const map = useMap();

      const getPlaceDetails = async (placeId) => {
        console.log("placeid:", placeId);
        const response = await axios.get(`https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,location&key=${GOOGLE_MAPS_API_KEY}`)
        return response.data.displayName.text;
      }
  
      const handleSearchAddress = async () => {
          if (!map) {
            console.log("Map is null");
            return;
          }
          if (!inputRef.current.value) {
            alert("Please type a valid address!")
            return;
          }
          // Get geocode
          console.log("Searching for:", inputRef.current.value);
          const geocode = await getGeocode(inputRef.current.value);
          const location = geocode.geometry.location;

          // Get display name
          const fetchedPlaceId = geocode.place_id;
          const placeDetails = await getPlaceDetails(fetchedPlaceId);
          const placeName = placeDetails || geocode.formatted_address;
          const address = geocode.formatted_address;
          
            // Create location object if placeId doesn't already exist
            const locationData = await getOrCreateLocation({
                placeId: fetchedPlaceId,
                name: placeName,
                address,
                coordinates: { lat: location.lat, lng: location.lng },
            });

          // Pan to searched location and prepare marker
          map.panTo(location);
          setOpenInfo(false);
          setMarker({position:
              {
                  lat: location.lat,
                  lng: location.lng
              }
          });
          setShowOverlay(true);
          setSelectedLocation(address);
          setPlaceName(placeName);
          setPlaceId(fetchedPlaceId);
      }
      return (
        <div className="relative inline w-1/2 max-w-2xl">
          <button onClick={handleSearchAddress} class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ml-2 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            Search
          </button>
        </div>
      )
    }

    return (currLocation && isLoaded) ? (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>

        <NavigationLayout showHeader={true} headerSearchBar={<SearchBar ref={inputRef}/>} showButton={true} headerSearchButton={<SearchButton />}>
          <div style={{ height: "100vh", width: "100vw" }}>
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
                            onClick={() => handleIconClick(icon._id)}
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

                    {showOverlay && selectedLocation && placeName && (
                        <LocationOverlay 
                            placeId={placeId}
                            placeName={placeName} 
                            placeLocation={selectedLocation} 
                        />
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

                    {selectedIcon && (
                      <InfoWindow 
                          position={savedIcons.find(item => item._id === selectedIcon).position}
                          onCloseClick={() => {setOpenIconInfo(false); setSelectedIcon('')}}
                          options={{
                              pixelOffset: new window.google.maps.Size(0, -40),
                          }}
                      >
                              <div>
                                  <button
                                      type="submit"
                                      className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm`}
                                      onClick={() => removeIcon()}
                                  >
                                      Remove icon
                                  </button>
                              </div>
                      </InfoWindow>
                    )}
                </Map>
            </div>
            
            {/* Rest of the page's content after interactive map */}
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
        </NavigationLayout>
      </APIProvider>

    ) : (
        <NavigationLayout showHeader={true}>
          <div>Retrieving your location ...</div>
        </NavigationLayout>

    );
}

export default React.memo(MyMap)