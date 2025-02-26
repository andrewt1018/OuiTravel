import {
  Autocomplete
} from '@react-google-maps/api'

function SearchBar(props) {
  return (
    <div className="relative inline w-1/2 max-w-2xl">
      <Autocomplete>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-slate-500"
              placeholder="Search..."
              ref={props.ref}
            />
      </Autocomplete>
    </div>
    )
}

export default SearchBar;