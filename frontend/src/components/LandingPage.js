import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import {
  BuildingIcon,
  UsersIcon,
  SalaryIcon,
  ChartIcon,
  MeetingIcon,
  AttendanceIcon,
  LeaveIcon,
  ArrowRightIcon,
  SparkleIcon
} from './Icons';

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo">
              <BuildingIcon size={32} color="#3B82F6" />
            </div>
            <span className="nav-name">EMS</span>
          </div>
          <div className="nav-actions">
            <button className="nav-button nav-button-secondary" onClick={() => navigate('/auth')}>
              Sign In
            </button>
            <button className="nav-button nav-button-primary" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <SparkleIcon size={16} color="#3B82F6" />
            <span>Streamline Your Workforce Management</span>
          </div>
          <h1 className="hero-title">
            Modern Employee
            <span className="gradient-text"> Management System</span>
          </h1>
          <p className="hero-description">
            Everything you need to manage your team efficiently. Track attendance, 
            handle leave requests, manage payroll, and streamline operations — all in one place.
          </p>
          <div className="hero-actions">
            <button className="cta-button cta-primary" onClick={handleGetStarted}>
              Get Started Free
              <ArrowRightIcon size={20} color="white" />
            </button>
            <button className="cta-button cta-secondary" onClick={() => navigate('/auth')}>
              Sign In
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Automated</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Access</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">Real-time</div>
              <div className="stat-label">Analytics</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">
              <ChartIcon size={40} color="#3B82F6" />
            </div>
            <div className="card-title">Analytics</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">
              <UsersIcon size={40} color="#3B82F6" />
            </div>
            <div className="card-title">Team</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">
              <AttendanceIcon size={40} color="#3B82F6" />
            </div>
            <div className="card-title">Attendance</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Powerful Features for Modern Teams</h2>
          <p className="section-subtitle">
            Everything you need to manage your workforce efficiently
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <AttendanceIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Attendance Tracking</h3>
            <p className="feature-description">
              Real-time attendance monitoring with automated check-in/check-out and comprehensive reporting.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <LeaveIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Leave Management</h3>
            <p className="feature-description">
              Streamlined leave requests, approvals, and tracking. Manage vacation, sick leave, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <SalaryIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Payroll & Salary</h3>
            <p className="feature-description">
              Automated payroll processing, salary management, and comprehensive financial reporting.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <UsersIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Employee Management</h3>
            <p className="feature-description">
              Complete employee profiles, role management, and organizational hierarchy.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <ChartIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Analytics & Reports</h3>
            <p className="feature-description">
              Real-time dashboards with insights into attendance, productivity, and team performance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <MeetingIcon size={48} color="#3B82F6" />
            </div>
            <h3 className="feature-title">Meeting Management</h3>
            <p className="feature-description">
              Schedule, track, and manage team meetings with integrated calendar and notifications.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your HR Operations?</h2>
          <p className="cta-description">
            Join thousands of teams already using EMS to streamline their workforce management.
          </p>
          <button className="cta-button cta-primary cta-large" onClick={handleGetStarted}>
            Get Started Free
            <ArrowRightIcon size={20} color="white" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <BuildingIcon size={28} color="#93C5FD" />
            </div>
            <span className="footer-name">EMS</span>
          </div>
          <p className="footer-text">Employee Management System © 2024</p>
          <div className="footer-links">
            <button className="footer-link" onClick={() => navigate('/auth')}>Sign In</button>
            <span className="footer-separator">•</span>
            <button className="footer-link" onClick={handleGetStarted}>Get Started</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

