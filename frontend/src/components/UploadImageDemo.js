import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import {getUser} from "./helpers/user-verification"
import axios from 'axios';
import './styles/UploadImageDemo.css';

function UploadImageDemo() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [userData, setUserData] = useState({});
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const navigate = useNavigate();

    useEffect(() => {
      /** Verify user and fetch profile pic */
      const verifyUser = async () => {
        const user = await getUser();
        if (!user) {
            alert("User not logged in!")
            navigate("/login")
            return;
        }
        setUserData(user);
        if (user.profilePic) {
          fetchProfilePic(user.profilePic);
        }
      }
      verifyUser();
    }, []);

  // Fetch existing images when component mounts
  useEffect(() => {
    fetchImages();
  }, []);

  // Create preview when a file is selected
  useEffect(() => {
    if (!selectedFile) {
      setPreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    
    // Free memory when this effect runs again
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view images');
        return;
      }

      const response = await axios.get('http://localhost:3001/api/upload/get-image', {
        headers: {
          'x-access-token': token
        }
      });
      setImages(response.data);
    } catch (err) {
      setError('Failed to fetch images: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchProfilePic = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/upload/get-image`, {
        headers: {
          'x-access-token': token
        }
      });
      const profilePic = response.data.find(img => img.id === imageId);
      if (profilePic) {
        setProfilePicUrl(profilePic.imageUrl);
      }
    } catch (err) {
      setError('Failed to fetch profile picture');
    }
  };

  const handleSetProfilePic = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3001/api/user/profile-pic`, 
        { imageId },
        {
          headers: {
            'x-access-token': token
          }
        }
      );
      setProfilePicUrl(images.find(img => img.id === imageId)?.imageUrl);
      setUploadStatus('Profile picture updated successfully!');
    } catch (err) {
      setError('Failed to set profile picture: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Reset states
    setError('');
    setUploadStatus('');

    // Validate file type
    if (file && !file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }

    try {
      setUploadStatus('Uploading...');
      setError('');

      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('name', selectedFile.name);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to upload images');
        setUploadStatus('');
        return;
      }

      const response = await axios.post('http://localhost:3001/api/upload/post-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': token
        }
      });

      setUploadStatus('Upload successful!');
      setSelectedFile(null);
      setPreview('');

      // Fetch updated images
      fetchImages();
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.message || err.message));
      setUploadStatus('');
    }
  };

  return (
    <div className="upload-image-container">
      <h2>Image Upload Demo</h2>
      
      {/* Profile Picture Section */}
      <div className="profile-section">
        <h3>Current Profile Picture</h3>
        <div className="profile-pic-container">
          {profilePicUrl ? (
            <img 
              src={profilePicUrl} 
              alt="Profile" 
              className="profile-pic" 
            />
          ) : (
            <div className="no-profile-pic">No profile picture set</div>
          )}
        </div>
      </div>

      {/* Upload Form */}
      <div className="upload-section">
        <form onSubmit={handleUpload}>
          <div className="file-input-container">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="file-input"
            />
            <button type="button" className="file-button">
              Choose Image
            </button>
            <span className="file-name">
              {selectedFile ? selectedFile.name : 'No file chosen'}
            </span>
          </div>
          
          {preview && (
            <div className="image-preview-container">
              <h4>Preview:</h4>
              <img 
                src={preview} 
                alt="Preview" 
                className="image-preview" 
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="upload-button" 
            disabled={!selectedFile || uploadStatus === 'Uploading...'}>
            Upload Image
          </button>
        </form>
        
        {uploadStatus && <p className="status-message success">{uploadStatus}</p>}
        {error && <p className="status-message error">{error}</p>}
      </div>
      
      {/* Display Uploaded Images */}
      <div className="images-gallery">
        <h3>Uploaded Images</h3>
        {images.length === 0 ? (
          <p>No images found. Upload some!</p>
        ) : (
          <div className="image-grid">
            {images.map(image => (
              <div key={image.id} className="image-item">
                <img 
                  src={image.imageUrl} 
                  alt={image.name} 
                  className="gallery-image" 
                />
                <p className="image-name">{image.name}</p>
                <button 
                  className="set-profile-pic-button"
                  onClick={() => handleSetProfilePic(image.id)}
                >
                  Set as Profile Picture
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadImageDemo;
