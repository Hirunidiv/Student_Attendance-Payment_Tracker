import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { Users, UserCheck, UserX, DollarSign, TrendingUp } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await axios.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Present Today',
      value: stats?.presentToday || 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Absent Today',
      value: stats?.absentToday || 0,
      icon: UserX,
      color: 'bg-red-500',
    },
    {
      title: 'Monthly Income',
      value: `$${stats?.monthlyIncome || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
  ];

  const chartData = {
    labels: stats?.attendanceChartData?.map((d) => d.date) || [],
    datasets: [
      {
        label: 'Present',
        data: stats?.attendanceChartData?.map((d) => d.present) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
      },
      {
        label: 'Absent',
        data: stats?.attendanceChartData?.map((d) => d.absent) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance - Last 7 Days',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's your overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between bg-blue-100">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs sm:text-sm mb-1 truncate">{stat.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 sm:p-4 rounded-full flex-shrink-0 ml-3`}>
                  <Icon className="text-white" size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Chart */}
        <div className="card">
          <div className="h-64 sm:h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-purple-600 flex-shrink-0" size={24} />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Recent Payments</h3>
          </div>
          <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
            {stats?.recentPayments?.length > 0 ? (
              stats.recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                      {payment.studentId?.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{payment.month}</p>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-green-600 flex-shrink-0">
                    ${payment.amount}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8 text-sm sm:text-base">No recent payments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;