import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

function PublicAlbumPage() {
  const { id } = useParams();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    fetchPhotos();
  }, [id]);

  const fetchPhotos = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/photos/${id}`);
    setPhotos(res.data);
  };

  return (
    <div className="album-page">
      <h2 className="album-title">Public Album</h2>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div className="photo-card" key={photo._id}>
            <img src={photo.url} alt={photo.originalName} className="photo-img" />
            <div className="photo-name">{photo.originalName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PublicAlbumPage;
