import express from 'express';
import {
  recordPayment,
  getStudentPayments,
  getAllPayments,
  getMonthlyIncome,
  updatePayment,
  deletePayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, recordPayment)
  .get(protect, getAllPayments);

router.get('/summary/monthly', protect, getMonthlyIncome);

router.route('/:id')
  .put(protect, updatePayment)
  .delete(protect, deletePayment);

router.get('/student/:studentId', protect, getStudentPayments);

export default router;