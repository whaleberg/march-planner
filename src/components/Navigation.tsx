import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Users, Building2, Calendar, Flag, Settings, Database, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout, canEdit } = useAuth();

  // Navigation items - some are only visible to authenticated users
  const publicNavItems = [
    { path: '/', label: 'Overview', icon: MapPin, public: true },
  ];

  const protectedNavItems = [
    { path: '/marchers', label: 'Marchers', icon: Users, public: false },
    { path: '/organizations', label: 'Partners', icon: Building2, public: false },
    { path: '/marcher-schedule', label: 'Marcher Schedule', icon: Calendar, public: false },
    { path: '/org-schedule', label: 'Partner Schedule', icon: Calendar, public: false },
    { path: '/day-management', label: 'Day Management', icon: Settings, public: false },
    { path: '/data-management', label: 'Data Management', icon: Database, public: false },
  ];

  // Combine nav items based on authentication
  const navItems = [...publicNavItems, ...(isAuthenticated ? protectedNavItems : [])];

  const handleLogout = async () => {
    await logout();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'editor':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <nav className="header-gradient text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Flag className="h-8 w-8 mr-3 text-white" />
            <h1 className="text-2xl font-bold text-white">March Organizer</h1>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Navigation Links */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white bg-opacity-20 text-white shadow-lg'
                      : 'text-white hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Authentication Section */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-white border-opacity-20">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user?.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role || '')}`}>
                      {user?.role}
                    </span>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                /* Login Link */
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden md:inline">Admin Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 