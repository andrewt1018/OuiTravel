import React, { useState } from "react";

const UploadDraft = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const API_URL = process.env.REACT_APP_API_URL;

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("file", selectedFiles[i]);
    }

    try {
      const response = await fetch(`${API_URL}/api/images/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Please try again.");
      }

      const data = await response.json();
      setUploadedFiles(data.files);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      <h2>Upload Images</h2>

      <input type="file" multiple onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        style={{ marginTop: "10px", cursor: "pointer" }}
      >
        Upload
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Uploaded Images</h3>
          {uploadedFiles.map((file, index) => (
            <img
              key={index}
              src={`${API_URL}/api/images/${file.filename}`}
              alt={`Uploaded File ${index + 1}`}
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadDraft;
