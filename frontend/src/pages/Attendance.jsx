import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { Calendar, UserCheck, UserX } from 'lucide-react';

const Attendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/students');
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data } = await axios.get(`/attendance?date=${selectedDate}`);
      setAttendance(data);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      await axios.post('/attendance', {
        studentId,
        date: selectedDate,
        status,
      });
      toast.success(`Marked ${status}`);
      fetchAttendance();
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const getAttendanceStatus = (studentId) => {
    const record = attendance.find((a) => a.studentId._id === studentId);
    return record?.status || null;
  };

  const stats = {
    total: students.length,
    present: attendance.filter((a) => a.status === 'Present').length,
    absent: attendance.filter((a) => a.status === 'Absent').length,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-600">Mark daily attendance for students</p>
      </div>

      {/* Date Selector & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="card lg:col-span-1 bg-blue-100">
          <label className="label">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="card">
          <div className="flex items-center gap-3 bg-blue-100">
            <Calendar className="text-blue-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 bg-blue-100">
            <UserCheck className="text-green-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 bg-blue-100">
            <UserX className="text-red-600" size={32} />
            <div>
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Mark Attendance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const status = getAttendanceStatus(student._id);
                return (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{student.name}</td>
                    <td className="py-3 px-4">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      {status ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status === 'Present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {status}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Marked</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => markAttendance(student._id, 'Present')}
                          className={`px-4 py-2 rounded ${
                            status === 'Present'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(student._id, 'Absent')}
                          className={`px-4 py-2 rounded ${
                            status === 'Absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;