import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import { useAuthModal } from "../lib/authModalStore";
import { getSubscription, PLAN_LIMITS } from "../lib/subscriptionStore";
import {
  User,
  CreditCard,
  BarChart2,
  Users,
  LogOut,
  ChevronDown,
  Settings,
} from "lucide-react";

export default function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { openModal } = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const subscription = getSubscription();
  const currentPlan =
    PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-[60]">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 font-medium text-sm rounded-full bg-white text-black hover:bg-gray-200 transition-colors shadow-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const handleSwitchAccount = async () => {
    await signOut();
    setIsOpen(false);
    openModal();
  };

  const email = user.email || "User";
  const fullName = profile?.full_name || user.user_metadata?.full_name;
  const displayName = fullName || email;
  const initial = (fullName || email).charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <div
      className="fixed top-4 right-4 md:top-6 md:right-6 z-[60]"
      ref={menuRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-1 rounded-full bg-[#2a2a2a] hover:bg-[#333] border border-white/10 transition-colors shadow-lg overflow-hidden"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {initial}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-white/5 mb-1">
            <div className="font-medium text-sm text-white truncate">
              {displayName}
            </div>
            {fullName && (
              <div className="text-xs text-gray-400 mt-0.5 truncate">
                {email}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              Joined{" "}
              {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </div>
          </div>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4 mr-3 text-gray-400" />
            My Profile
          </Link>

          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings className="w-4 h-4 mr-3 text-gray-400" />
            Settings
          </Link>

          <div className="h-px bg-white/5 my-1"></div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
