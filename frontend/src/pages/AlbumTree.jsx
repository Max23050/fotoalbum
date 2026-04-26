import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AlbumTree.css";
import LogoutButton from "./LogoutButton";
import API_BASE_URL from "../config";

function AlbumTree() {
  const [tree, setTree] = useState([]);
  const [newAlbumName, setNewAlbumName] = useState("");
  const [parentId, setParentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE_URL}/api/albums/tree`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTree(res.data);
  };

  const handleCreate = async () => {
    if (!newAlbumName) return;
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_BASE_URL}/api/albums`,
      { name: newAlbumName, parent: parentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setNewAlbumName("");
    fetchTree();
  };

  const handleCreateNested = async (name, parentId) => {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_BASE_URL}/api/albums`,
      { name, parent: parentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchTree();
  };

  const handleRename = async (id) => {
    const newName = prompt("New album name:");
    if (!newName) return;
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_BASE_URL}/api/albums/${id}`,
      { newName },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchTree();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete the album and all its contents?")) return;
    const token = localStorage.getItem("token");
    await axios.delete(`${API_BASE_URL}/api/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTree();
  };

  const togglePublic = async (albumId) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_BASE_URL}/api/albums/${albumId}/public`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchTree();
  };


  const handleShare = async (albumId) => {
    const email = prompt("User email to grant access:");
    if (!email) return;
    const token = localStorage.getItem("token");
    await axios.put(
      `${API_BASE_URL}/api/albums/${albumId}/share`,
      { email },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    alert("Access granted");
  };

  const renderTree = (albums) => {
    return (
      <ul className="album-list">
        <LogoutButton />
        {albums.map((album) => (
          <li key={album._id} className="album-item">
            <span
              className="album-name"
              onClick={() => navigate(`/albums/${album._id}`)}
            >
              {album.name}
              {album.ownership === "shared" ? (
                <span className="shared-label">
                  {" "}
                  (shared by {album.sharedByName || album.ownerEmail || "unknown"})
                </span>
              ) : (
                <span className="owner-icon"></span>
              )}
            </span>
            {album.ownership === "owner" && (
              <span className="album-actions">
                <button onClick={() => handleRename(album._id)}>✏️</button>
                <button onClick={() => handleDelete(album._id)}>🗑️</button>
                <button
                  onClick={() => {
                    const name = prompt("Sub-album name:");
                    if (name) handleCreateNested(name, album._id);
                  }}
                >
                  ➕
                </button>
                <button onClick={() => handleShare(album._id)}>🔗</button>
                <button onClick={() => togglePublic(album._id)}>🌐</button>
                {album.isPublic && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(`${window.location.origin}/public/${album._id}`)
                    }
                    title="Copy link"
                  >
                    🌍
                  </button>
                )}
              </span>
            )}
            {album.children?.length > 0 && renderTree(album.children)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="tree-container">
      <h2>Albums</h2>
      <input
        type="text"
        placeholder="Album name"
        value={newAlbumName}
        onChange={(e) => setNewAlbumName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>
      {renderTree(tree)}
    </div>
  );
}

export default AlbumTree;
