import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const OtpBox = ({ length = 4 }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setError("Email was not found.");
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (!email) {
      setError("User email not found.");
      return;
    }

    if (otpValue.length !== length) {
      setError("Please enter the full OTP.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP Verified Successfully!");
        setTimeout(() => navigate("/profile"), 1500);
      } else {
        setError(data.message || "OTP verification failed.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error:", error);
    }

    setLoading(false);
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <div className="content">
          <p align="center">Enter your OTP Code</p>
          <div className="inp">
            {otp.map((_, index) => (
              <input
                key={index}
                maxLength={1}
                className="input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otp[index]}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputsRef.current[index] = el)}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
          {message && <p className="message success">{message}</p>}
          {error && <p className="message error">{error}</p>}
        </div>
      </form>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f4f4f4;

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #d3d3d3;
    color: #2c2c2c;
    border-radius: 8px;
    box-shadow: 4px 4px #2c2c2c;
    border: 2px solid #2c2c2c;
    width: 20em;
    padding: 1.5em;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: auto;
  }

  .form p {
    text-align: center;
    color: #2c2c2c;
    font-weight: bold;
  }

  .inp {
    display: flex;
    justify-content: center;
    gap: 8px;
  }

  .input {
    color: #2c2c2c;
    height: 2.5em;
    width: 2.5em;
    text-align: center;
    background: #fff;
    border: 1px solid #999;
    border-radius: 6px;
    font-size: 1.2em;
    transition: all 0.3s ease;
  }

  .input:focus {
    border: 1px solid #2c2c2c;
    outline: none;
    background-color: #f0f0f0;
  }

  .form button {
    margin: auto;
    background-color: #2c2c2c;
    color: #fff;
    width: 9em;
    height: 2.5em;
    border: none;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .form button:hover {
    background-color: #fff;
    color: #2c2c2c;
    border: 1px solid #2c2c2c;
  }

  .message {
    text-align: center;
    font-weight: bold;
  }

  .success {
    color: green;
  }

  .error {
    color: red;
  }
`;

export default OtpBox;
