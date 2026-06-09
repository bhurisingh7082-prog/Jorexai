import { ReactNode, useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Menu,
  X,
  Image as ImageIcon,
  Video,
  Box,
  Shield,
  FileText,
  Edit2,
} from "lucide-react";
import {
  getSessions,
  deleteSession,
  renameSession,
  ChatSession,
} from "../lib/chatStore";
import { getActiveProjectId } from "../lib/projectStore";
import { useAuth } from "../lib/useAuth";
import { getSubscription } from "../lib/subscriptionStore";

export default function Sidebar({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSessionTitle, setEditingSessionTitle] = useState("");
  const [activeProjectId, setActiveProjectId] = useState(getActiveProjectId());
  const { isAdmin } = useAuth();

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    setActiveProjectId(getActiveProjectId());
    const handleProjStorage = () => setActiveProjectId(getActiveProjectId());
    window.addEventListener(
      "quantum_active_project_changed",
      handleProjStorage,
    );
    return () =>
      window.removeEventListener(
        "quantum_active_project_changed",
        handleProjStorage,
      );
  }, []);

  useEffect(() => {
    setSessions(getSessions(activeProjectId));
    const handleStorage = () => setSessions(getSessions(activeProjectId));
    window.addEventListener("quantum_sessions_changed", handleStorage);
    return () =>
      window.removeEventListener("quantum_sessions_changed", handleStorage);
  }, [activeProjectId]);

  useEffect(() => {
    // Close mobile sidebar on route change
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleRenameSubmit = (id: string) => {
    if (editingSessionTitle.trim()) {
      renameSession(id, editingSessionTitle.trim());
    }
    setEditingSessionId(null);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#212121] text-gray-100 font-sans selection:bg-brand-500/30">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] bg-[#171717] flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-10 w-64 lg:w-[280px] shrink-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between lg:hidden p-4">
          <h1 className="font-medium text-sm text-gray-200 px-2">Jerox AI</h1>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3">
          <Link
            to="/"
            className="w-full flex items-center justify-between space-x-2 bg-transparent hover:bg-[#2f2f2f] border border-white/10 text-gray-200 py-2.5 px-3 rounded-lg transition-colors font-medium text-sm mb-2"
          >
            <div className="flex items-center space-x-2">
              <div className="bg-white text-black p-1 rounded-full">
                <Box className="w-3 h-3" />
              </div>
              <span>Jerox AI</span>
            </div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                getSubscription().plan === "free"
                  ? "bg-gray-500/20 text-gray-300"
                  : getSubscription().plan === "pro"
                    ? "bg-blue-500/20 text-blue-400"
                    : getSubscription().plan === "creator"
                      ? "bg-purple-500/20 text-purple-400"
                      : getSubscription().plan === "premium"
                        ? "bg-pink-500/20 text-pink-400"
                        : getSubscription().plan === "advance"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-white/10 text-white"
              }`}
            >
              {getSubscription().plan}
            </span>
          </Link>
          <Link
            to="/"
            onClick={(e) => {
              window.dispatchEvent(new Event("new_chat"));
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-start space-x-2 bg-white text-black hover:bg-gray-200 py-2.5 px-3 rounded-lg transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto w-full custom-scrollbar pb-4">
          <div className="mt-2 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Workspace
          </div>
          <NavItem
            to="/projects"
            icon={<Box className="w-4 h-4" />}
            label="Projects"
            active={location.pathname === "/projects"}
          />

          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Library
          </div>
          <NavItem
            to="/images"
            icon={<ImageIcon className="w-4 h-4" />}
            label="AI Images"
            active={location.pathname === "/images"}
          />
          <NavItem
            to="/videos"
            icon={<Video className="w-4 h-4" />}
            label="AI Videos"
            active={location.pathname === "/videos"}
          />
          <NavItem
            to="/documents"
            icon={<FileText className="w-4 h-4" />}
            label="Files"
            active={location.pathname === "/documents"}
          />

          <div className="mt-6 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent History
          </div>
          <div className="px-2 mb-3">
            <input
              type="text"
              placeholder="Search chats..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#212121] rounded-md px-3 py-1.5 text-sm text-white placeholder-gray-500 border border-transparent focus:border-white/10 focus:outline-none transition-colors"
            />
          </div>
          {filteredSessions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No recent chats
            </div>
          )}
          {filteredSessions.map((s) => {
            const isActive = location.pathname === `/chat/${s.id}`;
            const isEditing = editingSessionId === s.id;

            return (
              <div key={s.id} className="group relative">
                <Link
                  to={`/chat/${s.id}`}
                  className={`flex flex-col space-y-1 px-3 py-2 rounded-lg text-sm transition-all duration-200 w-full overflow-hidden ${
                    isActive
                      ? "bg-[#2f2f2f] text-white"
                      : "text-gray-300 hover:bg-[#212121] hover:text-white"
                  }`}
                  title={s.title}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingSessionTitle}
                      onChange={(e) => setEditingSessionTitle(e.target.value)}
                      onBlur={() => handleRenameSubmit(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSubmit(s.id);
                        if (e.key === "Escape") setEditingSessionId(null);
                      }}
                      autoFocus
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-full bg-[#171717] outline-none text-white border border-white/20 rounded px-1 -mx-1"
                    />
                  ) : (
                    <span className="truncate w-full block pr-6 text-left">
                      {s.title}
                    </span>
                  )}
                  {s.updatedAt && !isEditing && (
                    <span className="text-[10px] text-gray-500 text-left">
                      {new Date(s.updatedAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </Link>
                {!isEditing && (
                  <div
                    className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all ${isActive ? "bg-[#2f2f2f]" : "bg-[#212121]"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingSessionId(s.id);
                        setEditingSessionTitle(s.title);
                      }}
                      className="p-1.5 rounded-md hover:bg-white/10 hover:text-white text-gray-500 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 py-4 mt-auto">
          {isAdmin && (
            <NavItem
              to="/admin"
              icon={<Shield className="w-4 h-4 text-brand-400" />}
              label="Admin Panel"
              active={location.pathname === "/admin"}
            />
          )}
          <NavItem
            to="/pricing"
            icon={<Box className="w-4 h-4 text-yellow-400" />}
            label="Upgrade Plan"
            active={location.pathname === "/pricing"}
          />
          <NavItem
            to="/settings"
            icon={<Settings className="w-4 h-4" />}
            label="Settings"
            active={location.pathname === "/settings"}
          />

          <div className="mt-4 pt-4 border-t border-white/5">
            <UserProfile />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full min-w-0 bg-[#212121]">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden absolute top-0 left-0 p-3 z-30">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-[#2f2f2f] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

function UserProfile() {
  const { user, profile } = useAuth();
  if (!user) return null;

  const email = user.email || "User";
  const fullName = profile?.full_name || user.user_metadata?.full_name;
  const displayName = fullName || email;
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const initial = (fullName || email).charAt(0).toUpperCase();

  return (
    <div className="flex items-center space-x-3 px-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover bg-[#333]"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-xs font-bold text-white shrink-0">
          {initial}
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-white truncate">
          {displayName}
        </span>
        {fullName && (
          <span className="text-[10px] text-gray-400 truncate">{email}</span>
        )}
      </div>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-row items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full ${
        active
          ? "bg-[#2f2f2f] text-white"
          : "text-gray-300 hover:bg-[#2f2f2f] hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
