import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  paidDate: {
    type: Date,
    required: [true, 'Paid date is required'],
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ studentId: 1, month: 1 });

export default mongoose.model('Payment', paymentSchema);