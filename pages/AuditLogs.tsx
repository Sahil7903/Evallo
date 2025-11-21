import React, { useEffect, useState } from 'react';
import { User, AuditLog } from '../types';
import * as Backend from '../services/backend';
import { FileText, RefreshCw } from 'lucide-react';

interface AuditLogsProps {
  user: User;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ user }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await Backend.getLogs(user.orgId);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [user.orgId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500">Track all system activities and changes</p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="flex items-center text-slate-600 hover:text-blue-600 bg-white border border-slate-300 hover:border-blue-400 px-3 py-2 rounded-lg transition-all"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200 w-48">Timestamp</th>
                <th className="p-4 font-semibold border-b border-slate-200 w-48">User</th>
                <th className="p-4 font-semibold border-b border-slate-200 w-48">Action</th>
                <th className="p-4 font-semibold border-b border-slate-200">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-700">
                    {log.userName}
                  </td>
                  <td className="p-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${log.action.includes('DELETE') ? 'bg-red-100 text-red-800' : 
                        log.action.includes('CREATE') ? 'bg-green-100 text-green-800' :
                        log.action.includes('UPDATE') || log.action.includes('ASSIGN') ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'}
                    `}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    <FileText size={32} className="mx-auto mb-2 opacity-50"/>
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;