import React, { useEffect, useState, useLayoutEffect } from 'react'
import { GoogleMap, useJsApiLoader, AdvancedMarkerElement, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '100vh',
}

function MyMap() {
  const [currLocation, setCurrLocation] = useState({});
  const [map, setMap] = useState(/** @type: google.maps.Map */ (null));
  const [markers, setMarkers] = useState(/** @type: google.maps.Marker */ (null));
  const [openInfo, setOpenInfo] = useState(false);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  })

  useLayoutEffect(() => {
    /* Get's the user's current location */
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(function (position) {
        setCurrLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        console.log("Set lat:", position.coords.latitude)
        console.log("Set lng:", position.coords.longitude)
      })
    }
  }, []);

  const onMapClick = (e) => {
    setOpenInfo(false);
    setMarkers({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });

  }
  
  const onPinClick = () => {
    setOpenInfo(true);
  }
  const onInfoClose = () => {
    setOpenInfo(false);
    setMarkers(null);
  }

  const createNewIcon = () => {
    alert("Your mom")
  }

  if (!isLoaded) {
    return <p>Loading google maps...</p>
  }

  return (
    <div style={containerStyle}>
      {/* Google Maps box */}
      <GoogleMap 
        center={currLocation} 
        zoom={15} 
        mapContainerStyle={{'width': '100%', height: '100%'}}
        onLoad={(map) => setMap(map)}
        onClick={onMapClick}
      >
        {markers && 
          <AdvancedMarkerElement
            position={{
              lat: markers.lat,
              lng: markers.lng
            }}
            onClick={onPinClick}
          />
        }
        {openInfo &&
          <InfoWindow 
            position={{
              lat: markers.lat,
              lng: markers.lng
            }}
            onCloseClick={onInfoClose}
          >
            <div>
              <p>Lat: {markers.lat}</p>
              <p>Long: {markers.lng}</p>
              <button onClick={createNewIcon}>Add icon</button>
            </div>
          </InfoWindow>
        }
      </GoogleMap>  
    </div>
  )
}

export default React.memo(MyMap)