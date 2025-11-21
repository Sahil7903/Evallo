import React, { useState } from 'react';
import { User, AuthResponse } from '../types';
import * as Backend from '../services/backend';

interface AuthProps {
  onLogin: (data: AuthResponse) => void;
}

export const Login: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Register specific fields
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let response: AuthResponse;
      if (isRegistering) {
        if (!name || !orgName) throw new Error("Please fill all fields");
        response = await Backend.register(name, email, password, orgName);
      } else {
        response = await Backend.login(email, password);
      }
      onLogin(response);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl text-white font-bold text-2xl mb-4 shadow-lg shadow-blue-200">
              N
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{isRegistering ? 'Create an Account' : 'Welcome Back'}</h1>
            <p className="text-slate-500 mt-2 text-sm">
              {isRegistering ? 'Start managing your organization today.' : 'Sign in to access your HR portal.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <>
                 <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                    placeholder="Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isLoading ? 'Processing...' : (isRegistering ? 'Get Started' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};