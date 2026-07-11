import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Yahan hum authentication bypass kar rahe hain demo ke liye
    navigate('/dashboard');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-white">
            <BrainCircuit size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">Recruiter Command Center</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to access AI intelligence</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" defaultValue="admin@foundrfuse.com" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" defaultValue="password123" className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" required />
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-white transition-colors hover:bg-violet-700">
            Authenticate & Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;