import React, { useState } from "react";
import axios from "axios"
import EditIcon from "@mui/icons-material/Edit";
import { 
  Home, Star, Favorite, Flight,  Lightbulb, Mood, AssistantPhoto, Attractions, BakeryDining,
  BeachAccess, Business, Cake, Dining, DinnerDining, LocalDining, DirectionsBus, DirectionsCar,
  DirectionsWalk, EvStation, LocalBar, LocalGroceryStore, LocalHospital, LocalMall, LocalMovies
} from "@mui/icons-material";

const iconsList = [
  Home, Star, Favorite, Flight,  Lightbulb, Mood, AssistantPhoto, Attractions, BakeryDining,
  BeachAccess, Business, Cake, Dining, DinnerDining, LocalDining, DirectionsBus, DirectionsCar,
  DirectionsWalk, EvStation, LocalBar, LocalGroceryStore, LocalHospital, LocalMall, LocalMovies
];

const colorMappingTxt = {
  "red": "text-red-400",
  "orange": "text-orange-400",
  "yellow": "text-yellow-400",
  "green": "text-green-400",
  "blue": "text-blue-400",
  "indigo": "text-indigo-400",
  "purple": "text-purple-400",
  "pink": "text-pink-400",
  "rose": "text-rose-400",
  "amber": "text-amber-400",
  "lime": "text-lime-400",
  "teal": "text-teal-400",
  "cyan": "text-cyan-400",
  "gray": "text-gray-500",
};

const colorMapping = {
  "red": "bg-red-400",
  "orange": "bg-orange-400",
  "yellow": "bg-yellow-400",
  "green": "bg-green-400",
  "blue": "bg-blue-400",
  "indigo": "bg-indigo-400",
  "purple": "bg-purple-400",
  "pink": "bg-pink-400",
  "rose": "bg-rose-400",
  "amber": "bg-amber-400",
  "lime": "bg-lime-400",
  "teal": "bg-teal-400",
  "cyan": "bg-cyan-400",
  "gray": "bg-gray-500",
};


const colors = Object.keys(colorMapping);

export default function CustomizeIcon() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(Home);
  const [selectedColor, setSelectedColor] = useState("green");

  /* Function to update the icon settings in the database */
  const updateIconSettings = async (newChar, newColor) => {
      try {
          const token = localStorage.getItem("token");
          await axios.post("http://localhost:3001/api/user/update-category-icon", 
              {
                  category: "Other",
                  char: newChar,
                  color: newColor
              },
              { headers: { 'x-access-token': token } }
          );
          console.log("Icon settings updated successfully!");
      } catch (error) {
          console.error("Error updating icon settings:", error);
      }
  };

  const handleIconChange = (IconComponent) => {
      setSelectedIcon(IconComponent);
      updateIconSettings(IconComponent.name, selectedColor);
  };

  const handleColorChange = (color) => {
      setSelectedColor(color);
      updateIconSettings(selectedIcon.name, color);
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
              {React.createElement(selectedIcon, { className: `text-3xl ${colorMappingTxt[selectedColor]}` })}
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
            {iconsList.map((IconComponent, index) => (
              <div
                key={index}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 ${selectedIcon === IconComponent ? "border-black" : "border-transparent"} hover:border-black cursor-pointer`}
                onClick={() => handleIconChange(IconComponent)}
              >
                <IconComponent className="text-gray-600 hover:text-black text-2xl" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
