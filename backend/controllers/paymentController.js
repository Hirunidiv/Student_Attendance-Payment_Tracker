import Payment from '../models/Payment.js';
import Student from '../models/Student.js';

// @desc    Record a payment
// @route   POST /api/payments
// @access  Private
export const recordPayment = async (req, res) => {
  try {
    const { studentId, month, amount, paidDate } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const payment = await Payment.create({
      studentId,
      month,
      amount,
      paidDate
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('studentId', 'name email');

    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get payments for a student
// @route   GET /api/payments/:studentId
// @access  Private
export const getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const payments = await Payment.find({ studentId })
      .populate('studentId', 'name email')
      .sort({ paidDate: -1 });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      payments,
      totalPaid,
      paymentCount: payments.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
export const getAllPayments = async (req, res) => {
  try {
    const { month, year } = req.query;

    let query = {};

    // Filter by month if provided
    if (month) {
      query.month = month;
    }

    const payments = await Payment.find(query)
      .populate('studentId', 'name email phone')
      .sort({ paidDate: -1 });

    const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      payments,
      totalIncome,
      paymentCount: payments.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly income summary
// @route   GET /api/payments/summary/monthly
// @access  Private
export const getMonthlyIncome = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const monthlyPayments = await Payment.find({
      paidDate: {
        $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        $lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      }
    }).populate('studentId', 'name');

    const totalIncome = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      month: currentMonth,
      totalIncome,
      paymentCount: monthlyPayments.length,
      payments: monthlyPayments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private
export const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('studentId', 'name email');

    res.status(200).json(updatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      res.status(404);
      throw new Error('Payment not found');
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};