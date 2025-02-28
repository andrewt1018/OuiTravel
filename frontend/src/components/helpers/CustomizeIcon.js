import React, { useState, useEffect } from "react";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import { 
  Home, Star, Favorite, Flight, Lightbulb, Mood, AssistantPhoto, Attractions, BakeryDining,
  BeachAccess, Business, Cake, Dining, DinnerDining, LocalDining, DirectionsBus, DirectionsCar,
  DirectionsWalk, EvStation, LocalBar, LocalGroceryStore, LocalHospital, LocalMall, LocalMovies
} from "@mui/icons-material";

const iconsMapping = {
  Home: Home,
  Star: Star,
  Favorite: Favorite,
  Flight: Flight,
  Lightbulb: Lightbulb,
  Mood: Mood,
  AssistantPhoto: AssistantPhoto,
  Attractions: Attractions,
  BakeryDining: BakeryDining,
  BeachAccess: BeachAccess,
  Business: Business,
  Cake: Cake,
  Dining: Dining,
  DinnerDining: DinnerDining,
  LocalDining: LocalDining,
  DirectionsBus: DirectionsBus,
  DirectionsCar: DirectionsCar,
  DirectionsWalk: DirectionsWalk,
  EvStation: EvStation,
  LocalBar: LocalBar,
  LocalGroceryStore: LocalGroceryStore,
  LocalHospital: LocalHospital,
  LocalMall: LocalMall,
  LocalMovies: LocalMovies,
};

const colorMappingTxt = {
  red: "text-red-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  blue: "text-blue-400",
  indigo: "text-indigo-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  rose: "text-rose-400",
  amber: "text-amber-400",
  lime: "text-lime-400",
  teal: "text-teal-400",
  cyan: "text-cyan-400",
  gray: "text-gray-500",
};

const colorMapping = {
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-400",
  blue: "bg-blue-400",
  indigo: "bg-indigo-400",
  purple: "bg-purple-400",
  pink: "bg-pink-400",
  rose: "bg-rose-400",
  amber: "bg-amber-400",
  lime: "bg-lime-400",
  teal: "bg-teal-400",
  cyan: "bg-cyan-400",
  gray: "bg-gray-500",
};

const colors = Object.keys(colorMapping);

export default function CustomizeIcon( {onChange} ) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("Home");
  const SelectedIconComponent = iconsMapping[selectedIcon]; // Actual icon component
  const [selectedColor, setSelectedColor] = useState("green");

  /* Update the icon settings in the database */
  const updateIconSettings = async (newIcon, newColor) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3001/api/user/update-category-icon",
        {
          category: "Other",
          char: newIcon,
          color: newColor,
        },
        { headers: { "x-access-token": token } }
      );

      console.log("Icon settings updated successfully:", res.data);
    } catch (error) {
      console.error("Error updating icon settings:", error);
      alert("Failed to update icon settings. Please try again.");
    }
  };

  /* Fetch existing category icon settings */
  useEffect(() => {
    const fetchCategoryIcon = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/api/user/get-category-icon",
          { headers: { "x-access-token": token } }
        );
  
        const { char, color } = res.data;
  
        if (char && iconsMapping[char]) {
          setSelectedIcon(char);
        }
        if (color) {
          setSelectedColor(color);
        }
      } catch (error) {
        console.error("Error fetching category icon settings:", error);
      }
    };
  
    fetchCategoryIcon();
  }, []);

  const handleIconChange = (iconName) => {
    if (selectedIcon !== iconName) {
      setSelectedIcon(iconName);
      updateIconSettings(iconName, selectedColor);
      onChange(iconName, selectedColor);
    }
  };

  const handleColorChange = (color) => {
    if (selectedColor !== color) {
      setSelectedColor(color);
      updateIconSettings(selectedIcon, color);
      onChange(selectedIcon, color);
    }
  };

  return (
    <div className="relative">
      <div
        className="absolute top-6 right-4 z-20 bg-gray-200 p-3 rounded-full shadow-md border-2 border-gray-400 hover:bg-gray-300 cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <EditIcon fontSize="large" />
      </div>

      {/* Modal for Customization */}
      {modalOpen && (
        <div className="absolute top-6 right-4 z-20 w-[22%] bg-white border-2 border-gray-300 rounded-2xl shadow-lg p-4">
          <div className="text-lg font-semibold text-center mb-4">
            Customize Icon
            <button
              className="absolute top-2 right-2 text-sm text-gray-600 hover:text-black"
              onClick={() => setModalOpen(false)}
            >
              ✖
            </button>
          </div>

          {/* Preview Selections */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-400">
              {SelectedIconComponent && <SelectedIconComponent className={`text-3xl ${colorMappingTxt[selectedColor]}`} />}
            </div>
          </div>

          {/* Color Picker */}
          <h3 className="text-sm font-medium mb-2 text-center">Choose a Color:</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {colors.map((color) => (
              <div
                key={color}
                className={`w-8 h-8 rounded-full ${colorMapping[color]} border-2 ${
                  selectedColor === color ? "border-black" : "border-transparent"
                } hover:border-black cursor-pointer`}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>

          {/* Icon Picker */}
          <h3 className="text-sm font-medium mb-2 text-center">Choose an Icon:</h3>
          <div className="grid grid-cols-6 gap-2 justify-center">
            {Object.keys(iconsMapping).map((iconName) => (
              <div
                key={iconName}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 ${
                  selectedIcon === iconName ? "border-black" : "border-transparent"
                } hover:border-black cursor-pointer`}
                onClick={() => {handleIconChange(iconName)}}
              >
                {React.createElement(iconsMapping[iconName], { className: "text-gray-600 hover:text-black text-2xl" })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
