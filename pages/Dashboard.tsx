import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { User, EmployeeWithTeams, TeamWithMembers, AuditLog } from '../types';
import * as Backend from '../services/backend';
import { Users, Briefcase, Activity } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [stats, setStats] = useState({
    empCount: 0,
    teamCount: 0,
    recentLogs: [] as AuditLog[],
    chartData: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [emps, teams, logs] = await Promise.all([
          Backend.getEmployees(user.orgId),
          Backend.getTeams(user.orgId),
          Backend.getLogs(user.orgId),
        ]);

        // Prepare chart data: Employees per Team
        const chartData = teams.map(t => ({
          name: t.name,
          count: t.members.length,
        }));

        setStats({
          empCount: emps.length,
          teamCount: teams.length,
          recentLogs: logs.slice(0, 5),
          chartData,
        });
      } catch (e) {
        console.error("Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.orgId]);

  if (loading) return <div className="p-8 text-slate-500">Loading dashboard analytics...</div>;

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <span className="text-sm text-slate-500">Welcome back, {user.name}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Employees</p>
            <p className="text-2xl font-bold text-slate-900">{stats.empCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Teams</p>
            <p className="text-2xl font-bold text-slate-900">{stats.teamCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">System Health</p>
            <p className="text-2xl font-bold text-slate-900">Online</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Employee Distribution by Team</h2>
          <div className="h-64">
            {stats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#64748b" />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                    cursor={{fill: 'transparent'}}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No team data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {stats.recentLogs.length > 0 ? (
              stats.recentLogs.map(log => (
                <div key={log.id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                   <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                   <div>
                     <p className="text-sm text-slate-800 font-medium">{log.action}</p>
                     <p className="text-xs text-slate-500">{log.details}</p>
                     <p className="text-[10px] text-slate-400 mt-1">
                       {new Date(log.timestamp).toLocaleString()} by {log.userName}
                     </p>
                   </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;