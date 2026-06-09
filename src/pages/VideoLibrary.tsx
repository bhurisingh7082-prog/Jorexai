import { useState, useEffect } from "react";
import {
  Download,
  Search,
  Trash2,
  Video,
  Maximize2,
  Share2,
  X,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function VideoLibrary() {
  const [videos, setVideos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fullScreenVid, setFullScreenVid] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("quantum_videos");
    if (raw) {
      const activeProjId =
        localStorage.getItem("quantum_active_project") || "default";
      const parsed = JSON.parse(raw);
      setVideos(
        parsed.filter((d: any) => (d.projectId || "default") === activeProjId),
      );
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    localStorage.setItem("quantum_videos", JSON.stringify(updated));
  };

  const filtered = videos.filter((v) =>
    (v.prompt || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#171717] text-white">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-6 z-10 w-full pl-14 md:pl-6 border-b border-white/10 space-x-4">
        <h1 className="font-semibold text-lg flex items-center space-x-2">
          <Video className="w-5 h-5 text-brand-400" />
          <span>AI Videos Library</span>
        </h1>
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#212121] text-sm rounded-full border border-white/10 focus:outline-none focus:border-white/20 w-64 transition-colors"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Video className="w-12 h-12 mb-4 opacity-50" />
            <p>No videos found. Generate some in the chat!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filtered
              .sort((a, b) => b.date - a.date)
              .map((vid) => (
                <div
                  key={vid.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-[#212121] flex flex-col"
                >
                  <video
                    src={vid.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 inset-x-0 p-3 md:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex justify-between items-start pointer-events-none">
                    <p className="text-sm font-medium line-clamp-2 max-w-[60%]">
                      {vid.prompt}
                    </p>
                    <div className="flex flex-wrap items-center justify-end gap-2 pointer-events-auto max-w-[40%]">
                      <a
                        href={vid.url}
                        download={`jerox_video_${vid.id}.mp4`}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullScreenVid(vid);
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-md transition-colors"
                        title="Full Screen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (navigator.share)
                            navigator.share({
                              title: "Generated Video",
                              url: vid.url,
                              text: vid.prompt,
                            });
                        }}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-md transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Full Screen Overlay */}
      {fullScreenVid && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col pt-14 pb-6 px-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex space-x-3 z-50">
            <a
              href={fullScreenVid.url}
              download={`jerox_video_${fullScreenVid.id}.mp4`}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setFullScreenVid(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <video
              src={fullScreenVid.url}
              controls
              autoPlay
              className="max-w-full max-h-full object-contain aspect-video"
            />
          </div>
          <div className="mt-4 text-center max-w-3xl mx-auto pointer-events-none">
            <p className="text-sm md:text-base font-medium text-white/90 drop-shadow-md">
              {fullScreenVid.prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
