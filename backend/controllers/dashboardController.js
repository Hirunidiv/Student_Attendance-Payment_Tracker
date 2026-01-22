import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Payment from '../models/Payment.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    // Total students
    const totalStudents = await Student.countDocuments();

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter(a => a.status === 'Present').length;
    const absentToday = todayAttendance.filter(a => a.status === 'Absent').length;

    // Monthly income
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyPayments = await Payment.find({
      paidDate: { $gte: monthStart, $lte: monthEnd }
    });

    const monthlyIncome = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Recent payments
    const recentPayments = await Payment.find()
      .populate('studentId', 'name email')
      .sort({ paidDate: -1 })
      .limit(5);

    // Attendance chart data (last 7 days)
    const attendanceChartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayAttendance = await Attendance.find({ date });
      const present = dayAttendance.filter(a => a.status === 'Present').length;
      const absent = dayAttendance.filter(a => a.status === 'Absent').length;

      attendanceChartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present,
        absent
      });
    }

    res.status(200).json({
      totalStudents,
      presentToday,
      absentToday,
      monthlyIncome,
      recentPayments,
      attendanceChartData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};