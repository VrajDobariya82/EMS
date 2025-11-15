import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true,
    unique: true 
  },
  baseSalary: { 
    type: Number, 
    required: true,
    min: 0
  },
  allowances: {
    hra: { type: Number, default: 0, min: 0 },
    travel: { type: Number, default: 0, min: 0 },
    medical: { type: Number, default: 0, min: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    insurance: { type: Number, default: 0, min: 0 }
  },
  grossSalary: { 
    type: Number,
    default: 0
  },
  netSalary: { 
    type: Number,
    default: 0
  },
  department: { type: String },
  designation: { type: String }
}, { timestamps: true });

// Pre-save hook to calculate gross and net salary
salarySchema.pre('save', function(next) {
  // Calculate total allowances
  const totalAllowances = (this.allowances.hra || 0) + 
                         (this.allowances.travel || 0) + 
                         (this.allowances.medical || 0);
  
  // Calculate gross salary
  this.grossSalary = (this.baseSalary || 0) + totalAllowances;
  
  // Calculate total deductions
  const totalDeductions = (this.deductions.pf || 0) + 
                          (this.deductions.tax || 0) + 
                          (this.deductions.insurance || 0);
  
  // Calculate net salary
  this.netSalary = this.grossSalary - totalDeductions;
  
  next();
});

export default mongoose.model('Salary', salarySchema);

