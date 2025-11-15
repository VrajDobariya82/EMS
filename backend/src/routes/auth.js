import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role || 'Employee';
    const user = await User.create({ 
      name, 
      email, 
      passwordHash, 
      role: userRole,
      profilePending: true 
    });
    
    // Automatically create employee profile for employees
    if (userRole === 'Employee') {
      try {
        const initials = (name || email.split('@')[0])
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();
        
        await Employee.create({
          userId: user._id,
          name: name || email.split('@')[0],
          email: email,
          position: '',
          department: '',
          phone: '',
          avatar: `https://via.placeholder.com/50/667eea/ffffff?text=${initials}`,
          status: 'Active',
          joinDate: new Date().toISOString().split('T')[0]
        });
      } catch (empError) {
        // If employee profile creation fails (e.g., duplicate email), log but don't fail signup
        console.error('Failed to create employee profile:', empError.message);
      }
    }
    
    return res.status(201).json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      profilePending: user.profilePending 
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    return res.json({ 
      token, 
      user: { 
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePending: user.profilePending || false,
      avatar: user.avatar || ''
      } 
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Mark profile as complete
router.post('/profile-complete', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const user = await User.findByIdAndUpdate(userId, { profilePending: false }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ success: true, profilePending: user.profilePending });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Update user profile (name, email, avatar)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;
    
    // Check if email is already in use by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    return res.json({ 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      avatar: user.avatar 
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;


