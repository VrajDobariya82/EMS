import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Employee', 
    required: true 
  },
  month: { 
    type: String, 
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: { 
    type: Number, 
    required: true,
    min: 2020,
    max: 2100
  },
  baseSalary: { 
    type: Number, 
    required: true,
    min: 0
  },
  grossSalary: { 
    type: Number, 
    required: true,
    min: 0
  },
  netSalary: { 
    type: Number, 
    required: true,
    min: 0
  },
  bonus: { 
    type: Number, 
    default: 0,
    min: 0
  },
  overtimeHours: { 
    type: Number, 
    default: 0,
    min: 0
  },
  overtimePay: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPayable: {
    type: Number,
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Paid'], 
    default: 'Pending' 
  },
  paymentMode: { 
    type: String,
    enum: ['Bank Transfer', 'Cash', 'UPI', 'Cheque']
  },
  paymentDate: { 
    type: Date 
  },
  transactionId: { 
    type: String 
  },
  remarks: { 
    type: String 
  }
}, { timestamps: true });

// Pre-save hook to calculate total payable
payrollSchema.pre('save', function(next) {
  // Calculate overtime pay (assuming 1.5x hourly rate)
  const hourlyRate = this.baseSalary / (22 * 8); // Assuming 22 working days, 8 hours per day
  this.overtimePay = (this.overtimeHours || 0) * hourlyRate * 1.5;
  
  // Calculate total payable
  this.totalPayable = (this.netSalary || 0) + (this.bonus || 0) + this.overtimePay;
  
  next();
});

// Compound index to prevent duplicate payroll for same employee, month, year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);

