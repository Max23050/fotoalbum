import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./AlbumPage.css";
import LogoutButton from "./LogoutButton";
import API_BASE_URL from "../config";

function AlbumPage() {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newNames, setNewNames] = useState({});
  const navigate = useNavigate();
  const [subalbums, setSubalbums] = useState([]);

  useEffect(() => {
    fetchPhotos();
    fetchSubalbums();
  }, [id]);

  const fetchPhotos = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/api/photos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPhotos(res.data);
  };

  const fetchSubalbums = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/api/albums/children/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubalbums(res.data);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return alert("Choose files:");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const token = localStorage.getItem("token");

    const uploads = selectedFiles.map(async (file) => {
      if (!validTypes.includes(file.type)) {
        alert(`File "${file.name}" is not an image.`);
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("album", id);

      try {
        await axios.post(`${API_BASE_URL}/api/photos`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } catch (err) {
        alert(`Error while loading "${file.name}": ${err.response?.data?.message || err.message}`);
      }
    });

    await Promise.all(uploads);
    setSelectedFiles([]);
    fetchPhotos();
  };

  const handleDelete = async (photoId) => {
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/api/photos/${photoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPhotos();
  };

  const handleRename = async (photoId) => {
    const token = localStorage.getItem("token");
    await axios.put(`${API_BASE_URL}/api/photos/${photoId}`, {
      newName: newNames[photoId],
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPhotos();
  };

  return (
    <div className="album-page">
      <LogoutButton />
      <button onClick={() => navigate("/tree")} className="btn-back">
        Back to albums
      </button>
      <h2 className="album-title">Photos in the album</h2>

      <div className="upload-section">
        <input
          type="file"
          multiple
          onChange={(e) => setSelectedFiles([...e.target.files])}
        />
        <button onClick={handleUpload}>Upload</button>
      </div>

      <div className="photo-grid">
        {photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <a href={photo.url} target="_blank" rel="noopener noreferrer">
              <img
                src={photo.url}
                alt={photo.originalName || "Uploaded"}
                className="photo-img"
              />
            </a>
            <div className="photo-name">{photo.originalName}</div>
            <button className="btn-delete" onClick={() => handleDelete(photo._id)}>
              Delete
            </button>
            <div className="rename-section">
              <input
                type="text"
                placeholder="New name"
                value={newNames[photo._id] || ""}
                onChange={(e) =>
                  setNewNames({ ...newNames, [photo._id]: e.target.value })
                }
              />
              <button onClick={() => handleRename(photo._id)}>Rename</button>
            </div>
          </div>
        ))}
      </div>
      <div className="subalbums-container">
        <h3>Subalbums</h3>
        <ul className="subalbum-list">
          {subalbums.map((album) => (
            <li className="subalbum-item" key={album._id}>
              <a className="subalbum-link" href={`/albums/${album._id}`}>
                {album.name}
              </a>
            </li>
          ))}
        </ul>
    </div>
    </div>
  );
}

export default AlbumPage;
