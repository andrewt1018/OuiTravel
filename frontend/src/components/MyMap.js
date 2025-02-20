import { useEffect, useState, useRef } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const PlaceSearch = () => {
  const [placeDetails, setPlaceDetails] = useState(null);
  const mapRef = useRef(null);

  const searchPlace = (placeName) => {
    if (!mapRef.current) {
      console.log("Null map ref")
      return;
    }
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      query: placeName,
      fields: ["name", "formatted_address", "geometry", "place_id"],
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        setPlaceDetails(results[0]);
      }
    });
  };

  useEffect(() => {
    searchPlace("Eiffel Tower");
  }, []);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <Map
        ref={mapRef}
        mapId={process.env.REACT_APP_PERSONAL_MAP_ID}
        style={{ width: "100vw", height: "100vh" }}
        defaultCenter={{ lat: 40.7128, lng: -74.006 }}
        defaultZoom={10}
      />
      {placeDetails && (
        <div style={{ position: "absolute", top: 10, left: 10, background: "white", padding: "10px" }}>
          <h3>{placeDetails.name}</h3>
          <p>{placeDetails.formatted_address}</p>
        </div>
      )}
    </APIProvider>
  );
};

export default PlaceSearch;
