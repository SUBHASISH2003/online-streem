import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import OtpBox from "./components/otpBox";
import Hero from "./components/Hero";

const App = () => {
  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
        <Route path="/verify-otp" element={<OtpBox/>} />
        <Route path="/profile" element={<Hero/>} />
      </Routes>
    </div>
  );
};

export default App;
