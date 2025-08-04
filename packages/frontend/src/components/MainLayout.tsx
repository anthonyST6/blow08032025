import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import { toast } from 'react-hot-toast';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navigation = [
    { name: 'Mission Control OLD', href: '/dashboard' },
    { name: 'Mission Control Enhanced OLD', href: '/mission-control-enhanced' },
    { name: 'Mission Operations Center OLD', href: '/mission-operations' },
    { name: 'Use Case Launcher OLD', href: '/use-cases' },
    { name: 'Prompt Engineering OLD', href: '/prompts' },
    { name: 'Prompt Analysis OLD', href: '/analysis' },
    { name: 'Agent Orchestration OLD', href: '/agents' },
    { name: 'Workflows OLD', href: '/workflows' },
    { name: 'Deployment OLD', href: '/deployment' },
    { name: 'Operations OLD', href: '/operations' },
    { name: 'Integration Log OLD', href: '/integration-log' },
    { name: 'Audit Console OLD', href: '/audit' },
    { name: 'Output Viewer OLD', href: '/outputs' },
    { name: 'Certifications OLD', href: '/certifications' },
  ];

  const v2Navigation = [
    { name: 'Mission Control', href: '/mission-control' },
    { name: 'Use Case Dashboard', href: '/mission-control/use-case' },
    { name: 'Certifications', href: '/mission-control/certifications' },
  ];

  const adminNavigation = [
    { name: 'User Management', href: '/users' },
    { name: 'Settings', href: '/settings' },
    { name: 'Admin', href: '/admin' },
  ];

  return (
    <div className="flex h-screen bg-seraphim-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-black shadow-lg transition-all duration-300`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="relative p-4 border-b border-seraphim-gold/30">
            <div className={`flex items-center ${!sidebarOpen && 'hidden'}`}>
              <img
                src="/seraphim-logo.png"
                alt="Seraphim Vanguards"
                className="h-24 w-auto ml-4"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {/* New Vanguards Platform Section */}
            <div className="pb-2">
              <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
                Vanguards Platform
              </p>
            </div>
            {v2Navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-seraphim-gold/20 text-seraphim-gold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}

            {/* Old Platform Section */}
            <div className="pt-4 mt-4 border-t border-seraphim-gold/30">
              <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
                Vanguards Platform OLD
              </p>
            </div>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-seraphim-gold/20 text-seraphim-gold'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <>
                <div className="pt-4 mt-4 border-t border-seraphim-gold/30">
                  <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wider ${!sidebarOpen && 'hidden'}`}>
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-seraphim-gold/20 text-seraphim-gold'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-seraphim-gold/30">
            <div className="flex items-center justify-between">
              <div className={`${!sidebarOpen && 'hidden'}`}>
                <p className="text-sm font-medium text-white">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-black shadow-sm border-b border-seraphim-gold/30">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-2xl font-semibold text-white uppercase tracking-wider">
              {location.pathname === '/dashboard'
                ? 'VANGUARDS'
                : navigation.find(item => item.href === location.pathname)?.name ||
                  adminNavigation.find(item => item.href === location.pathname)?.name ||
                  'VANGUARDS'}
            </h2>
            <div className="flex items-center space-x-4">
              {/* WebSocket Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${connected ? 'bg-vanguard-green' : 'bg-vanguard-red'}`} />
                <span className="text-sm text-gray-400">
                  {connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-seraphim-black">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;