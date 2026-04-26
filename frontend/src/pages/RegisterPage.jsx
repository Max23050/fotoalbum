import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; 
import API_BASE_URL from "../config";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        username,
        email,
        password,
      });
      alert("Registration successful. You can now log in.");
      navigate("/login");
    } catch (err) {
      alert("Registration error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Registration</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Sign up</button>
        <p className="register-text">
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
