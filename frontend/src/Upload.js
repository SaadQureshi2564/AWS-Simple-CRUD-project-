import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [image, setImage] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', image);
    try {
      await axios.post('http://localhost:5000/api/upload', formData);
      alert('Image uploaded');
    } catch (error) {
      alert('Error uploading image');
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default Upload;
