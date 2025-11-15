import React from 'react';
import './ProfileSetupModal.css';

const ProfileSetupModal = ({ isOpen, onClose, onCreateNow, role, userName }) => {
  if (!isOpen) return null;

  const profileType = role === 'Employee' ? 'Employee Profile' : 'Admin Profile';

  return (
    <div className="profile-setup-modal-overlay" onClick={onClose}>
      <div className="profile-setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-setup-modal-header">
          <div className="profile-setup-icon">👤</div>
          <h2>Create Your Profile</h2>
          <button className="profile-setup-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="profile-setup-modal-content">
          <p className="profile-setup-message">
            Welcome, <strong>{userName}</strong>! 👋
          </p>
          <p className="profile-setup-description">
            Complete your {profileType.toLowerCase()} to get started. You can add your details now or do it later.
          </p>
        </div>
        <div className="profile-setup-modal-actions">
          <button 
            className="profile-setup-btn profile-setup-btn-primary" 
            onClick={onCreateNow}
          >
            Create Now
          </button>
          <button 
            className="profile-setup-btn profile-setup-btn-secondary" 
            onClick={onClose}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;

