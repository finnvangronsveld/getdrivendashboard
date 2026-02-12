import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, PlusCircle, List, Settings, LogOut, Car } from 'lucide-react';

export default function Navbar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/rides/add', label: 'Rit Toevoegen', icon: PlusCircle },
    { to: '/rides', label: 'Ritten', icon: List },
    { to: '/settings', label: 'Instellingen', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav data-testid="main-navbar" className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group" data-testid="navbar-logo">
            <Car className="w-6 h-6 text-[#D9F99D] group-hover:drop-shadow-[0_0_8px_rgba(217,249,157,0.5)] transition-all" />
            <span className="font-black text-lg tracking-tight text-white" style={{ fontFamily: 'Chivo, sans-serif' }}>
              GET DRIVEN
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                data-testid={`nav-link-${to.replace(/\//g, '-').slice(1)}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-[#D9F99D]/10 text-[#D9F99D] shadow-[0_0_10px_rgba(217,249,157,0.1)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-zinc-500">{user?.name}</span>
            <button
              onClick={logout}
              data-testid="logout-button"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Uitloggen</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              data-testid={`mobile-nav-${to.replace(/\//g, '-').slice(1)}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive(to)
                  ? 'bg-[#D9F99D]/10 text-[#D9F99D]'
                  : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
