import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { logout } from '../authService';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('accounts/me/');
      setProfile(res.data);
      setFormData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        phone_number: res.data.phone_number || '',
        date_of_birth: res.data.date_of_birth || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });
      if (profileImage) {
        data.append('profile_image', profileImage);
      }

      const res = await api.patch('accounts/me/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(res.data);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setProfileImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone_number: profile.phone_number || '',
      date_of_birth: profile.date_of_birth || '',
    });
    setProfileImage(null);
    setImagePreview(null);
    setError('');
    setSuccess('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="page">
        <div className="page-content">
          <div className="card">
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!isEditing && (
            <>
              <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <div className="page-content">
        {error && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            border: '1px solid rgba(52, 199, 89, 0.3)',
            borderRadius: '10px',
            color: '#34c759',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        <div className="card">
          {!isEditing ? (
            <div className="profile-view">
              <div className="profile-header" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div className="profile-avatar" style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'var(--primary-color)',
                  border: '3px solid var(--border-color)'
                }}>
                  {profile.profile_image ? (
                    <img
                      src={`http://localhost:8000${profile.profile_image}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{profile.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                    {profile.first_name && profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.username}
                  </h2>
                  <p style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
                    @{profile.username}
                  </p>
                  {profile.is_verified && (
                    <span className="badge" style={{
                      backgroundColor: 'rgba(52, 199, 89, 0.15)',
                      color: '#34c759',
                      marginTop: '8px'
                    }}>
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="profile-details" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                <div className="profile-field">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Email</label>
                  <p style={{ fontSize: '15px' }}>{profile.email || 'Not provided'}</p>
                </div>

                <div className="profile-field">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Phone Number</label>
                  <p style={{ fontSize: '15px' }}>{profile.phone_number || 'Not provided'}</p>
                </div>

                <div className="profile-field">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Date of Birth</label>
                  <p style={{ fontSize: '15px' }}>
                    {profile.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString()
                      : 'Not provided'}
                  </p>
                </div>

                <div className="profile-field">
                  <label style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                    display: 'block'
                  }}>Member Since</label>
                  <p style={{ fontSize: '15px' }}>
                    {new Date(profile.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-edit-form">
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div className="profile-avatar" style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  fontWeight: '600',
                  color: 'var(--primary-color)',
                  border: '3px solid var(--border-color)',
                  marginBottom: '16px'
                }}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : profile.profile_image ? (
                    <img
                      src={`http://localhost:8000${profile.profile_image}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span>{profile.username?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div className="auth-input-group">
                  <label className="auth-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter first name"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter last name"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter email"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Enter phone number"
                    maxLength="10"
                  />
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="auth-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
