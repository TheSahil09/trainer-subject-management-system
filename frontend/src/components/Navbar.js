import React, { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="navbar">
      <div className="navbar-left">Trainer Course Management</div>
      <div className="navbar-right">
        {user ? (
          <></>
        ) : (

          //<a href="/auth/login">Login</a>
          <button className="btn btn-link" onClick={() => navigate("/login")}> Login </button>
          
        )}
      </div>
    </div>
  );
}
