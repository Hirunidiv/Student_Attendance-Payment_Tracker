import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { Plus, DollarSign, Calendar } from 'lucide-react';

const Payments = () => {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);

  const [formData, setFormData] = useState({
    studentId: '',
    month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/students');
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchPayments = async () => {
    try {
      const { data } = await axios.get('/payments');
      setPayments(data.payments);
      setTotalIncome(data.totalIncome);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/payments', {
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success('Payment recorded successfully');
      resetForm();
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      amount: '',
      paidDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-600">Track student payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Record Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Total Payments</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <DollarSign className="text-purple-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Average Payment</p>
              <p className="text-2xl font-bold">
                ${payments.length > 0 ? (totalIncome / payments.length).toFixed(2) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-x-auto">
        <h3 className="text-xl font-bold mb-4">Payment History</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Month</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date Paid</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{payment.studentId?.name}</p>
                      <p className="text-sm text-gray-600">{payment.studentId?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">{payment.month}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-green-600">${payment.amount}</span>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(payment.paidDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No payments recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Student</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Month</label>
                <input
                  type="text"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="input-field"
                  placeholder="e.g., January 2024"
                  required
                />
              </div>
              <div>
                <label className="label">Amount (Rs)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Payment Date</label>
                <input
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;