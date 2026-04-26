import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <button 
        onClick={handleLogout} 
        style={{
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
            position: "absolute",
            top: 10,
            right: 10
        }}>
      Sign out
    </button>
  );
}

export default LogoutButton;
