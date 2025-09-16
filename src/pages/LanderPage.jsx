import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../auth/api";
import { useAuthContext } from "../auth/AuthContext";
import box from "../assets/box.svg";
import spring from "../assets/spring.svg";

const LanderPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuthContext(); // ✅ get login from context
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("login/", {
        email,
        password,
      });

      // ✅ Use context's login function
      login(res.data.access, res.data.refresh);

      // ✅ Now isAuthenticated will update automatically
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="bg-[#d0e8f5] h-screen">
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LanderPage;
