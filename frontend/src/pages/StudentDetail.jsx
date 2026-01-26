import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/students');
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`/students/${currentStudent._id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await axios.post('/students', formData);
        toast.success('Student added successfully');
      }
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      address: student.address,
      joinedDate: new Date(student.joinedDate).toISOString().split('T')[0],
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      joinedDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setEditMode(false);
    setCurrentStudent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage student information</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm sm:text-base">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm sm:text-base hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm sm:text-base hidden lg:table-cell">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm sm:text-base hidden xl:table-cell">Joined Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm sm:text-base">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm sm:text-base">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-600 md:hidden">{student.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base hidden md:table-cell">{student.email}</td>
                    <td className="py-3 px-4 text-sm sm:text-base hidden lg:table-cell">{student.phone}</td>
                    <td className="py-3 px-4 text-sm sm:text-base hidden xl:table-cell">
                      {new Date(student.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => navigate(`/students/${student._id}`)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="View Details"
                        >
                          <Eye size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 text-sm sm:text-base">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              {editMode ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="label">Joined Date</label>
                <input
                  type="date"
                  value={formData.joinedDate}
                  onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editMode ? 'Update' : 'Add'} Student
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

export default Students;