import React, { useState } from 'react';
import { signup } from '../authService';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [errs, setErrs] = useState([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, username, password, password2);
      alert('Signup successful. Please login.');
      navigate('/login');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.password) {
        setErrs(error.response.data.password);
      } else {
        setErrs(['An unexpected error occurred. Please try again.']);
      }
      if (error.response) {
        console.error('Signup failed. Server response:', error.response.data);
      } else if (error.request) {
        console.error('No response from server:', error.request);
      } else {
        console.error('Error during signup:', error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">TradePaper</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input" 
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="auth-input" 
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="password" className="auth-label">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input" 
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className="auth-input" 
            />
          </div>

          <button
            type="submit"
            className="auth-button" 
          >
            Create Account
          </button>
        </form>

        {errs.length > 0 && (
          <div className="auth-errors-list">
            {errs.map((error, index) => (
              <div key={index} className="auth-error">
                {error}
              </div>
            ))}
          </div>
        )}

        <p className="auth-footer">
          Already have an account?{' '}
          <span
            className="auth-footer-link" 
            onClick={() => {
              navigate('/login');
            }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
