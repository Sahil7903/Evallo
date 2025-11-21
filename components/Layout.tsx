import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Briefcase, LayoutDashboard, FileText, LogOut, Menu, X } from 'lucide-react';
import { User } from '../types';
import * as Backend from '../services/backend';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await Backend.logout(user.id, user.orgId);
    onLogout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Teams', path: '/teams', icon: Briefcase },
    { label: 'Audit Logs', path: '/logs', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-xl">N</div>
              <span className="font-bold text-xl tracking-tight">NexusHR</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="mb-4 px-4">
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Logged in as</p>
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden flex items-center justify-between p-4">
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">N</div>
            <span>NexusHR</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;