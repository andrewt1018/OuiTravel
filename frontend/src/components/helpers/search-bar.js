import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useRef, useEffect } from 'react';

function SearchBar(props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
    libraries: ['places'],
  });

const autocompleteRef = useRef(null);

useEffect(() => {
    if (isLoaded) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
            props.inputRef.current
        );
    }
  }, [isLoaded]);

  return isLoaded ? (
     <input ref={props.inputRef} type="text" placeholder="Search places..." />
  ) : <></>;
}

export default SearchBar;