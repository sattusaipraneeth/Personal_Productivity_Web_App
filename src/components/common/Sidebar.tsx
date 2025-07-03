import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Target, 
  BookOpen, 
  BarChart3, 
  Timer, 
  Settings,
  Moon,
  Sun,
  FolderOpen,
  LogOut
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Habits', href: '/habits', icon: Target },
  { name: 'Notes', href: '/notes', icon: BookOpen },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Timer', href: '/timer', icon: Timer },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 backdrop-blur-xl border-r border-white/10">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">
            <span className="text-accent-green">Clarity</span> Hub
          </h1>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.name || user.email?.split('@')[0]}
                </p>
                <p className="text-xs text-gray-300 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 space-y-2 border-t border-white/10">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 mr-2" />
                Dark Mode
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 mr-2" />
                Light Mode
              </>
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}