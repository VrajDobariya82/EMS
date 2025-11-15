import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { AuthContext } from '../context/AuthContext';
import { api } from '../api';
import ProfileSetupModal from './ProfileSetupModal';
import {
  UsersIcon,
  UserCheckIcon,
  CalendarIcon,
  BuildingIcon,
  DashboardIcon,
  EmployeesIcon,
  ProfileIcon,
  AttendanceIcon,
  LeaveIcon,
  MeetingIcon,
  ReportsIcon,
  SalaryIcon,
  SettingsIcon,
  LogoutIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  PlusIcon,
  ChartIcon,
  DocumentIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockInIcon,
  ClockOutIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ActivityIcon,
  MailIcon
} from './Icons';
import { generateAvatarUrl, getDummyProfileImage, fileToDataUrl, validateImageFile } from '../utils/profileImage';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, profilePending, markProfileComplete, updateProfile } = useContext(AuthContext);
  const isEmployeeRole = role === 'Employee';
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Check if we're on a reports route
    if (location.pathname.includes('/reports')) {
      return 'reports';
    }
    return 'dashboard';
  });
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  // Attendance state
  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem('ems_attendance');
    return saved ? JSON.parse(saved) : {};
  });
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Default employee data with professional dummy images
  const defaultEmployees = useMemo(() => [
    {
      id: 1,
      name: 'John Doe',
      position: 'Software Engineer',
      department: 'Engineering',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      avatar: getDummyProfileImage('John Doe', 'male'),
      status: 'Active',
      joinDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Product Manager',
      department: 'Product',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 234-5678',
      avatar: getDummyProfileImage('Jane Smith', 'female'),
      status: 'Active',
      joinDate: '2022-08-20'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'UI/UX Designer',
      department: 'Design',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 345-6789',
      avatar: getDummyProfileImage('Mike Johnson', 'male'),
      status: 'On Leave',
      joinDate: '2023-03-10'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      position: 'HR Manager',
      department: 'Human Resources',
      email: 'sarah.wilson@company.com',
      phone: '+1 (555) 456-7890',
      avatar: getDummyProfileImage('Sarah Wilson', 'female'),
      status: 'Active',
      joinDate: '2021-11-05'
    }
  ], []);

  // Default recent activities
  const defaultActivities = [
    { id: 1, action: 'New employee added', user: 'John Doe', time: '2 hours ago', timestamp: Date.now() - (2 * 60 * 60 * 1000) },
    { id: 2, action: 'Leave request approved', user: 'Mike Johnson', time: '4 hours ago', timestamp: Date.now() - (4 * 60 * 60 * 1000) },
    { id: 3, action: 'Department meeting scheduled', user: 'Sarah Wilson', time: '1 day ago', timestamp: Date.now() - (24 * 60 * 60 * 1000) },
    { id: 4, action: 'Performance review completed', user: 'Jane Smith', time: '2 days ago', timestamp: Date.now() - (48 * 60 * 60 * 1000) }
  ];

  // Employees loaded from API
  const [employees, setEmployees] = useState([]);

  const [recentActivities, setRecentActivities] = useState(() => {
    const savedActivities = localStorage.getItem('ems_activities');
    return savedActivities ? JSON.parse(savedActivities) : defaultActivities;
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  // Leave management state
  const [leaves, setLeaves] = useState(() => {
    const saved = localStorage.getItem('ems_leaves');
    return saved ? JSON.parse(saved) : [];
  });
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ems_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  // Meetings state
  const [meetings, setMeetings] = useState(() => {
    const saved = localStorage.getItem('ems_meetings');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingMeeting, setEditingMeeting] = useState(null);

  // Derive the logged-in employee record (if any)
  const selfEmployee = employees.find(emp => emp.email === user?.email);

  // Save employees and activities to localStorage whenever they change
  useEffect(() => {
    // Load employees from API
    (async () => {
      try {
        const data = await api.get('/employees');
        setEmployees(data);
      } catch (_) {
        // fallback to defaults if API not available (dev only)
        setEmployees(defaultEmployees);
      }
    })();
  }, []);

  // Load attendance from API (for admin panel)
  useEffect(() => {
    if (!isEmployeeRole && employees.length > 0) {
      (async () => {
        try {
          const data = await api.get('/attendance');
          setAttendance(data);
        } catch (e) {
          console.error('Failed to load attendance:', e);
        }
      })();
    }
  }, [isEmployeeRole, employees.length]);

  // Reload attendance when admin opens attendance tab (only once per tab open)
  const attendanceTabLoaded = React.useRef(false);
  useEffect(() => {
    if (!isEmployeeRole && activeTab === 'attendance' && !attendanceTabLoaded.current) {
      attendanceTabLoaded.current = true;
      (async () => {
        try {
          const data = await api.get('/attendance');
          setAttendance(data);
        } catch (e) {
          console.error('Failed to reload attendance:', e);
        }
      })();
    }
    // Reset the flag when tab changes away from attendance
    if (activeTab !== 'attendance') {
      attendanceTabLoaded.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isEmployeeRole]);

  // Show profile setup modal on first login if profile is pending
  useEffect(() => {
    if (profilePending && !showProfileModal) {
      // Check if we've already shown the modal in this session
      const hasShownModal = sessionStorage.getItem('profileModalShown');
      if (!hasShownModal) {
        setShowProfileModal(true);
        sessionStorage.setItem('profileModalShown', 'true');
      }
    }
  }, [profilePending, showProfileModal]);

  // After employees loaded, if session says needsProfileSetup and we have a self profile, open edit modal
  useEffect(() => {
    try {
      const raw = localStorage.getItem('ems.session');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.needsProfileSetup && selfEmployee) {
        setActiveTab('myProfile');
        setSelectedEmployee(selfEmployee);
        setIsEditing(true);
        // clear the flag
        const cleared = { ...parsed, needsProfileSetup: false };
        localStorage.setItem('ems.session', JSON.stringify(cleared));
      }
    } catch (_) {}
  }, [selfEmployee]);

  useEffect(() => {
    localStorage.setItem('ems_activities', JSON.stringify(recentActivities));
  }, [recentActivities]);

  // attendance persisted via API per action

  // leaves persisted via API per action

  useEffect(() => {
    localStorage.setItem('ems_theme', theme);
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme === 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ems_meetings', JSON.stringify(meetings));
  }, [meetings]);

  // Function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  };

  // Update activity times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentActivities(prev => 
        prev.map(activity => ({
          ...activity,
          time: formatTimeAgo(activity.timestamp)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Employees land on My Profile by default for clarity
  useEffect(() => {
    if (isEmployeeRole) {
      setActiveTab('myProfile');
    }
  }, [isEmployeeRole]);

  const stats = [
    { 
      title: 'Total Employees', 
      value: employees.length.toString(), 
      icon: <UsersIcon size={28} color="white" />, 
      color: '#3B82F6' 
    },
    { 
      title: 'Active Employees', 
      value: employees.filter(emp => emp.status === 'Active').length.toString(), 
      icon: <UserCheckIcon size={28} color="white" />, 
      color: '#10B981' 
    },
    { 
      title: 'On Leave', 
      value: employees.filter(emp => emp.status === 'On Leave').length.toString(), 
      icon: <CalendarIcon size={28} color="white" />, 
      color: '#F59E0B' 
    },
    { 
      title: 'Departments', 
      value: [...new Set(employees.map(emp => emp.department))].length.toString(), 
      icon: <BuildingIcon size={28} color="white" />, 
      color: '#3B82F6' 
    }
  ];

  // Employee action handlers
  const handleEditEmployee = (employee) => {
    if (isEmployeeRole && employee.email !== user?.email) {
      alert('Employees can only edit their own profile.');
      return;
    }
    setSelectedEmployee(employee);
    setIsEditing(true);
    setShowProfile(false);
    setShowAddForm(false);
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setShowProfile(true);
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleDeleteEmployee = (employeeId) => {
    if (isEmployeeRole) {
      alert('Employees cannot delete employee records.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this employee?')) {
      const employeeToDelete = employees.find(emp => emp.id === employeeId);
      const updatedEmployees = employees.filter(emp => emp.id !== employeeId);
      setEmployees(updatedEmployees);
      
      // Add activity for employee deletion
      const newActivity = {
        id: Date.now(),
        action: 'Employee deleted',
        user: employeeToDelete.name,
        time: 'Just now',
        timestamp: Date.now()
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent
      
      alert('Employee deleted successfully!');
    }
  };

  const handleSaveEdit = async (updatedEmployee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );
    setEmployees(updatedEmployees);
    
    // If user is editing their own profile, mark profile as complete
    if (isEmployeeRole && updatedEmployee.email === user?.email && profilePending) {
      await markProfileComplete();
    }
    
    // Add activity for employee update
    const newActivity = {
      id: Date.now(),
      action: 'Employee details updated',
      user: updatedEmployee.name,
      time: 'Just now',
      timestamp: Date.now()
    };
    setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    
    setIsEditing(false);
    setSelectedEmployee(null);
    alert('Employee updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEmployee(null);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setSelectedEmployee(null);
  };

  // Add new employee function
  const handleAddEmployee = () => {
    if (isEmployeeRole) {
      alert('Employees cannot add other employees.');
      return;
    }
    setShowAddForm(true);
    setIsEditing(false);
    setShowProfile(false);
  };

  const handleSaveNewEmployee = async (newEmployeeData) => {
    const payload = {
      ...newEmployeeData,
      avatar: newEmployeeData.avatar || generateAvatarUrl(newEmployeeData.name),
      joinDate: new Date().toISOString().split('T')[0]
    };
    try {
      const created = await api.post('/employees', payload);
      setEmployees(prev => [...prev, created]);
      const newActivity = {
        id: Date.now(),
        action: 'New employee added',
        user: created.name,
        time: 'Just now',
        timestamp: Date.now()
      };
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      setShowAddForm(false);
      alert('New employee added successfully!');
    } catch (e) {
      alert('Failed to add employee: ' + (e?.message || ''));
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  // Attendance helpers
  const getEmployeeAttendance = (employeeEmail) => attendance[employeeEmail] || {};

  // Normalize a stored record (string or object) to an object
  const normalizeRecord = (rec) => {
    if (!rec) return null;
    if (typeof rec === 'string') {
      return { status: rec, clockIn: null, clockOut: null };
    }
    // Ensure all expected fields exist
    return {
      status: rec.status || 'Unmarked',
      clockIn: rec.clockIn || null,
      clockOut: rec.clockOut || null
    };
  };

  const setEmployeeAttendance = async (employeeEmail, dateStr, valueOrStatus) => {
    const prevUser = attendance[employeeEmail] || {};
    const prevDay = normalizeRecord(prevUser[dateStr]) || { status: 'Unmarked', clockIn: null, clockOut: null };
    
    // When updating, preserve existing clockIn/clockOut unless explicitly provided
    let nextDay;
    if (typeof valueOrStatus === 'string') {
      // Only status provided - preserve clockIn/clockOut
      nextDay = { ...prevDay, status: valueOrStatus };
    } else {
      // Object provided - merge with existing, preserving what's not being updated
      nextDay = { ...prevDay, ...valueOrStatus };
    }
    
    // Update local state immediately for UI responsiveness
    setAttendance(prev => ({
      ...prev,
      [employeeEmail]: {
        ...prevUser,
        [dateStr]: nextDay
      }
    }));
    
    // Push to API - always send all fields to ensure they're preserved
    try {
      await api.post(`/attendance/${employeeEmail}`, { 
        date: dateStr, 
        status: nextDay.status,
        clockIn: nextDay.clockIn || null,
        clockOut: nextDay.clockOut || null
      });
      
      // Note: Admin panel will reload attendance when tab is opened or refresh button is clicked
    } catch (e) {
      console.error('Failed to persist attendance:', e);
      // Revert on error
      setAttendance(prev => ({
        ...prev,
        [employeeEmail]: prevUser
      }));
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch (_) {
      return '-';
    }
  };

  const diffHours = (startIso, endIso) => {
    if (!startIso || !endIso) return '-';
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return '-';
    const minutes = Math.round((end - start) / (1000 * 60));
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const countAttendance = (records) => {
    const keys = Object.keys(records);
    const ym = new Date().toISOString().slice(0, 7); // YYYY-MM
    let monthPresent = 0, monthAbsent = 0, totalPresent = 0, totalAbsent = 0;
    for (const date of keys) {
      const normalized = normalizeRecord(records[date]);
      const status = normalized?.status || 'Unmarked';
      const isThisMonth = date.startsWith(ym);
      if (status === 'Present') {
        totalPresent++;
        if (isThisMonth) monthPresent++;
      } else if (status === 'Absent') {
        totalAbsent++;
        if (isThisMonth) monthAbsent++;
      }
    }
    return { monthPresent, monthAbsent, totalPresent, totalAbsent };
  };

  // Edit form component
  const EditEmployeeForm = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState(employee);
    const [avatarPreview, setAvatarPreview] = useState(employee.avatar || generateAvatarUrl(employee.name));
    const [imageError, setImageError] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }

      setImageError('');
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatarPreview(dataUrl);
        setFormData(prev => ({
          ...prev,
          avatar: dataUrl
        }));
      } catch (error) {
        setImageError('Failed to process image. Please try again.');
      }
    };

    const handleGenerateAvatar = () => {
      const avatarUrl = generateAvatarUrl(formData.name);
      setAvatarPreview(avatarUrl);
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      setImageError('');
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <div className="edit-modal-header">
            <h2>Edit Employee</h2>
            <button className="close-btn" onClick={onCancel}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Profile Image:</label>
              <div className="avatar-upload-section">
                <div className="avatar-preview-container">
                  <img src={avatarPreview} alt="Profile" className="avatar-preview" />
                  <div className="avatar-overlay">
                    <label htmlFor="avatar-upload-edit" className="avatar-upload-btn">
                      <EditIcon size={20} color="white" />
                      <span>Change</span>
                    </label>
                    <input
                      type="file"
                      id="avatar-upload-edit"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <button type="button" className="generate-avatar-btn" onClick={handleGenerateAvatar}>
                  Generate Avatar
                </button>
                {imageError && <span className="error-message">{imageError}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className="form-group">
              <label>Join Date:</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add new employee form component
  const AddEmployeeForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: '',
      position: '',
      department: 'Engineering',
      email: '',
      phone: '',
      status: 'Active',
      avatar: ''
    });
    const [avatarPreview, setAvatarPreview] = useState(generateAvatarUrl(''));
    const [imageError, setImageError] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Auto-generate avatar when name changes
      if (name === 'name' && value) {
        const avatarUrl = generateAvatarUrl(value);
        setAvatarPreview(avatarUrl);
        setFormData(prev => ({
          ...prev,
          avatar: avatarUrl
        }));
      }
    };

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }

      setImageError('');
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatarPreview(dataUrl);
        setFormData(prev => ({
          ...prev,
          avatar: dataUrl
        }));
      } catch (error) {
        setImageError('Failed to process image. Please try again.');
      }
    };

    const handleGenerateAvatar = () => {
      const avatarUrl = generateAvatarUrl(formData.name || 'Employee');
      setAvatarPreview(avatarUrl);
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      setImageError('');
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Ensure avatar is set
      if (!formData.avatar) {
        formData.avatar = generateAvatarUrl(formData.name || 'Employee');
      }
      onSave(formData);
    };

    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <div className="edit-modal-header">
            <h2>Add New Employee</h2>
            <button className="close-btn" onClick={onCancel}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Profile Image:</label>
              <div className="avatar-upload-section">
                <div className="avatar-preview-container">
                  <img src={avatarPreview} alt="Profile" className="avatar-preview" />
                  <div className="avatar-overlay">
                    <label htmlFor="avatar-upload-add" className="avatar-upload-btn">
                      <EditIcon size={20} color="white" />
                      <span>Upload</span>
                    </label>
                    <input
                      type="file"
                      id="avatar-upload-add"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <button type="button" className="generate-avatar-btn" onClick={handleGenerateAvatar}>
                  Generate Avatar
                </button>
                {imageError && <span className="error-message">{imageError}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter employee name"
                required
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter job position"
                required
              />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Add Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Profile view component
  const EmployeeProfile = ({ employee, onClose }) => {
    return (
      <div className="profile-modal-overlay">
        <div className="profile-modal">
          <div className="profile-modal-header">
            <h2>Employee Profile</h2>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="profile-content">
            <div className="profile-header">
              <img src={employee.avatar} alt={employee.name} className="profile-avatar" />
              <div className="profile-info">
                <h3>{employee.name}</h3>
                <p className="profile-position">{employee.position}</p>
                <span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                  {employee.status}
                </span>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{employee.department}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{employee.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{employee.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Join Date:</span>
                <span className="detail-value">{employee.joinDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Employee ID:</span>
                <span className="detail-value">
                  {(() => {
                    const empId = employee.id || employee._id;
                    if (!empId) return '#N/A';
                    const idStr = String(empId);
                    return `#${idStr.slice(-6).padStart(6, '0')}`;
                  })()}
                </span>
              </div>
            </div>
            <div className="profile-actions">
              <button 
                className="profile-action-btn edit"
                onClick={() => {
                  onClose();
                  handleEditEmployee(employee);
                }}
              >
                <EditIcon size={18} color="white" />
                <span>Edit Profile</span>
              </button>
              <button className="profile-action-btn contact">
                <MailIcon size={18} color="white" />
                <span>Contact Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Employee Management System</h1>
        <p className="user-name">Welcome back! {selfEmployee?.name || user?.name || user?.email || 'User'}</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ backgroundColor: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Employee List */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Employees</h2>
            <button className="view-all-btn" onClick={() => setActiveTab('employees')}>View All</button>
          </div>
          <div className="employee-list">
            {employees.slice(0, 4).map(employee => (
              <div key={employee.id} className="employee-card">
                <img src={employee.avatar} alt={employee.name} className="employee-avatar" />
                <div className="employee-info">
                  <h4>{employee.name}</h4>
                  <p>{employee.position}</p>
                  <span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                    {employee.status}
                  </span>
                </div>
                <div className="employee-actions">
                  <button 
                    className="action-btn" 
                    onClick={() => handleViewProfile(employee)}
                    title="View Profile"
                  >
                    <EyeIcon size={18} color="#1F2937" />
                  </button>
                  <button 
                    className="action-btn" 
                    onClick={() => handleEditEmployee(employee)}
                    title={isEmployeeRole && employee.email !== user?.email ? 'You can only edit your own profile' : 'Edit Employee'}
                    disabled={isEmployeeRole && employee.email !== user?.email}
                    style={isEmployeeRole && employee.email !== user?.email ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
                  >
                    <EditIcon size={18} color="#1F2937" />
                  </button>
                  {!isEmployeeRole && (
                    <button 
                      className="action-btn" 
                      onClick={() => handleDeleteEmployee(employee.id)}
                      title="Delete Employee"
                    >
                      <TrashIcon size={18} color="#EF4444" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
          </div>
          <div className="activity-list">
            {recentActivities.slice(0, 4).map((activity, index) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <ActivityIcon size={20} color="white" />
                </div>
                <div className="activity-content">
                  <p className="activity-text">{activity.action}</p>
                  <p className="activity-user">{activity.user}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            {!isEmployeeRole && (
              <button className="quick-action-btn" onClick={handleAddEmployee}>
                <PlusIcon size={20} color="#1F2937" />
                <span>Add Employee</span>
              </button>
            )}
            <button className="quick-action-btn">
              <ChartIcon size={20} color="#1F2937" />
              <span>Generate Report</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('meetings')}>
              <MeetingIcon size={20} color="#1F2937" />
              <span>Schedule Meeting</span>
            </button>
            <button className="quick-action-btn">
              <DocumentIcon size={20} color="#1F2937" />
              <span>Leave Requests</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Meetings helpers
  const upsertMeeting = async (data) => {
    if (!data.title || !data.date || !data.timeStart) {
      alert('Please fill title, date and start time');
      return;
    }
    const payload = {
      id: data.id || Date.now(),
      title: data.title,
      description: data.description || '',
      date: data.date, // YYYY-MM-DD
      timeStart: data.timeStart, // HH:MM
      timeEnd: data.timeEnd || '',
      allEmployees: !!data.allEmployees,
      invitees: data.allEmployees ? [] : (data.invitees || []), // emails
      createdBy: user?.email || 'admin',
      createdAt: data.createdAt || new Date().toISOString()
    };
    try {
      if (data.id || data._id) {
        const updated = await api.put(`/meetings/${data.id || data._id}`, payload);
        setMeetings(prev => prev.map(m => (m._id || m.id) === (updated._id || updated.id) ? updated : m));
      } else {
        const created = await api.post('/meetings', payload);
        setMeetings(prev => [created, ...prev]);
      }
    } catch (e) {
      console.error('Meeting upsert failed', e);
    }
    setEditingMeeting(null);
    setRecentActivities(prev => [
      { id: Date.now(), action: `Meeting ${data.id ? 'updated' : 'created'}`, user: selfEmployee?.name || (user?.email || 'Admin'), time: 'Just now', timestamp: Date.now() },
      ...prev
    ].slice(0, 10));
  };

  const removeMeeting = async (id) => {
    try {
      await api.del(`/meetings/${id}`);
      setMeetings(prev => prev.filter(m => (m._id || m.id) !== id));
    } catch (e) {
      console.error('Delete meeting failed', e);
    }
    setRecentActivities(prev => [
      { id: Date.now(), action: 'Meeting deleted', user: selfEmployee?.name || (user?.email || 'Admin'), time: 'Just now', timestamp: Date.now() },
      ...prev
    ].slice(0, 10));
  };

  // Settings tab component (to safely use Hooks)
  const SettingsView = () => {
    // Load list from API
    useEffect(() => {
      (async () => {
        try {
          const data = await api.get('/meetings');
          setMeetings(data);
        } catch (e) {
          // ignore, keep local
        }
      })();
    }, []);
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Settings</h1>
        </div>
        <div className="dashboard-card" style={{ maxWidth: 600 }}>
          <div className="card-header"><h2>Appearance</h2></div>
          <div className="attendance-controls" style={{ gridTemplateColumns: '1fr' }}>
            <label>
              Theme
              <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
        </div>
        {/* Admin profile modules removed per request */}
      </div>
    );
  };

  // Meetings tab - Admin
  const AdminMeetingsView = () => {
    const defaultMeeting = { title: '', description: '', date: todayStr, timeStart: '10:00', timeEnd: '11:00', allEmployees: true, invitees: [] };
    const [form, setForm] = useState(() => editingMeeting || defaultMeeting);
    useEffect(() => {
      setForm(editingMeeting || defaultMeeting);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingMeeting ? editingMeeting.id : null]);
    const onChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const toggleInvitee = (email) => {
      setForm(prev => ({ ...prev, invitees: prev.invitees.includes(email) ? prev.invitees.filter(x => x !== email) : [...prev.invitees, email] }));
    };
    const onSubmit = (e) => { e.preventDefault(); upsertMeeting({ ...form, id: editingMeeting?.id }); };
    const onCancel = () => setEditingMeeting(null);

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Meetings</h1>
        </div>
        <div className="dashboard-card">
          <div className="card-header"><h2>{editingMeeting ? 'Edit Meeting' : 'Create Meeting'}</h2></div>
          <form onSubmit={onSubmit} className="edit-form">
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={onChange} placeholder="Sprint Planning" />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="timeStart" value={form.timeStart} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="timeEnd" value={form.timeEnd} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Invite All Employees</label>
              <input type="checkbox" name="allEmployees" checked={form.allEmployees} onChange={onChange} />
            </div>
            {!form.allEmployees && (
              <div className="form-group">
                <label>Invitees</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {employees.map(emp => (
                    <label key={emp.email} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" checked={form.invitees.includes(emp.email)} onChange={() => toggleInvitee(emp.email)} />
                      <span>{emp.name} ({emp.email})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={onChange} rows="3" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb' }} placeholder="Agenda or notes" />
            </div>
            <div className="form-actions">
              {editingMeeting && <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>}
              <button type="submit" className="save-btn">{editingMeeting ? 'Update Meeting' : 'Create Meeting'}</button>
            </div>
          </form>
        </div>
        <div className="dashboard-card">
          <div className="card-header"><h2>Scheduled Meetings</h2></div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Invites</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 && (
                <tr><td colSpan="5">No meetings yet.</td></tr>
              )}
              {meetings.sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||'')).map(m => (
                <tr key={m._id || m.id}>
                  <td>{m.title}</td>
                  <td>{m.date}</td>
                  <td>{m.timeStart}{m.timeEnd ? ` - ${m.timeEnd}` : ''}</td>
                  <td>{m.allEmployees ? 'All Employees' : `${m.invitees.length} selected`}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn-detailed" onClick={() => setEditingMeeting(m)}>Edit</button>
                      <button className="action-btn-detailed danger" onClick={() => removeMeeting(m._id || m.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Meetings tab - Employee
  const EmployeeMeetingsView = () => {
    const myEmail = user?.email;
    const [myMeetings, setMyMeetings] = useState([]);
    useEffect(() => {
      (async () => {
        try {
          const data = await api.get(`/meetings/mine/${myEmail}`);
          setMyMeetings(data);
        } catch (e) {
          setMyMeetings(meetings.filter(m => m.allEmployees || (m.invitees || []).includes(myEmail)));
        }
      })();
    }, [myEmail]);
    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Meetings</h1>
        </div>
        <div className="dashboard-card">
          <div className="card-header"><h2>My Meetings</h2></div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {myMeetings.length === 0 && (
                <tr><td colSpan="4">No meetings assigned to you.</td></tr>
              )}
              {myMeetings.sort((a,b) => (a.date + a.timeStart).localeCompare(b.date + b.timeStart)).map(m => (
                <tr key={m._id || m.id}>
                  <td>{m.title}</td>
                  <td>{m.date}</td>
                  <td>{m.timeStart}{m.timeEnd ? ` - ${m.timeEnd}` : ''}</td>
                  <td>{m.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Leave helpers
  const submitLeave = async ({ type, startDate, endDate, reason, description }) => {
    if (!user?.email) return;
    const payload = { employeeEmail: user.email, employeeName: selfEmployee?.name || user.email, type, startDate, endDate, reason, description };
    let created;
    try {
      created = await api.post('/leaves', payload);
    } catch (e) {
      console.error('Leave submit failed', e);
      return;
    }
    setLeaves(prev => [created, ...prev]);
    setRecentActivities(prev => [
      { id: Date.now() + 1, action: `Leave requested (${type})`, user: payload.employeeName, time: 'Just now', timestamp: Date.now() },
      ...prev
    ].slice(0, 10));
  };

  const updateLeaveStatus = async (leaveId, status, justification = '') => {
    try {
      const updated = await api.put(`/leaves/${leaveId}/status`, { status, adminJustification: justification });
      setLeaves(prev => prev.map(l => l._id === updated._id ? updated : l));
    } catch (e) {
      console.error('Update leave failed', e);
    }
    const leave = leaves.find(l => (l._id || l.id) === leaveId);
    const actor = user?.email;
    setRecentActivities(prev => [
      { id: Date.now() + 2, action: `Leave ${status.toLowerCase()}`, user: leave ? (leave.employeeName) : actor, time: 'Just now', timestamp: Date.now() },
      ...prev
    ].slice(0, 10));
  };

  // Leave Management - Employee
  const EmployeeLeavesView = () => {
    const [myLeaves, setMyLeaves] = useState([]);
    useEffect(() => {
      (async () => {
        try {
          const data = await api.get(`/leaves/mine/${user?.email}`);
          setMyLeaves(data);
        } catch (e) {
          setMyLeaves(leaves.filter(l => l.employeeEmail === user?.email));
        }
      })();
    }, [user?.email]);
    const LeaveForm = () => {
      const [form, setForm] = useState({ type: 'Vacation', startDate: todayStr, endDate: todayStr, reason: '', description: '' });
      const onChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
      };
      const onSubmit = (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate || !form.reason) {
          alert('Please fill type, dates and reason.');
          return;
        }
        if (new Date(form.endDate) < new Date(form.startDate)) {
          alert('End date cannot be before start date.');
          return;
        }
        submitLeave(form);
        setForm({ type: 'Vacation', startDate: todayStr, endDate: todayStr, reason: '', description: '' });
        alert('Leave submitted!');
      };
      return (
        <div className="dashboard-card">
          <div className="card-header"><h2>Request Leave</h2></div>
          <form onSubmit={onSubmit} className="edit-form">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={onChange}>
                <option value="Vacation">Vacation</option>
                <option value="Sick">Sick</option>
                <option value="Personal">Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={onChange} />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input type="text" name="reason" value={form.reason} onChange={onChange} placeholder="Short reason" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={onChange} rows="3" style={{ width: '100%', padding: 14, borderRadius: 12, border: '2px solid #e5e7eb' }} placeholder="Additional details (optional)" />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Submit Leave</button>
            </div>
          </form>
        </div>
      );
    };

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Leave Management</h1>
        </div>
        <LeaveForm />
        <div className="dashboard-card">
          <div className="card-header"><h2>My Leave Requests</h2></div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Note</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.length === 0 && (
                <tr><td colSpan="7">No leave requests yet.</td></tr>
              )}
              {myLeaves.sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||'')).map(l => (
                <tr key={l._id || l.id}>
                  <td>{(l.createdAt||'').slice(0,10)}</td>
                  <td>{l.type}</td>
                  <td>{l.startDate}</td>
                  <td>{l.endDate}</td>
                  <td>{l.reason}</td>
                  <td>{l.status}</td>
                  <td>{l.status === 'Rejected' ? (l.adminJustification || '-') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Leave Management - Admin
  const AdminLeavesView = () => {
    const [filter, setFilter] = useState('All');
    const [list, setList] = useState([]);
    useEffect(() => {
      (async () => {
        try {
          const data = await api.get('/leaves');
          setList(data);
        } catch (e) {
          setList(leaves);
        }
      })();
    }, []);
    const filtered = (list || []).filter(l => filter === 'All' ? true : l.status === filter);

    // Decision modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('Approve');
    const [selectedId, setSelectedId] = useState(null);
    const [justification, setJustification] = useState('');

    const openApprove = (id) => { setSelectedId(id); setModalMode('Approve'); setJustification(''); setModalOpen(true); };
    const openReject = (id) => { setSelectedId(id); setModalMode('Reject'); setJustification(''); setModalOpen(true); };

    const handleConfirm = async () => {
      if (!selectedId) return;
      if (modalMode === 'Approve') {
        await updateLeaveStatus(selectedId, 'Approved');
      } else {
        await updateLeaveStatus(selectedId, 'Rejected', justification || '');
      }
      try { const data = await api.get('/leaves'); setList(data); } catch (_) {}
      setModalOpen(false); setSelectedId(null); setJustification('');
    };

    const handleCancel = () => { setModalOpen(false); setSelectedId(null); setJustification(''); };

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Leave Management</h1>
        </div>
        <div className="dashboard-card" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', minHeight: '600px' }}>
          <div className="card-header"><h2>Leave Requests</h2></div>
          <div className="attendance-controls" style={{ marginBottom: 12 }}>
            <label>
              Filter
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Admin Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan="8">No leave requests.</td></tr>
              )}
              {filtered.sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||'')).map(l => (
                <tr key={l._id || l.id}>
                  <td>{l.employeeName}</td>
                  <td>{l.type}</td>
                  <td>{l.startDate}</td>
                  <td>{l.endDate}</td>
                  <td>{l.reason}</td>
                  <td>{l.status}</td>
                  <td>{l.status === 'Rejected' ? (l.adminJustification || '-') : (l.adminJustification || '-')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="action-btn-detailed" onClick={() => openApprove(l._id || l.id)} disabled={l.status === 'Approved'}>Approve</button>
                      <button className="action-btn-detailed danger" onClick={() => openReject(l._id || l.id)} disabled={l.status === 'Rejected'}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalOpen && (
            <div className="edit-modal-overlay">
              <div className="edit-modal" style={{ maxWidth: '560px', width: '100%' }}>
                <div className="edit-modal-header">
                  <h2>{modalMode === 'Approve' ? 'Approve Leave' : 'Reject Leave'}</h2>
                  <button className="close-btn" onClick={handleCancel}>✕</button>
                </div>
                <div className="profile-content">
                  {modalMode === 'Approve' ? (
                    <p style={{ color: '#374151', fontWeight: 600 }}>Are you sure you want to approve this leave request?</p>
                  ) : (
                    <div className="edit-form">
                      <div className="form-group">
                        <label>Rejection Justification</label>
                        <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows="4" style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 12, border: '2px solid #e5e7eb', resize: 'vertical', minHeight: 96 }} placeholder="Add a note explaining the rejection" />
                      </div>
                    </div>
                  )}
                  <div className="form-actions">
                    <button className="cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
                    <button className="save-btn" type="button" onClick={handleConfirm}>{modalMode === 'Approve' ? 'Approve' : 'Reject'}</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmployees = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Employee Directory</h1>
        <div className="header-actions">
          {!isEmployeeRole && (
            <button className="add-employee-btn" onClick={handleAddEmployee}>+ Add New Employee</button>
          )}
        </div>
      </div>
      <div className="employee-grid">
        {employees.map(employee => (
          <div key={employee.id} className="employee-detail-card">
            <div className="employee-header">
              <img src={employee.avatar} alt={employee.name} className="employee-avatar-large" />
              <div className="employee-basic-info">
                <h3>{employee.name}</h3>
                <p className="employee-position">{employee.position}</p>
                <span className={`status-badge ${employee.status.toLowerCase().replace(' ', '-')}`}>
                  {employee.status}
                </span>
              </div>
            </div>
            <div className="employee-details">
              <div className="detail-item">
                <span className="detail-label">Department:</span>
                <span className="detail-value">{employee.department}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{employee.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{employee.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Join Date:</span>
                <span className="detail-value">{employee.joinDate}</span>
              </div>
            </div>
            <div className="employee-actions-detailed">
              <button 
                className="action-btn-detailed"
                onClick={() => handleEditEmployee(employee)}
                disabled={isEmployeeRole && employee.email !== user?.email}
                title={isEmployeeRole && employee.email !== user?.email ? 'You can only edit your own profile' : 'Edit'}
                style={isEmployeeRole && employee.email !== user?.email ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <EditIcon size={18} color="white" />
                <span>Edit</span>
              </button>
              <button 
                className="action-btn-detailed"
                onClick={() => handleViewProfile(employee)}
              >
                <EyeIcon size={18} color="white" />
                <span>View Profile</span>
              </button>
              {!isEmployeeRole && (
                <button 
                  className="action-btn-detailed danger"
                  onClick={() => handleDeleteEmployee(employee.id)}
                >
                  <TrashIcon size={18} color="white" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Admin Profile Edit Form
  const AdminProfileEditForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    });
    const [avatarPreview, setAvatarPreview] = useState(
      user?.avatar || generateAvatarUrl(user?.name || user?.email || 'Admin')
    );
    const [imageError, setImageError] = useState('');

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const validation = validateImageFile(file);
      if (!validation.valid) {
        setImageError(validation.error);
        return;
      }

      setImageError('');
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatarPreview(dataUrl);
        setFormData(prev => ({
          ...prev,
          avatar: dataUrl
        }));
      } catch (error) {
        setImageError('Failed to process image. Please try again.');
      }
    };

    const handleGenerateAvatar = () => {
      const avatarUrl = generateAvatarUrl(formData.name || formData.email || 'Admin');
      setAvatarPreview(avatarUrl);
      setFormData(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      setImageError('');
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        await updateProfile(formData);
        await markProfileComplete();
        onSave();
        alert('Profile updated successfully!');
      } catch (error) {
        alert('Failed to update profile: ' + (error.message || 'Unknown error'));
      }
    };

    return (
      <div className="edit-modal-overlay">
        <div className="edit-modal">
          <div className="edit-modal-header">
            <h2>Edit Admin Profile</h2>
            <button className="close-btn" onClick={onCancel}>✕</button>
          </div>
          <form onSubmit={handleSubmit} className="edit-form">
            <div className="form-group">
              <label>Profile Image:</label>
              <div className="avatar-upload-section">
                <div className="avatar-preview-container">
                  <img src={avatarPreview} alt="Profile" className="avatar-preview" />
                  <div className="avatar-overlay">
                    <label htmlFor="avatar-upload-admin" className="avatar-upload-btn">
                      <EditIcon size={20} color="white" />
                      <span>Change</span>
                    </label>
                    <input
                      type="file"
                      id="avatar-upload-admin"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
                <button type="button" className="generate-avatar-btn" onClick={handleGenerateAvatar}>
                  Generate Avatar
                </button>
                {imageError && <span className="error-message">{imageError}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <input
                type="text"
                value={role || 'Admin'}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // My Profile for Admins
  const renderAdminProfile = () => {
    const avatarUrl = user?.avatar || generateAvatarUrl(user?.name || user?.email || 'Admin', 200);

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Profile</h1>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Admin Profile</h2>
          </div>
          <div className="employee-detail-card">
            <div className="employee-header">
              <img src={avatarUrl} alt={user?.name || 'Admin'} className="employee-avatar-large" />
              <div className="employee-basic-info">
                <h3>{user?.name || 'Admin User'}</h3>
                <p className="employee-position">{role || 'Admin'}</p>
                <span className="status-badge active">
                  Active
                </span>
              </div>
            </div>
            <div className="employee-details">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{user?.name || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{role || 'Admin'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">#{user?.id?.toString().slice(-6) || 'N/A'}</span>
              </div>
            </div>
            <div className="employee-actions-detailed">
              <button 
                className="action-btn-detailed"
                onClick={() => setIsEditingAdminProfile(true)}
              >
                <EditIcon size={18} color="white" />
                <span>Edit My Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // My Profile for Employees
  const renderMyProfile = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>My Profile</h1>
        {!selfEmployee && (
          <p>No profile found. Ask HR to create one, or use your role-appropriate flow.</p>
        )}
      </div>
      {selfEmployee ? (
        <div className="dashboard-card">
          <div className="card-header">
            <h2>{selfEmployee.name}</h2>
          </div>
          <div className="employee-detail-card">
            <div className="employee-header">
              <img src={selfEmployee.avatar} alt={selfEmployee.name} className="employee-avatar-large" />
              <div className="employee-basic-info">
                <h3>{selfEmployee.name}</h3>
                <p className="employee-position">{selfEmployee.position}</p>
                <span className={`status-badge ${selfEmployee.status.toLowerCase().replace(' ', '-')}`}>
                  {selfEmployee.status}
                </span>
              </div>
            </div>
            <div className="employee-details">
              <div className="detail-item"><span className="detail-label">Department:</span><span className="detail-value">{selfEmployee.department}</span></div>
              <div className="detail-item"><span className="detail-label">Email:</span><span className="detail-value">{selfEmployee.email}</span></div>
              <div className="detail-item"><span className="detail-label">Phone:</span><span className="detail-value">{selfEmployee.phone}</span></div>
              <div className="detail-item"><span className="detail-label">Join Date:</span><span className="detail-value">{selfEmployee.joinDate}</span></div>
            </div>
            <div className="employee-actions-detailed">
              <button 
                className="action-btn-detailed"
                onClick={() => handleEditEmployee(selfEmployee)}
              >
                <EditIcon size={18} color="white" />
                <span>Edit My Profile</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );

  // Admin Salary Management View
  const AdminSalaryView = ({ employees }) => {
    const [salaries, setSalaries] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [showSalaryForm, setShowSalaryForm] = useState(false);
    const [showPayrollForm, setShowPayrollForm] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filterMonth, setFilterMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());

    useEffect(() => {
      loadSalaries();
      loadPayrolls();
    }, []);

    const loadSalaries = async () => {
      try {
        const data = await api.get('/salary');
        setSalaries(data);
      } catch (e) {
        console.error('Failed to load salaries:', e);
      }
    };

    const loadPayrolls = async () => {
      try {
        const data = await api.get('/payroll');
        setPayrolls(data);
      } catch (e) {
        console.error('Failed to load payrolls:', e);
      }
    };

    const handleAddSalary = () => {
      setSelectedEmployee(null);
      setEditingSalary(null);
      setShowSalaryForm(true);
    };

    const handleEditSalary = (salary) => {
      setEditingSalary(salary);
      setShowSalaryForm(true);
    };

    const handleSaveSalary = async (formData) => {
      try {
        if (editingSalary) {
          await api.put(`/salary/${editingSalary._id}`, formData);
        } else {
          const employeeId = selectedEmployee._id || selectedEmployee.id;
          await api.post('/salary', { ...formData, employeeId });
        }
        await loadSalaries();
        setShowSalaryForm(false);
        setEditingSalary(null);
        setSelectedEmployee(null);
        alert('Salary saved successfully!');
      } catch (e) {
        alert('Failed to save salary: ' + (e.message || 'Unknown error'));
      }
    };

    const handleGeneratePayroll = async () => {
      try {
        const result = await api.post('/payroll/generate', {
          month: filterMonth,
          year: filterYear
        });
        await loadPayrolls();
        alert(`Payroll generated for ${result.generated} employees!`);
      } catch (e) {
        alert('Failed to generate payroll: ' + (e.message || 'Unknown error'));
      }
    };

    const handleUpdatePayrollStatus = async (payrollId, status, paymentData = {}) => {
      try {
        await api.put(`/payroll/${payrollId}/status`, { status, ...paymentData });
        await loadPayrolls();
        alert('Payroll status updated!');
      } catch (e) {
        alert('Failed to update status: ' + (e.message || 'Unknown error'));
      }
    };

    const SalaryForm = ({ employees: formEmployees, salaries: formSalaries }) => {
      const [form, setForm] = useState(editingSalary || {
        baseSalary: '',
        allowances: { hra: 0, travel: 0, medical: 0 },
        deductions: { pf: 0, tax: 0, insurance: 0 },
        department: selectedEmployee?.department || '',
        designation: selectedEmployee?.position || ''
      });

      useEffect(() => {
        if (editingSalary) {
          setForm(editingSalary);
        } else if (selectedEmployee) {
          setForm({
            baseSalary: '',
            allowances: { hra: 0, travel: 0, medical: 0 },
            deductions: { pf: 0, tax: 0, insurance: 0 },
            department: selectedEmployee.department || '',
            designation: selectedEmployee.position || ''
          });
        }
      }, [editingSalary, selectedEmployee]);

      const onChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('allowances.')) {
          const field = name.split('.')[1];
          setForm(prev => ({
            ...prev,
            allowances: { ...prev.allowances, [field]: parseFloat(value) || 0 }
          }));
        } else if (name.startsWith('deductions.')) {
          const field = name.split('.')[1];
          setForm(prev => ({
            ...prev,
            deductions: { ...prev.deductions, [field]: parseFloat(value) || 0 }
          }));
        } else {
          setForm(prev => ({ ...prev, [name]: value }));
        }
      };

      const onSubmit = (e) => {
        e.preventDefault();
        if (!editingSalary && !selectedEmployee) {
          alert('Please select an employee first!');
          return;
        }
        handleSaveSalary(form);
      };

      const totalAllowances = (form.allowances?.hra || 0) + (form.allowances?.travel || 0) + (form.allowances?.medical || 0);
      const totalDeductions = (form.deductions?.pf || 0) + (form.deductions?.tax || 0) + (form.deductions?.insurance || 0);
      const grossSalary = (parseFloat(form.baseSalary) || 0) + totalAllowances;
      const netSalary = grossSalary - totalDeductions;

      return (
        <div className="edit-modal-overlay" onClick={() => setShowSalaryForm(false)}>
          <div className="edit-modal" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>{editingSalary ? 'Edit Salary' : 'Add Salary Structure'}</h2>
              <button className="close-btn" onClick={() => setShowSalaryForm(false)}>✕</button>
            </div>
            <form onSubmit={onSubmit} className="edit-form">
              {!editingSalary && (
                <div className="form-group">
                  <label>Select Employee:</label>
                  <select
                    name="employeeId"
                    value={selectedEmployee?._id || selectedEmployee?.id || ''}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const employee = formEmployees.find(emp => (emp._id || emp.id) === empId);
                      setSelectedEmployee(employee || null);
                      if (employee) {
                        setForm(prev => ({
                          ...prev,
                          department: employee.department || '',
                          designation: employee.position || ''
                        }));
                      }
                    }}
                    required
                  >
                    <option value="">-- Select Employee --</option>
                    {formEmployees
                      .filter(emp => 
                        emp.status === 'Active' &&
                        !formSalaries.some(s => (s.employeeId?._id || s.employeeId?.id) === (emp._id || emp.id))
                      )
                      .map(emp => (
                        <option key={emp._id || emp.id} value={emp._id || emp.id}>
                          {emp.name} ({emp.email}) - {emp.department || 'N/A'}
                        </option>
                      ))}
                  </select>
                  {formEmployees.filter(emp => 
                    emp.status === 'Active' &&
                    !formSalaries.some(s => (s.employeeId?._id || s.employeeId?.id) === (emp._id || emp.id))
                  ).length === 0 && (
                    <p style={{ color: '#ef4444', fontSize: 14, marginTop: 8 }}>
                      All active employees already have salary structures. Please edit existing ones.
                    </p>
                  )}
                </div>
              )}
              {editingSalary && (
                <div className="form-group">
                  <label>Employee:</label>
                  <input 
                    type="text" 
                    value={editingSalary.employeeId?.name || 'N/A'} 
                    disabled 
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }} 
                  />
                </div>
              )}
              <div className="form-group">
                <label>Base Salary:</label>
                <input type="number" name="baseSalary" value={form.baseSalary} onChange={onChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label style={{ marginBottom: '16px', display: 'block', fontWeight: 700, color: '#1F2937', fontSize: '16px' }}>Allowances:</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '20px', 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(96, 165, 250, 0.05) 100%)', 
                  borderRadius: '16px', 
                  border: '2px solid rgba(59, 130, 246, 0.15)',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>HRA<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>(House Rent Allowance)</span></label>
                    <input 
                      type="number" 
                      name="allowances.hra" 
                      placeholder="0.00" 
                      value={form.allowances?.hra || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>Travel<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>Allowance</span></label>
                    <input 
                      type="number" 
                      name="allowances.travel" 
                      placeholder="0.00" 
                      value={form.allowances?.travel || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>Medical<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>Allowance</span></label>
                    <input 
                      type="number" 
                      name="allowances.medical" 
                      placeholder="0.00" 
                      value={form.allowances?.medical || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px',
                  textAlign: 'right', 
                  fontSize: '14px', 
                  color: '#1F2937', 
                  fontWeight: 600 
                }}>
                  Total Allowances: <span style={{ color: '#3B82F6', fontSize: '16px' }}>₹{totalAllowances.toFixed(2)}</span>
                </div>
              </div>
              <div className="form-group">
                <label style={{ marginBottom: '16px', display: 'block', fontWeight: 700, color: '#1F2937', fontSize: '16px' }}>Deductions:</label>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '20px', 
                  padding: '20px', 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(248, 113, 113, 0.05) 100%)', 
                  borderRadius: '16px', 
                  border: '2px solid rgba(239, 68, 68, 0.15)',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>PF<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>(Provident Fund)</span></label>
                    <input 
                      type="number" 
                      name="deductions.pf" 
                      placeholder="0.00" 
                      value={form.deductions?.pf || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>Tax<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>Deduction</span></label>
                    <input 
                      type="number" 
                      name="deductions.tax" 
                      placeholder="0.00" 
                      value={form.deductions?.tax || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px', lineHeight: '1.4' }}>Insurance<br/><span style={{ fontSize: '11px', fontWeight: 400, color: '#6B7280' }}>Premium</span></label>
                    <input 
                      type="number" 
                      name="deductions.insurance" 
                      placeholder="0.00" 
                      value={form.deductions?.insurance || 0} 
                      onChange={onChange} 
                      min="0" 
                      step="0.01"
                      style={{ 
                        width: '100%', 
                        padding: '12px 14px', 
                        borderRadius: '10px', 
                        border: '2px solid #e5e7eb', 
                        fontSize: '15px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#EF4444'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
                <div style={{ 
                  marginTop: '12px', 
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  textAlign: 'right', 
                  fontSize: '14px', 
                  color: '#1F2937', 
                  fontWeight: 600 
                }}>
                  Total Deductions: <span style={{ color: '#EF4444', fontSize: '16px' }}>₹{totalDeductions.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong>Gross Salary:</strong>
                  <strong>₹{grossSalary.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Net Salary:</strong>
                  <strong>₹{netSalary.toFixed(2)}</strong>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowSalaryForm(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      );
    };

    const filteredPayrolls = payrolls.filter(p => 
      p.month === filterMonth && p.year === filterYear
    );

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Salary Management</h1>
        </div>

        {/* Salary Structures */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Salary Structures</h2>
            <button className="view-all-btn" onClick={() => setShowSalaryForm(true)}>+ Add Salary</button>
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Base Salary</th>
                <th>Gross Salary</th>
                <th>Net Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 && (
                <tr><td colSpan="5">No salary structures found. Add salary for employees.</td></tr>
              )}
              {salaries.map(salary => (
                <tr key={salary._id}>
                  <td>{salary.employeeId?.name || 'N/A'}</td>
                  <td>₹{salary.baseSalary?.toFixed(2) || '0.00'}</td>
                  <td>₹{salary.grossSalary?.toFixed(2) || '0.00'}</td>
                  <td>₹{salary.netSalary?.toFixed(2) || '0.00'}</td>
                  <td>
                    <button className="action-btn-detailed" onClick={() => handleEditSalary(salary)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payroll Management */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Monthly Payroll</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input type="number" value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))} style={{ padding: 8, borderRadius: 8, width: 100 }} />
              <button className="save-btn" onClick={handleGeneratePayroll}>Generate Payroll</button>
            </div>
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Net Salary</th>
                <th>Bonus</th>
                <th>Total Payable</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayrolls.length === 0 && (
                <tr><td colSpan="6">No payroll records for {filterMonth} {filterYear}. Click "Generate Payroll" to create.</td></tr>
              )}
              {filteredPayrolls.map(payroll => (
                <tr key={payroll._id}>
                  <td>{payroll.employeeId?.name || 'N/A'}</td>
                  <td>₹{payroll.netSalary?.toFixed(2) || '0.00'}</td>
                  <td>₹{payroll.bonus?.toFixed(2) || '0.00'}</td>
                  <td>₹{payroll.totalPayable?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge ${payroll.status === 'Paid' ? 'active' : payroll.status === 'Approved' ? 'on-leave' : ''}`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {payroll.status === 'Pending' && (
                        <button className="action-btn-detailed" onClick={() => handleUpdatePayrollStatus(payroll._id, 'Approved')}>Approve</button>
                      )}
                      {payroll.status === 'Approved' && (
                        <button className="action-btn-detailed" onClick={() => {
                          const mode = prompt('Payment Mode (Bank Transfer/Cash/UPI):', 'Bank Transfer');
                          const txnId = prompt('Transaction ID (optional):', '');
                          if (mode) {
                            handleUpdatePayrollStatus(payroll._id, 'Paid', { paymentMode: mode, transactionId: txnId });
                          }
                        }}>Mark as Paid</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showSalaryForm && <SalaryForm employees={employees} salaries={salaries} />}
      </div>
    );
  };

  // Employee Salary View
  const EmployeeSalaryView = () => {
    const { user } = useContext(AuthContext);
    const [salary, setSalary] = useState(null);
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadSalaryData();
    }, [user]);

    const loadSalaryData = async () => {
      try {
        // Find employee by email
        const employee = employees.find(emp => emp.email === user?.email);
        if (employee) {
          const employeeId = employee._id || employee.id;
          if (employeeId) {
            try {
              const salaryData = await api.get(`/salary/employee/${employeeId}`);
              setSalary(salaryData);
            } catch (e) {
              // Salary structure might not exist
              console.log('No salary structure found');
            }

            try {
              const payrollData = await api.get(`/payroll/employee/${employeeId}`);
              setPayrolls(payrollData);
            } catch (e) {
              console.error('Failed to load payrolls:', e);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load salary data:', e);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>My Salary</h1>
          </div>
          <p>Loading...</p>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>My Salary</h1>
        </div>

        {/* Salary Structure */}
        {salary ? (
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Salary Structure</h2>
            </div>
            <div className="employee-details">
              <div className="detail-item">
                <span className="detail-label">Base Salary:</span>
                <span className="detail-value">₹{salary.baseSalary?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">HRA:</span>
                <span className="detail-value">₹{salary.allowances?.hra?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Travel Allowance:</span>
                <span className="detail-value">₹{salary.allowances?.travel?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Medical Allowance:</span>
                <span className="detail-value">₹{salary.allowances?.medical?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">PF Deduction:</span>
                <span className="detail-value">₹{salary.deductions?.pf?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tax:</span>
                <span className="detail-value">₹{salary.deductions?.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Insurance:</span>
                <span className="detail-value">₹{salary.deductions?.insurance?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="detail-item" style={{ borderTop: '2px solid #667eea', paddingTop: 16, marginTop: 8 }}>
                <span className="detail-label" style={{ fontSize: 18, fontWeight: 700 }}>Gross Salary:</span>
                <span className="detail-value" style={{ fontSize: 18, fontWeight: 700, color: '#667eea' }}>
                  ₹{salary.grossSalary?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ fontSize: 18, fontWeight: 700 }}>Net Salary:</span>
                <span className="detail-value" style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                  ₹{salary.netSalary?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-card">
            <p>No salary structure found. Please contact HR to set up your salary.</p>
          </div>
        )}

        {/* Payroll History */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Payroll History</h2>
          </div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Net Salary</th>
                <th>Bonus</th>
                <th>Total Payable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 && (
                <tr><td colSpan="6">No payroll records found.</td></tr>
              )}
              {payrolls.map(payroll => (
                <tr key={payroll._id}>
                  <td>{payroll.month}</td>
                  <td>{payroll.year}</td>
                  <td>₹{payroll.netSalary?.toFixed(2) || '0.00'}</td>
                  <td>₹{payroll.bonus?.toFixed(2) || '0.00'}</td>
                  <td>₹{payroll.totalPayable?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge ${payroll.status === 'Paid' ? 'active' : payroll.status === 'Approved' ? 'on-leave' : ''}`}>
                      {payroll.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Attendance tab
  const renderAttendance = () => {
    if (isEmployeeRole) {
      const myEmail = user?.email;
      const myRecords = getEmployeeAttendance(myEmail);
      const totals = countAttendance(myRecords);
      const todayRec = normalizeRecord(myRecords[todayStr]) || { status: 'Unmarked', clockIn: null, clockOut: null };
      const todayStatus = todayRec.status || 'Unmarked';

      const handleMark = (status) => {
        // Marking Absent clears timestamps
        const payload = status === 'Absent' ? { status, clockIn: null, clockOut: null } : { status };
        setEmployeeAttendance(myEmail, todayStr, payload);
        setRecentActivities(prev => [
          { id: Date.now(), action: `Attendance marked ${status.toLowerCase()}`, user: selfEmployee?.name || myEmail, time: 'Just now', timestamp: Date.now() },
          ...prev
        ].slice(0, 10));
      };

      const handleClockIn = () => {
        if (todayRec.clockIn) return; // already clocked in
        const nowIso = new Date().toISOString();
        setEmployeeAttendance(myEmail, todayStr, { status: 'Present', clockIn: nowIso });
        setRecentActivities(prev => [
          { id: Date.now(), action: 'Clocked in', user: selfEmployee?.name || myEmail, time: 'Just now', timestamp: Date.now() },
          ...prev
        ].slice(0, 10));
      };

      const handleClockOut = () => {
        if (!todayRec.clockIn || todayRec.clockOut) return; // must clock in first and not already out
        const nowIso = new Date().toISOString();
        setEmployeeAttendance(myEmail, todayStr, { clockOut: nowIso });
        setRecentActivities(prev => [
          { id: Date.now(), action: 'Clocked out', user: selfEmployee?.name || myEmail, time: 'Just now', timestamp: Date.now() },
          ...prev
        ].slice(0, 10));
      };
      return (
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Attendance</h1>
          </div>
          <div className="stats-grid" style={{ marginTop: 0 }}>
            <div className="stat-card" style={{ '--stat-color': '#10b981', borderLeftColor: '#10b981' }}>
              <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
                <CheckIcon size={28} color="white" />
              </div>
              <div className="stat-content">
                <h3>{totals.monthPresent}</h3>
                <p>Present (This Month)</p>
              </div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#ef4444', borderLeftColor: '#ef4444' }}>
              <div className="stat-icon" style={{ backgroundColor: '#ef4444' }}>
                <XIcon size={28} color="white" />
              </div>
              <div className="stat-content">
                <h3>{totals.monthAbsent}</h3>
                <p>Absent (This Month)</p>
              </div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#3B82F6', borderLeftColor: '#3B82F6' }}>
              <div className="stat-icon" style={{ backgroundColor: '#3B82F6' }}>
                <CalendarIcon size={28} color="white" />
              </div>
              <div className="stat-content">
                <h3>{totals.totalPresent}</h3>
                <p>Total Present</p>
              </div>
            </div>
            <div className="stat-card" style={{ '--stat-color': '#F59E0B', borderLeftColor: '#F59E0B' }}>
              <div className="stat-icon" style={{ backgroundColor: '#F59E0B' }}>
                <ClockIcon size={28} color="white" />
              </div>
              <div className="stat-content">
                <h3>{totals.totalAbsent}</h3>
                <p>Total Absent</p>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-header"><h2>Today: {todayStr}</h2></div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="quick-action-btn" onClick={() => handleMark('Present')} disabled={todayStatus === 'Present'}>
                <CircleCheckIcon size={20} color="#10B981" />
                <span>Mark Present</span>
              </button>
              <button className="quick-action-btn" onClick={() => handleMark('Absent')} disabled={todayStatus === 'Absent'}>
                <CircleXIcon size={20} color="#EF4444" />
                <span>Mark Absent</span>
              </button>
              <button className="quick-action-btn" onClick={handleClockIn} disabled={!!todayRec.clockIn || todayStatus === 'Absent'}>
                <ClockInIcon size={20} color="#10B981" />
                <span>Clock In</span>
              </button>
              <button className="quick-action-btn" onClick={handleClockOut} disabled={!todayRec.clockIn || !!todayRec.clockOut || todayStatus === 'Absent'}>
                <ClockOutIcon size={20} color="#EF4444" />
                <span>Clock Out</span>
              </button>
              <div style={{ marginLeft: 'auto' }}>
                Status: <strong>{todayStatus}</strong>{' '}
                | In: <strong>{formatTime(todayRec.clockIn)}</strong>{' '}
                | Out: <strong>{formatTime(todayRec.clockOut)}</strong>{' '}
                | Hours: <strong>{diffHours(todayRec.clockIn, todayRec.clockOut)}</strong>
              </div>
            </div>
          </div>
          <div className="dashboard-card">
            <div className="card-header"><h2>History</h2></div>
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(myRecords).sort((a, b) => b.localeCompare(a)).map(date => {
                  const r = normalizeRecord(myRecords[date]) || {};
                  return (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{r.status || '-'}</td>
                      <td>{formatTime(r.clockIn)}</td>
                      <td>{formatTime(r.clockOut)}</td>
                      <td>{diffHours(r.clockIn, r.clockOut)}</td>
                    </tr>
                  );
                })}
                {Object.keys(myRecords).length === 0 && (
                  <tr><td colSpan="5">No attendance records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Admin view
    return (
      <AdminAttendanceManager
        employees={employees}
        attendance={attendance}
        onSetAttendance={setEmployeeAttendance}
        onActivity={setRecentActivities}
        todayStr={todayStr}
        setAttendance={setAttendance}
      />
    );
  };

  const AdminAttendanceManager = ({ employees, attendance, onSetAttendance, onActivity, todayStr, setAttendance: setAttendanceState }) => {
    const [email, setEmail] = useState('');
    const [dateStr, setDateStr] = useState(todayStr);
    const [status, setStatus] = useState('Present');
    const [loading, setLoading] = useState(false);
    const hasInitialized = React.useRef(false);
    // Get records for the selected employee - ensure email matches exactly
    const records = email ? (attendance[email] || {}) : {};
    const totals = countAttendance(records);

    // Set initial email when employees load (only once)
    useEffect(() => {
      if (employees.length > 0 && !email && !hasInitialized.current) {
        setEmail(employees[0].email);
        hasInitialized.current = true;
      }
    }, [employees.length, email]);

    // Function to reload attendance from API
    const loadAttendance = useCallback(async () => {
      setLoading(true);
      try {
        const data = await api.get('/attendance');
        // Update the parent attendance state
        if (setAttendanceState) {
          setAttendanceState(data);
        }
      } catch (e) {
        console.error('Failed to reload attendance:', e);
        alert('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    }, [setAttendanceState]);

    const handleSave = async () => {
      if (!email || !dateStr) return;
      setLoading(true);
      try {
        // Get current record to preserve clockIn/clockOut
        const currentRecord = normalizeRecord(records[dateStr]) || {};
        // Only update status, preserve clockIn/clockOut
        await onSetAttendance(email, dateStr, {
          status: status,
          clockIn: currentRecord.clockIn || null,
          clockOut: currentRecord.clockOut || null
        });
        // Reload to get updated data
        await loadAttendance();
        onActivity(prev => [
          { id: Date.now(), action: `Attendance updated (${status.toLowerCase()})`, user: employees.find(e => e.email === email)?.name || email, time: 'Just now', timestamp: Date.now() },
          ...prev
        ].slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Attendance Management</h1>
        </div>
        <div className="stats-grid" style={{ marginTop: 0 }}>
          <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <CheckIcon size={28} color="white" />
            </div>
            <div className="stat-content">
              <h3>{totals.monthPresent}</h3>
              <p>Present (This Month)</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
            <div className="stat-icon" style={{ backgroundColor: '#ef4444' }}>
              <XIcon size={28} color="white" />
            </div>
            <div className="stat-content">
              <h3>{totals.monthAbsent}</h3>
              <p>Absent (This Month)</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <CalendarIcon size={28} color="white" />
            </div>
            <div className="stat-content">
              <h3>{totals.totalPresent}</h3>
              <p>Total Present</p>
            </div>
          </div>
          <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              <ClockIcon size={28} color="white" />
            </div>
            <div className="stat-content">
              <h3>{totals.totalAbsent}</h3>
              <p>Total Absent</p>
            </div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Edit Attendance</h2>
            <button className="view-all-btn" onClick={loadAttendance} disabled={loading}>
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
          </div>
          <div className="attendance-controls">
            <label>
              Employee
              <select 
                value={email} 
                onChange={(e) => {
                  const newEmail = e.target.value;
                  setEmail(newEmail);
                }}
                style={{ cursor: 'pointer' }}
              >
                {employees.length === 0 && (
                  <option value="">Loading employees...</option>
                )}
                {employees.length > 0 && !email && (
                  <option value="">-- Select Employee --</option>
                )}
                {employees.map(emp => (
                  <option key={emp.email || emp._id} value={emp.email}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
            </label>
            <label>
              Status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </label>
            <button className="save-btn" onClick={handleSave}>Save</button>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header"><h2>Records</h2></div>
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(records).sort((a, b) => b.localeCompare(a)).map(date => {
                const r = normalizeRecord(records[date]) || {};
                // Ensure we have valid data - if clockIn exists, status should be Present
                const displayStatus = r.status && r.status !== 'Unmarked' ? r.status : (r.clockIn ? 'Present' : 'Unmarked');
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{displayStatus}</td>
                    <td>{formatTime(r.clockIn)}</td>
                    <td>{formatTime(r.clockOut)}</td>
                    <td>{diffHours(r.clockIn, r.clockOut)}</td>
                  </tr>
                );
              })}
              {Object.keys(records).length === 0 && email && (
                <tr><td colSpan="5">No records for selected employee.</td></tr>
              )}
              {!email && (
                <tr><td colSpan="5">Please select an employee to view attendance records.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>EMS Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <DashboardIcon size={20} color={activeTab === 'dashboard' ? 'white' : '#1F2937'} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <EmployeesIcon size={20} color={activeTab === 'employees' ? 'white' : '#1F2937'} />
            <span>Employees</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'myProfile' ? 'active' : ''}`}
            onClick={() => setActiveTab('myProfile')}
          >
            <ProfileIcon size={20} color={activeTab === 'myProfile' ? 'white' : '#1F2937'} />
            <span>My Profile</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <AttendanceIcon size={20} color={activeTab === 'attendance' ? 'white' : '#1F2937'} />
            <span>Attendance</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <LeaveIcon size={20} color={activeTab === 'leaves' ? 'white' : '#1F2937'} />
            <span>Leave Management</span>
          </button>
          {isEmployeeRole && (
            <button 
              className={`nav-item ${activeTab === 'meetings' ? 'active' : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              <MeetingIcon size={20} color={activeTab === 'meetings' ? 'white' : '#1F2937'} />
              <span>Meetings</span>
            </button>
          )}
          <button 
            className={`nav-item ${location.pathname.includes('/reports') ? 'active' : ''}`}
            onClick={() => {
              if (location.pathname.includes('/reports')) {
                // Already on reports, do nothing
                return;
              }
              navigate(isEmployeeRole ? '/employee/reports' : '/admin/reports');
            }}
          >
            <ReportsIcon size={20} color={location.pathname.includes('/reports') ? 'white' : '#1F2937'} />
            <span>{isEmployeeRole ? 'My Reports' : 'Reports'}</span>
          </button>
          {!isEmployeeRole && (
            <button 
              className={`nav-item ${activeTab === 'salary' ? 'active' : ''}`}
              onClick={() => setActiveTab('salary')}
            >
              <SalaryIcon size={20} color={activeTab === 'salary' ? 'white' : '#1F2937'} />
              <span>Salary Management</span>
            </button>
          )}
          {isEmployeeRole && (
            <button 
              className={`nav-item ${activeTab === 'mySalary' ? 'active' : ''}`}
              onClick={() => setActiveTab('mySalary')}
            >
              <SalaryIcon size={20} color={activeTab === 'mySalary' ? 'white' : '#1F2937'} />
              <span>My Salary</span>
            </button>
          )}
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <SettingsIcon size={20} color={activeTab === 'settings' ? 'white' : '#1F2937'} />
            <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={onLogout}>
            <LogoutIcon size={18} color="white" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'myProfile' && (isEmployeeRole ? renderMyProfile() : renderAdminProfile())}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'leaves' && (isEmployeeRole ? <EmployeeLeavesView /> : <AdminLeavesView />)}
        {activeTab === 'meetings' && (isEmployeeRole ? <EmployeeMeetingsView /> : <AdminMeetingsView />)}
        {activeTab === 'salary' && !isEmployeeRole && <AdminSalaryView employees={employees} />}
        {activeTab === 'mySalary' && isEmployeeRole && <EmployeeSalaryView />}
        {activeTab === 'settings' && <SettingsView />}
      </div>

      {/* Modals */}
      {isEditing && selectedEmployee && (
        <EditEmployeeForm
          employee={selectedEmployee}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}

      {showProfile && selectedEmployee && (
        <EmployeeProfile
          employee={selectedEmployee}
          onClose={handleCloseProfile}
        />
      )}

      {showAddForm && (
        <AddEmployeeForm
          onSave={handleSaveNewEmployee}
          onCancel={handleCancelAdd}
        />
      )}

      {/* Admin Profile Edit Form */}
      {isEditingAdminProfile && (
        <AdminProfileEditForm
          onSave={() => setIsEditingAdminProfile(false)}
          onCancel={() => setIsEditingAdminProfile(false)}
        />
      )}

      {/* Profile Setup Modal */}
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          // Store flag in localStorage to remind later
          localStorage.setItem('profileSetupReminder', 'true');
        }}
        onCreateNow={() => {
          setShowProfileModal(false);
          setActiveTab('myProfile');
          if (isEmployeeRole) {
            if (selfEmployee) {
              setSelectedEmployee(selfEmployee);
              setIsEditing(true);
            }
          } else {
            // For admins, open edit form
            setIsEditingAdminProfile(true);
          }
          // Mark profile as complete when user clicks "Create Now"
          markProfileComplete();
        }}
        role={role}
        userName={selfEmployee?.name || user?.name || user?.email || 'User'}
      />
    </div>
  );
};

export default Dashboard; 