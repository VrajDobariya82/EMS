import React, { useContext, useMemo, useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import EmployeePanel from './components/panels/EmployeePanel';
import AdminPanel from './components/panels/AdminPanel';
import LandingPage from './components/LandingPage';
import { BuildingIcon } from './components/Icons';
import AdminReportsHome from './pages/Reports/Admin/AdminReportsHome';
import EmployeeReport from './pages/Reports/Admin/EmployeeReport';
import AttendanceReport from './pages/Reports/Admin/AttendanceReport';
import LeaveReport from './pages/Reports/Admin/LeaveReport';
import PayrollReport from './pages/Reports/Admin/PayrollReport';
import MyReports from './pages/Reports/Employee/MyReports';

function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, role } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  // Check for signup mode in URL
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'Employee'
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateField = (name, value) => {
    let fieldErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          fieldErrors.email = 'Email is required';
        } else if (!validateEmail(value)) {
          fieldErrors.email = 'Please enter a valid email address';
        } else {
          delete fieldErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          fieldErrors.password = 'Password is required';
        } else if (!validatePassword(value)) {
          fieldErrors.password = 'Password must be at least 8 characters long';
        } else {
          delete fieldErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!isLogin) {
          if (!value) {
            fieldErrors.confirmPassword = 'Please confirm your password';
          } else if (value !== formData.password) {
            fieldErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete fieldErrors.confirmPassword;
          }
        }
        break;
      case 'name':
        if (!isLogin) {
          if (!value) {
            fieldErrors.name = 'Full name is required';
          } else {
            delete fieldErrors.name;
          }
        }
        break;
      default:
        break;
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, value);
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    let isConfirmPasswordValid = true;
    let isNameValid = true;
    if (!isLogin) {
      isConfirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);
      isNameValid = validateField('name', formData.name);
    }

    if (isEmailValid && isPasswordValid && isConfirmPasswordValid && isNameValid) {
      try {
        let result;
        if (isLogin) {
          result = await login({ email: formData.email, password: formData.password });
        } else {
          result = await signup({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
        }
        const target = result?.role || role || 'Employee';
        if (target === 'Admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/employee', { replace: true });
        }
      } catch (err) {
        setErrors({ form: err.message || 'Authentication failed' });
      }
    } else {
      setTouched({
        email: true,
        password: true,
        confirmPassword: !isLogin,
        name: !isLogin
      });
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setTouched({});
  };

  return (
    <div className="App">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="system-brand">
              <div className="system-logo">
                <BuildingIcon size={48} color="#3B82F6" />
              </div>
              <h1 className="system-name">EMS </h1>
              <p className="system-tagline">Employee Management System</p>
            </div>
            <div className="auth-title">
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Sign in to access your dashboard' : 'Join our team management platform'}</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                >
                  <option value="Employee">Employee</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            )}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Enter your full name"
                  className={touched.name && errors.name ? 'error' : ''}
                />
                {touched.name && errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                placeholder="Enter your email"
                className={touched.email && errors.email ? 'error' : ''}
              />
              {touched.email && errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                required
                placeholder="Enter your password (min. 8 characters)"
                className={touched.password && errors.password ? 'error' : ''}
              />
              {touched.password && errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              {!errors.password && formData.password && (
                <span className="success-message">✓ Password meets requirements</span>
              )}
            </div>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  required
                  placeholder="Confirm your password"
                  className={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
                {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <span className="success-message">✓ Passwords match</span>
                )}
              </div>
            )}
            <button 
              type="submit" 
              className="auth-button"
              disabled={Object.keys(errors).length > 0}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
            {errors.form && (
              <div className="error-message" style={{ marginTop: 12 }}>{errors.form}</div>
            )}
          </form>
          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="toggle-button"
                onClick={handleToggleMode}
                type="button"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <div className="system-features">
              <p className="features-text">✨ Streamline HR operations • 📊 Real-time analytics • 👥 Team management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { user, role } = useContext(AuthContext);
  const homeRedirect = useMemo(() => {
    if (!user) return '/';
    return role === 'Admin' ? '/admin' : '/employee';
  }, [user, role]);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={role === 'Admin' ? '/admin' : '/employee'} replace /> : <LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<ProtectedRoute allowRoles={["Employee"]} />}>
        <Route path="/employee" element={<EmployeePanel />} />
        <Route path="/employee/reports" element={<MyReports />} />
      </Route>
      <Route element={<ProtectedRoute allowRoles={["Admin"]} />}>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/reports" element={<AdminReportsHome />} />
        <Route path="/admin/reports/employees" element={<EmployeeReport />} />
        <Route path="/admin/reports/attendance" element={<AttendanceReport />} />
        <Route path="/admin/reports/leaves" element={<LeaveReport />} />
        <Route path="/admin/reports/payroll" element={<PayrollReport />} />
      </Route>

      <Route path="*" element={<Navigate to={homeRedirect} replace />} />
    </Routes>
  );
}

export default App;
