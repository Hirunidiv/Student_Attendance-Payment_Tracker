import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
export const markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    // Normalize date to start of day
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if attendance already marked for this date
    const existingAttendance = await Attendance.findOne({
      studentId,
      date: attendanceDate
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      await existingAttendance.save();
      return res.status(200).json(existingAttendance);
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      studentId,
      date: attendanceDate,
      status
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get attendance for a student
// @route   GET /api/attendance/:studentId
// @access  Private
export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404);
      throw new Error('Student not found');
    }

    let query = { studentId };

    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email')
      .sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'Present').length;
    const absentDays = totalDays - presentDays;
    const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.status(200).json({
      attendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        percentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private
export const getAllAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    let query = {};

    // Filter by specific date if provided
    if (date) {
      const searchDate = new Date(date);
      searchDate.setHours(0, 0, 0, 0);
      query.date = searchDate;
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name email phone')
      .sort({ date: -1 });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's attendance summary
// @route   GET /api/attendance/today/summary
// @access  Private
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({ date: today })
      .populate('studentId', 'name email');

    const totalStudents = await Student.countDocuments();
    const presentToday = attendance.filter(a => a.status === 'Present').length;
    const absentToday = attendance.filter(a => a.status === 'Absent').length;
    const notMarked = totalStudents - attendance.length;

    res.status(200).json({
      date: today,
      totalStudents,
      presentToday,
      absentToday,
      notMarked,
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};