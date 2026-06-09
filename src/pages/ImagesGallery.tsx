import { useState, useEffect } from "react";
import {
  Download,
  Search,
  Trash2,
  Image as ImageIcon,
  Maximize2,
  Share2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function ImagesGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fullScreenImg, setFullScreenImg] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("quantum_images");
    if (raw) {
      const activeProjId =
        localStorage.getItem("quantum_active_project") || "default";
      const parsed = JSON.parse(raw);
      setImages(
        parsed.filter((d: any) => (d.projectId || "default") === activeProjId),
      );
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = images.filter((img) => img.id !== id);
    setImages(updated);
    localStorage.setItem("quantum_images", JSON.stringify(updated));
  };

  const filtered = images.filter((i) =>
    (i.prompt || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#171717] text-white">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-6 z-10 w-full pl-14 md:pl-6 border-b border-white/10 space-x-4">
        <h1 className="font-semibold text-lg flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-brand-400" />
          <span>AI Images Library</span>
        </h1>
        <div className="flex-1" />
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-[#212121] text-sm rounded-full border border-white/10 focus:outline-none focus:border-white/20 w-64 transition-colors"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
            <p>No images found. Generate some in the chat!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filtered
              .sort((a, b) => b.date - a.date)
              .map((img) => (
                <div
                  key={img.id}
                  className="group relative rounded-xl overflow-hidden border border-white/10 aspect-square bg-[#212121]"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium line-clamp-2 mb-2 md:mb-3 opacity-90">
                      {img.prompt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={img.url}
                        download={`jerox_image_${img.id}.png`}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-md transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullScreenImg(img);
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
                              title: "Generated Image",
                              url: img.url,
                              text: img.prompt,
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
      {fullScreenImg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col pt-14 pb-6 px-4 animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex space-x-3 z-50">
            <a
              href={fullScreenImg.url}
              download={`jerox_image_${fullScreenImg.id}.png`}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => setFullScreenImg(null)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <img
              src={fullScreenImg.url}
              alt={fullScreenImg.prompt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-4 text-center max-w-3xl mx-auto pointer-events-none">
            <p className="text-sm md:text-base font-medium text-white/90 drop-shadow-md">
              {fullScreenImg.prompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
