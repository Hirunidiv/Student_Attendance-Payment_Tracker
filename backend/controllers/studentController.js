import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single student with details
// @route   GET /api/students/:id
// @access  Private
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Get attendance summary
    const totalAttendance = await Attendance.countDocuments({ studentId: req.params.id });
    const presentCount = await Attendance.countDocuments({ 
      studentId: req.params.id, 
      status: 'Present' 
    });
    const attendancePercentage = totalAttendance > 0 
      ? ((presentCount / totalAttendance) * 100).toFixed(2) 
      : 0;

    // Get payment summary
    const payments = await Payment.find({ studentId: req.params.id }).sort({ paidDate: -1 });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      student,
      attendance: {
        total: totalAttendance,
        present: presentCount,
        absent: totalAttendance - presentCount,
        percentage: attendancePercentage
      },
      payments: {
        records: payments,
        totalPaid
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res) => {
  try {
    const { name, email, phone, address, joinedDate } = req.body;

    // Check if student already exists
    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      res.status(400);
      throw new Error('Student with this email already exists');
    }

    const student = await Student.create({
      name,
      email,
      phone,
      address,
      joinedDate
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Delete related attendance and payment records
    await Attendance.deleteMany({ studentId: req.params.id });
    await Payment.deleteMany({ studentId: req.params.id });
    
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Student and related records deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};