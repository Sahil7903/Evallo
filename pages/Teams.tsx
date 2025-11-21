import React, { useEffect, useState } from 'react';
import { User, TeamWithMembers } from '../types';
import * as Backend from '../services/backend';
import { Plus, Edit2, Trash2, Users, X, Briefcase } from 'lucide-react';

interface TeamsProps {
  user: User;
}

const Teams: React.FC<TeamsProps> = ({ user }) => {
  const [teams, setTeams] = useState<TeamWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamWithMembers | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await Backend.getTeams(user.orgId);
      setTeams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [user.orgId]);

  const handleOpenModal = (team?: TeamWithMembers) => {
    if (team) {
      setEditingTeam(team);
      setName(team.name);
      setDescription(team.description);
    } else {
      setEditingTeam(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await Backend.updateTeam(user, editingTeam.id, { name, description });
      } else {
        await Backend.createTeam(user, { name, description });
      }
      setIsModalOpen(false);
      loadTeams();
    } catch (e) {
      alert("Failed to save team");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this team? This will remove all assignments to this team.')) {
      await Backend.deleteTeam(user, id);
      loadTeams();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading teams...</div>;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teams</h1>
          <p className="text-sm text-slate-500">Organize your company structure</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 truncate">{team.name}</h3>
              <div className="flex space-x-1">
                <button onClick={() => handleOpenModal(team)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(team.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 size={16}/></button>
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-6 flex-1">{team.description}</p>
            
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <div className="flex items-center justify-between text-sm">
                 <span className="flex items-center text-slate-500">
                   <Users size={16} className="mr-2"/>
                   {team.members.length} Member{team.members.length !== 1 && 's'}
                 </span>
              </div>
              <div className="mt-3 flex -space-x-2 overflow-hidden">
                {team.members.slice(0, 5).map(m => (
                   <div key={m.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600" title={m.name}>
                     {m.name.charAt(0)}
                   </div>
                ))}
                {team.members.length > 5 && (
                   <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs text-slate-500 font-medium">
                     +{team.members.length - 5}
                   </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {teams.length === 0 && (
           <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-300 rounded-xl text-slate-500">
             <Briefcase size={48} className="mx-auto mb-4 text-slate-300"/>
             <p className="font-medium">No teams created yet.</p>
             <p className="text-sm">Create your first team to start assigning employees.</p>
           </div>
        )}
      </div>

      {/* Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{editingTeam ? 'Edit Team' : 'Create New Team'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                <input type="text" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea required rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Save Team</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;