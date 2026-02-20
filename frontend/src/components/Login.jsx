import React, { useState } from 'react';
import { login } from '../authService';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      setLoginErr('Incorrect username or password');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">TradePaper</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="username" className="auth-label">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
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

          <button
            type="submit"
            className="auth-button" 
          >
            Sign In
          </button>
        </form>

        {loginErr && (
          <div className="auth-error" style={{ marginTop: '16px' }}>
            {loginErr}
          </div>
        )}

        <p className="auth-footer">
          New to TradePaper?{' '}
          <span
            className="auth-footer-link" 
            onClick={() => {
              navigate('/signup');
            }}
          >
            Create an account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
