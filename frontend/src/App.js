import React, { useState, useEffect } from 'react';
import Login from './Login';
import Register from './Register';
import axios from 'axios';

function FileManager({ onLogout }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/upload');
      setFiles(res.data);
    } catch (err) {
      setStatus('Failed to fetch files');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      await axios.post('http://localhost:5000/api/upload', formData);
      setStatus('File uploaded successfully');
      setSelectedFile(null);
      fetchFiles();
    } catch {
      setStatus('Error uploading file');
    }
    setUploading(false);
  };

  const handleDelete = async (key) => {
    try {
      await axios.delete(`http://localhost:5000/api/upload/${encodeURIComponent(key)}`);
      setStatus('File deleted');
      fetchFiles();
    } catch {
      setStatus('Error deleting file');
    }
  };

  const handleUpdate = async (key) => {
    if (!selectedFile) {
      setStatus('Select a file to update');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      await axios.put(`http://localhost:5000/api/upload/${encodeURIComponent(key)}`, formData);
      setStatus('File updated');
      setSelectedFile(null);
      fetchFiles();
    } catch {
      setStatus('Error updating file');
    }
    setUploading(false);
  };

  return (
    <div className="App">
      <h2 style={{ textAlign: 'center' }}>File Management</h2>
      <button onClick={onLogout} style={{ float: 'right', marginBottom: 10 }}>Logout</button>
      <div style={{ marginBottom: 16 }}>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading} style={{ marginLeft: 8 }}>Add New File</button>
      </div>
      {status && <div className={`status-message ${status.includes('Error') ? 'error' : 'success'}`}>{status}</div>}
      <table className="file-list">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Last Modified</th>
            <th>Size (bytes)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(file => (
            <tr key={file.key}>
              <td>{file.key.replace('uploads/', '')}</td>
              <td>{file.lastModified ? new Date(file.lastModified).toLocaleString() : ''}</td>
              <td>{file.size}</td>
              <td className="file-actions">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <button>Download</button>
                </a>
                <button onClick={() => handleUpdate(file.key)} disabled={uploading}>Update</button>
                <button onClick={() => handleDelete(file.key)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (isAuthenticated) setPage('fileManager');
    else setPage('login');
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {page === 'login' && <Login onLogin={handleLoginSuccess} />}
      {page === 'register' && <Register />}
      {page === 'fileManager' && <FileManager onLogout={handleLogout} />}
      {page === 'login' && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={() => setPage('register')}>Register</button>
        </div>
      )}
      {page === 'register' && (
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={() => setPage('login')}>Back to Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
