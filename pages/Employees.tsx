import React, { useEffect, useState } from 'react';
import { User, EmployeeWithTeams, Team } from '../types';
import * as Backend from '../services/backend';
import { Plus, Search, Edit2, Trash2, Users, X } from 'lucide-react';

interface EmployeesProps {
  user: User;
}

const Employees: React.FC<EmployeesProps> = ({ user }) => {
  const [employees, setEmployees] = useState<EmployeeWithTeams[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<EmployeeWithTeams | null>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignEmp, setAssignEmp] = useState<EmployeeWithTeams | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      const [e, t] = await Promise.all([
        Backend.getEmployees(user.orgId),
        Backend.getTeams(user.orgId),
      ]);
      setEmployees(e);
      setTeams(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.orgId]);

  const handleOpenModal = (emp?: EmployeeWithTeams) => {
    if (emp) {
      setEditingEmp(emp);
      setName(emp.name);
      setEmail(emp.email);
      setJobTitle(emp.jobTitle);
    } else {
      setEditingEmp(null);
      setName('');
      setEmail('');
      setJobTitle('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await Backend.updateEmployee(user, editingEmp.id, { name, email, jobTitle });
      } else {
        await Backend.createEmployee(user, { name, email, jobTitle });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      await Backend.deleteEmployee(user, id);
      loadData();
    }
  };

  const handleOpenAssign = (emp: EmployeeWithTeams) => {
    setAssignEmp(emp);
    setSelectedTeamIds(new Set(emp.teams.map(t => t.id)));
    setIsAssignModalOpen(true);
  };

  const toggleTeamSelection = (teamId: string) => {
    const newSet = new Set(selectedTeamIds);
    if (newSet.has(teamId)) newSet.delete(teamId);
    else newSet.add(teamId);
    setSelectedTeamIds(newSet);
  };

  const handleAssignSubmit = async () => {
    if (!assignEmp) return;
    await Backend.assignEmployeeToTeams(user, assignEmp.id, Array.from(selectedTeamIds));
    setIsAssignModalOpen(false);
    loadData();
  };

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading employees...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">Manage your organization's workforce</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold border-b border-slate-200">Name</th>
                <th className="p-4 font-semibold border-b border-slate-200">Role</th>
                <th className="p-4 font-semibold border-b border-slate-200">Teams</th>
                <th className="p-4 font-semibold border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEmployees.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{emp.name}</p>
                      <p className="text-sm text-slate-500">{emp.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">{emp.jobTitle}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {emp.teams.length > 0 ? (
                        emp.teams.map(t => (
                          <span key={t.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-sm italic">No teams</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenAssign(emp)}
                      title="Manage Teams"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Users size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(emp)}
                      title="Edit Employee"
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      title="Delete Employee"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingEmp ? 'Edit Employee' : 'Add New Employee'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Teams Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign Teams</h3>
                <p className="text-sm text-slate-500">For {assignEmp?.name}</p>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teams.map(team => (
                    <div 
                      key={team.id}
                      onClick={() => toggleTeamSelection(team.id)}
                      className={`
                        cursor-pointer p-3 rounded-lg border flex items-center space-x-3 transition-all
                        ${selectedTeamIds.has(team.id) 
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${selectedTeamIds.has(team.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}
                      `}>
                        {selectedTeamIds.has(team.id) && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{team.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center">No teams available. Create a team first.</p>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
               <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg font-medium">Cancel</button>
               <button onClick={handleAssignSubmit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Save Assignments</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;