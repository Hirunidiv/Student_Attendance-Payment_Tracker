import express from 'express';
import {
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
  getTodayAttendance
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, markAttendance)
  .get(protect, getAllAttendance);

router.get('/today/summary', protect, getTodayAttendance);

router.get('/:studentId', protect, getStudentAttendance);

export default router;