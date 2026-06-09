import { useState, useEffect } from "react";
import { Download, Search, Trash2, FileText, File, Image as ImageIcon, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function DocumentsLibrary() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all"|"documents"|"images"|"videos">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("quantum_documents");
    if (raw) {
      const activeProjId = localStorage.getItem('quantum_active_project') || 'default';
      const parsed = JSON.parse(raw);
      setDocuments(parsed.filter((d: any) => (d.projectId || 'default') === activeProjId));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = documents.filter(d => d.id !== id);
    setDocuments(updated);
    localStorage.setItem("quantum_documents", JSON.stringify(updated));
  };

  const filtered = documents.filter(d => {
    if (!d.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeTab === "documents" && d.type !== "doc" && d.type !== "pdf") return false;
    if (activeTab === "images" && d.type !== "image") return false;
    if (activeTab === "videos" && d.type !== "video") return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#171717] text-white">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-6 z-10 w-full pl-14 md:pl-6 border-b border-white/10 space-x-4">
        <h1 className="font-semibold text-lg flex items-center space-x-2 text-gray-200">
            <FileText className="w-5 h-5 text-brand-400" />
            <span>Files Vault</span>
        </h1>
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#212121] text-sm rounded-full border border-white/10 focus:outline-none focus:border-white/20 w-64 transition-colors text-white placeholder-gray-500"
          />
        </div>
      </header>

      <div className="px-6 pt-4 border-b border-white/5 flex items-center space-x-6 text-sm">
        <button onClick={() => setActiveTab("all")} className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === "all" ? "border-brand-500 text-brand-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}>All Files</button>
        <button onClick={() => setActiveTab("documents")} className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === "documents" ? "border-brand-500 text-brand-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}>Documents</button>
        <button onClick={() => setActiveTab("images")} className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === "images" ? "border-brand-500 text-brand-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}>Images</button>
        <button onClick={() => setActiveTab("videos")} className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === "videos" ? "border-brand-500 text-brand-400" : "border-transparent text-gray-400 hover:text-gray-200"}`}>Videos</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 pb-12 mt-12 md:mt-0">
            <FileText className="w-12 h-12 mb-4 opacity-50" />
            <p>No files found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.sort((a,b) => b.date - a.date).map(doc => (
               <div key={doc.id} className="group relative rounded-xl border border-white/10 bg-[#212121] p-5 flex flex-col hover:border-white/20 transition-colors">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                   doc.type === "image" ? "bg-purple-500/10 text-purple-400" :
                   doc.type === "video" ? "bg-pink-500/10 text-pink-400" :
                   "bg-blue-500/10 text-blue-400"
                 }`}>
                    {doc.type === "pdf" ? <FileText className="w-6 h-6" /> : 
                     doc.type === "image" ? <ImageIcon className="w-6 h-6" /> :
                     doc.type === "video" ? <Video className="w-6 h-6" /> :
                     <File className="w-6 h-6" />}
                 </div>
                 
                 <h3 className="font-medium text-sm mb-1 truncate">{doc.name}</h3>
                 <p className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()} • {doc.size || 'Unknown size'}</p>
                 
                 <div className="mt-6 flex items-center justify-between opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button className="text-brand-400 text-xs font-medium hover:text-brand-300">Open File</button>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => {
                          const blob = new Blob(["Simulated file content"], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = doc.name;
                          a.click();
                          URL.revokeObjectURL(url);
                        }} className="p-1.5 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-md hover:bg-white/10" title="Download">
                           <Download className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
