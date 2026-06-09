import { ReactNode, useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Plus,
  Trash2,
  Edit2,
  Box,
  Check,
  Search,
  Pin,
  MoreHorizontal,
  MessageSquare,
  Compass,
  Folder,
  X,
  ChevronDown,
} from "lucide-react";
import {
  getProjects,
  saveProject,
  updateProject,
  deleteProject,
  getActiveProjectId,
  setActiveProjectId,
  togglePinProject,
  Project,
} from "../lib/projectStore";
import { getSessions } from "../lib/chatStore";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useAuth } from "../lib/useAuth";
import { useAuthModal } from "../lib/authModalStore";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "alpha">("recent");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useAuthModal();

  useEffect(() => {
    const load = () => {
      const loaded = getProjects();

      // Calculate chat counts
      const counts = loaded.map((p) => {
        const sessions = getSessions(p.id);
        return { ...p, chatCount: sessions.length };
      });

      counts.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        if (sortBy === "recent") {
          return (
            (b.lastOpenedAt || b.createdAt) - (a.lastOpenedAt || a.createdAt)
          );
        } else if (sortBy === "oldest") {
          return (
            (a.lastOpenedAt || a.createdAt) - (b.lastOpenedAt || b.createdAt)
          );
        } else if (sortBy === "alpha") {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
      setProjects(counts);
      setActiveId(getActiveProjectId());
    };
    load();
    window.addEventListener("quantum_projects_changed", load);
    window.addEventListener("quantum_active_project_changed", load);
    window.addEventListener("quantum_sessions_changed", load);
    return () => {
      window.removeEventListener("quantum_projects_changed", load);
      window.removeEventListener("quantum_active_project_changed", load);
      window.removeEventListener("quantum_sessions_changed", load);
    };
  }, [sortBy]);

  // Click outside menu closer
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    const newProj: Project = {
      id: "proj_" + Date.now().toString(),
      name: newProjectName.trim(),
      icon: "Box",
      createdAt: Date.now(),
      lastOpenedAt: Date.now(),
    };
    saveProject(newProj);
    setActiveProjectId(newProj.id);
    setIsCreateModalOpen(false);
    setNewProjectName("");
  };

  const handleRename = () => {
    if (projectToRename && renameValue.trim()) {
      updateProject(
        projectToRename.id,
        renameValue.trim(),
        projectToRename.icon,
      );
    }
    setIsRenameModalOpen(false);
    setProjectToRename(null);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);

      // Delete associated chats
      const sessions = JSON.parse(
        localStorage.getItem("quantum_sessions_public") || "[]",
      );
      const filteredSessions = sessions.filter(
        (s: any) => s.projectId === projectToDelete.id,
      );
      filteredSessions.forEach((s: any) =>
        localStorage.removeItem(`quantum_chat_public_${s.id}`),
      );

      const newSessions = sessions.filter(
        (s: any) => s.projectId !== projectToDelete.id,
      );
      localStorage.setItem(
        "quantum_sessions_public",
        JSON.stringify(newSessions),
      );
      window.dispatchEvent(new Event("quantum_sessions_changed"));

      // Delete files
      const docs = JSON.parse(
        localStorage.getItem("quantum_documents") || "[]",
      );
      const newDocs = docs.filter(
        (d: any) => (d.projectId || "default") !== projectToDelete.id,
      );
      localStorage.setItem("quantum_documents", JSON.stringify(newDocs));

      // Delete images
      const images = JSON.parse(localStorage.getItem("quantum_images") || "[]");
      const newImages = images.filter(
        (i: any) => (i.projectId || "default") !== projectToDelete.id,
      );
      localStorage.setItem("quantum_images", JSON.stringify(newImages));

      // Delete videos
      const videos = JSON.parse(localStorage.getItem("quantum_videos") || "[]");
      const newVideos = videos.filter(
        (v: any) => (v.projectId || "default") !== projectToDelete.id,
      );
      localStorage.setItem("quantum_videos", JSON.stringify(newVideos));
    }
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#212121] text-gray-100 relative">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-6 z-10 w-full pl-14 md:pl-6 border-b border-white/10 space-x-4">
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#171717] text-sm rounded-full border border-white/5 focus:outline-none focus:border-white/20 w-64 transition-colors"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display tracking-tight text-white mb-1">
                Projects
              </h2>
              <p className="text-gray-400 text-sm">
                Create specific workspaces to separate your conversations,
                files, and assets.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-[#171717] border border-white/10 text-white text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-white/20 transition-colors"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="oldest">Oldest</option>
                  <option value="alpha">Alphabetical</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    openModal(() => setIsCreateModalOpen(true));
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((p: any) => (
              <div
                key={p.id}
                className={`group relative rounded-xl border p-4 flex flex-col transition-all duration-200 cursor-pointer ${activeId === p.id ? "bg-[#171717] border-white/20 shadow-md ring-1 ring-white/10" : "bg-[#171717] border-white/5 hover:border-white/10 hover:bg-[#1a1a1a]"}`}
                onClick={() => {
                  setActiveProjectId(p.id);
                  navigate("/");
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeId === p.id ? "bg-white text-black" : "bg-gray-800 text-gray-300"}`}
                  >
                    <Folder className="w-5 h-5" />
                  </div>
                  <div
                    className="flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => togglePinProject(p.id)}
                      className={`p-1.5 rounded transition-colors ${p.pinned ? "text-white bg-white/10 opacity-100" : "text-gray-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100"}`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === p.id ? null : p.id);
                        }}
                        className={`p-1.5 rounded text-gray-500 hover:bg-white/10 hover:text-white transition-colors ${menuOpenId === p.id ? "opacity-100 bg-white/10 text-white" : "opacity-0 group-hover:opacity-100"}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {menuOpenId === p.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-[#2f2f2f] rounded-lg shadow-xl border border-white/10 py-1 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectToRename(p);
                              setRenameValue(p.name);
                              setIsRenameModalOpen(true);
                              setMenuOpenId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10 flex items-center space-x-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-base text-gray-100 truncate pr-2">
                    {p.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1">
                    Updated{" "}
                    {new Date(
                      p.lastOpenedAt || p.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3">
                  <span className="flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{p.chatCount} Chats</span>
                  </span>
                  {activeId === p.id && (
                    <span className="flex items-center text-brand-400 font-medium space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 px-6 border-2 border-dashed border-white/5 rounded-2xl bg-[#171717]/50">
              <Folder className="w-10 h-10 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-200 mb-1">
                No projects found
              </h3>
              <p className="text-gray-500 text-sm">
                Create a new project to start organizing your workspaces.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#212121] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Create New Project
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Project Name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="w-full bg-[#171717] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:border-brand-500 transition-colors mb-6"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && projectToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#212121] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Rename Project</h3>
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Project Name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              className="w-full bg-[#171717] border border-white/10 text-white rounded-lg px-3 py-2 outline-none focus:border-brand-500 transition-colors mb-6"
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsRenameModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={!renameValue.trim()}
                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#212121] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-white">
                Delete Project?
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-medium">
                "{projectToDelete.name}"
              </span>
              ? All chats, files, images, and videos associated with this
              project will be permanently deleted.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-medium rounded-lg hover:bg-red-500/20 border border-red-500/20"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
