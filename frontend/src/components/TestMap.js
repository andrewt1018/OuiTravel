"use client";

import React, { useState, useLayoutEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";

function MyMap() {
    const [currLocation, setCurrLocation] = useState(null);
    const [marker, setMarker] = useState(null)
    const [openInfo, setOpenInfo] = useState(false)

    useLayoutEffect(() => {
        /* Get's the user's current location */
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function (position) {
                setCurrLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
                // console.log("Set lat:", position.coords.latitude)
                // console.log("Set lng:", position.coords.longitude)
            })
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

    console.log("CurrLoc:", currLocation)
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
                    {marker && (
                        <AdvancedMarker
                            key="marker"
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
                                    <button
                                        type="submit"
                                        className={`w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm`}
                                    >
                                        Add icon
                                    </button>
                                </div>

                        </InfoWindow>
                    )}
                </Map>
            </div>
            </APIProvider>
        </div>
    ) : (
        <div>Retrieving your location ...</div>
    );
}

export default React.memo(MyMap)
