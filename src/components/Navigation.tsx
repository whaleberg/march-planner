import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Users, Building2, Calendar, Flag, Settings, Database } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: MapPin },
    { path: '/marchers', label: 'Marchers', icon: Users },
    { path: '/organizations', label: 'Partners', icon: Building2 },
    { path: '/marcher-schedule', label: 'Marcher Schedule', icon: Calendar },
    { path: '/org-schedule', label: 'Partner Schedule', icon: Calendar },
    { path: '/day-management', label: 'Day Management', icon: Settings },
    { path: '/data-management', label: 'Data Management', icon: Database },
  ];

  return (
    <nav className="header-gradient text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Flag className="h-8 w-8 mr-3 text-white" />
            <h1 className="text-2xl font-bold text-white">March Organizer</h1>
          </div>
          <div className="flex space-x-1">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 