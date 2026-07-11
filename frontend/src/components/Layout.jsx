import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Users, Video, BrainCircuit } from 'lucide-react';

const Layout = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Interviews', path: '/interviews', icon: Video },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-darkBg text-slate-300 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <BrainCircuit className="text-brand mr-3" size={24} />
          <span className="text-white font-semibold text-lg tracking-wide">AI Recruiter</span>
        </div>
        
        <div className="p-4">
          <p className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-wider px-2">Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-white' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="mr-3" size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center text-slate-500">
            <div className="w-1 h-5 bg-slate-300 rounded-full mr-4"></div>
            <span className="text-sm font-medium">Recruiter Command Center</span>
          </div>
          <div className="flex items-center">
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              API CONNECTED
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;