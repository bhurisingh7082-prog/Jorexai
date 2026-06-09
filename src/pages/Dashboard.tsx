import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/useAuth";
import { useAuthModal } from "../lib/authModalStore";
import {
  Send,
  Image as ImageIcon,
  Video,
  Code,
  ImagePlay,
  Loader2,
  Sparkles,
  MessageSquare,
  Download,
  Copy,
  Check,
  Paperclip,
  Camera,
  Plus,
  File,
  Edit,
  X,
  Edit2,
  RefreshCw,
  Globe,
  FileText,
} from "lucide-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MessageNode } from "../lib/types";
import { getMessages, saveMessages, saveSession } from "../lib/chatStore";
import { canUse, trackUsage, getSubscription } from "../lib/subscriptionStore";

export default function Dashboard() {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const currentChatIdRef = useRef<string | undefined>(chatId);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<
    { name: string; type: "image" | "file" | "video"; progress: number }[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSuggestionClick = (prefix: string) => {
    setInput(prefix);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = inputRef.current.value.length;
        inputRef.current.selectionEnd = inputRef.current.value.length;
      }
    }, 0);
  };

  const handleFakeUpload = (filename: string, fileType?: string) => {
    let typeVal = fileType;
    if (!typeVal) {
      const isImage = filename.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
      const isVideo = filename.toLowerCase().match(/\.(mp4|mov|webm)$/);
      typeVal = isImage ? "image" : isVideo ? "video" : "file";
    }
    setAttachments((prev) => [
      ...prev,
      {
        name: filename,
        type: typeVal as "image" | "file" | "video",
        progress: 0,
      },
    ]);

    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setAttachments((prev) =>
        prev.map((a, i) =>
          i === prev.length - 1 ? { ...a, progress: Math.min(100, prog) } : a,
        ),
      );
      if (prog >= 100) clearInterval(interval);
    }, 200);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    overrideType?: "image" | "file" | "video",
  ) => {
    if (!user) {
      // Need a way to preserve the file or just ask them to login and reselect
      e.preventDefault();
      openModal();
      return;
    }
    if (e.target.files) {
      Array.from(e.target.files).forEach((f) => {
        let typeVal = overrideType;
        if (!typeVal) {
          const isImage =
            f.type.startsWith("image") ||
            f.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/);
          const isVideo =
            f.type.startsWith("video") ||
            f.name.toLowerCase().match(/\.(mp4|mov|webm)$/);
          typeVal = isImage ? "image" : isVideo ? "video" : "file";
        }

        handleFakeUpload(f.name, typeVal);

        // Save to document/file storage
        const docs = JSON.parse(
          localStorage.getItem("quantum_documents") || "[]",
        );
        docs.push({
          id: Date.now().toString() + Math.random(),
          name: f.name,
          type:
            typeVal === "file"
              ? f.name.toLowerCase().endsWith(".pdf")
                ? "pdf"
                : "doc"
              : typeVal,
          date: Date.now(),
          size: (f.size / 1024).toFixed(1) + " KB",
          projectId:
            localStorage.getItem("quantum_active_project") || "default",
        });
        localStorage.setItem("quantum_documents", JSON.stringify(docs));
      });
      e.target.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (!user) {
      openModal();
      return;
    }
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((f) => {
        handleFakeUpload(f.name);

        if (
          !f.name.toLowerCase().endsWith(".jpg") &&
          !f.name.toLowerCase().endsWith(".png") &&
          !f.type.startsWith("image") &&
          !f.type.startsWith("video")
        ) {
          const docs = JSON.parse(
            localStorage.getItem("quantum_documents") || "[]",
          );
          docs.push({
            id: Date.now().toString(),
            name: f.name,
            type: f.name.toLowerCase().endsWith(".pdf") ? "pdf" : "doc",
            date: Date.now(),
            size: (f.size / 1024).toFixed(1) + " KB",
            projectId:
              localStorage.getItem("quantum_active_project") || "default",
          });
          localStorage.setItem("quantum_documents", JSON.stringify(docs));
        }
      });
    }
  };

  useEffect(() => {
    let newChatId = chatId;
    if (chatId !== currentChatIdRef.current) {
      currentChatIdRef.current = chatId;
      if (chatId) {
        setMessages(getMessages(chatId));
      } else {
        setMessages([]);
        setInput("");
        setAttachments([]);
      }
      setIsProcessing(false);
    } else {
        newChatId = newChatId || "default";
    }

    if (newChatId) {
        const pendingInput = localStorage.getItem(`pending_chat_input_${newChatId}`);
        if (pendingInput) {
            setInput(pendingInput);
            localStorage.removeItem(`pending_chat_input_${newChatId}`);
        }
        const pendingAttachments = localStorage.getItem(`pending_chat_attachments_${newChatId}`);
        if (pendingAttachments) {
            setAttachments(JSON.parse(pendingAttachments));
            localStorage.removeItem(`pending_chat_attachments_${newChatId}`);
        }
    }

    if (chatId && messages.length === 0 && !isProcessing) {
      const stored = getMessages(chatId);
      if (stored.length > 0) {
        setMessages(stored);
      }
    }

    // Add new_chat listener
    const handleNewChat = () => {
      navigate("/");
      setMessages([]);
      setInput("");
      setAttachments([]);
      setIsProcessing(false);
    };

    const handleTriggerAction = (e: any) => {
      if (e.detail === "generate-image") {
        handleSuggestionClick("Create an image of ");
      } else if (e.detail === "generate-video") {
        handleSuggestionClick("Create a video of ");
      } else if (e.detail === "upload-file") {
        fileInputRef.current?.click();
      }
    };

    window.addEventListener("new_chat", handleNewChat);
    window.addEventListener("triggerAction", handleTriggerAction);

    const handleStorage = () => {
      if (chatId) {
        const sessions = JSON.parse(
          localStorage.getItem("quantum_sessions_public") || "[]",
        );
        if (!sessions.find((s: any) => s.id === chatId)) {
          navigate("/");
        }
      }
    };
    window.addEventListener("quantum_sessions_changed", handleStorage);
    return () => {
      window.removeEventListener("quantum_sessions_changed", handleStorage);
      window.removeEventListener("new_chat", handleNewChat);
      window.removeEventListener("triggerAction", handleTriggerAction);
    };
  }, [chatId, navigate]);

  useEffect(() => {
    if (messages.length > 0 && chatId) {
      saveMessages(chatId, messages);
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatId]);

  const handleSubmit = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    let textToSubmit = customText || input.trim();
    if ((!textToSubmit && attachments.length === 0) || isProcessing) return;

    if (!user) {
      openModal(() => handleSubmit(undefined, customText || input.trim()));
      return;
    }

    if (!textToSubmit && attachments.length > 0) {
      textToSubmit =
        "Uploaded " +
        attachments.length +
        " file" +
        (attachments.length > 1 ? "s" : "");
    }

    if (!customText) setInput("");

    const currentAttachments = attachments.map((a) => ({
      name: a.name,
      type: a.type,
    }));
    const userMsg: MessageNode = {
      id: Date.now().toString(),
      role: "user",
      content: textToSubmit,
      type: "text",
      attachments:
        currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    setAttachments([]);
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      const { getActiveProjectId } = await import("../lib/projectStore");
      saveSession({
        id: currentChatId,
        title:
          textToSubmit.slice(0, 30) + (textToSubmit.length > 30 ? "..." : ""),
        updatedAt: Date.now(),
        projectId: getActiveProjectId(),
      });
      saveMessages(currentChatId, [userMsg]);
      currentChatIdRef.current = currentChatId;
      navigate(`/chat/${currentChatId}`, { replace: true });
    } else {
      const existing = JSON.parse(
        localStorage.getItem("quantum_sessions_public") || "[]",
      ).find((s: any) => s.id === currentChatId);
      if (existing) {
        existing.updatedAt = Date.now();
        saveSession(existing);
      }
    }

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      if (!textToSubmit) throw new Error("No input");
      
      const intentRes = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSubmit }),
      });
      const intentData = await intentRes.json();
      const intent = intentData.intent || "TEXT";

      let checkType: "chat" | "coding" | "image" | "video" = "chat";
      if (intent === "IMAGE") checkType = "image";
      else if (intent === "VIDEO") checkType = "video";
      else if (intent === "CODE") checkType = "coding";

      if (!canUse(checkType)) {
        navigate("/pricing?limit=true");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        saveMessages(currentChatId, messages); // Revert last saved
        setIsProcessing(false);
        // Save pending input to restore it
        localStorage.setItem(`pending_chat_input_${currentChatId}`, customText || textToSubmit);
        if (currentAttachments.length > 0) {
            localStorage.setItem(`pending_chat_attachments_${currentChatId}`, JSON.stringify(currentAttachments));
        }
        return;
      }
      
      trackUsage(checkType);

      let aiMsgId = Date.now().toString() + "-ai";
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "ai",
          content: "",
          type: intent.toLowerCase() as any,
          status: "loading",
          intentMatched: intent,
        },
      ]);

      if (intent === "IMAGE") {
        const res = await fetch("/api/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textToSubmit }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to generate image");

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, content: data.imageUrl, status: "done" }
              : m,
          ),
        );

        // Save generated image
        // ...
        const images = JSON.parse(
          localStorage.getItem("quantum_images") || "[]",
        );
        const { getActiveProjectId } = await import("../lib/projectStore");
        images.push({
          id: Date.now().toString(),
          url: data.imageUrl,
          prompt: textToSubmit,
          date: Date.now(),
          projectId: getActiveProjectId(),
        });
        localStorage.setItem("quantum_images", JSON.stringify(images));
      } else if (intent === "VIDEO") {
        const timeRegex = /\b(\d+)\s*(sec|second|s|minute|min|m|hour|h)\b/ig;
        let overLimit = false;
        let match;
        while ((match = timeRegex.exec(textToSubmit)) !== null) {
          const amount = parseInt(match[1], 10);
          const unit = match[2].toLowerCase();
          if (amount > 8 && unit.startsWith("s")) overLimit = true;
          if (amount >= 1 && (unit.startsWith("m") || unit.startsWith("h"))) overLimit = true;
        }
        
        if (overLimit) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString() + "-ai-warning",
                role: "ai",
                content: "Maximum video length is 8 seconds.",
                type: "text",
                status: "done",
              },
            ]);
        }

        const res = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: textToSubmit }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate video");

        const operationName = data.operationName;
        if (!operationName) throw new Error("No operation returned");

        let isDone = false;
        let videoUri = "";
        while (!isDone) {
          const pollRes = await fetch("/api/video-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName }),
          });
          const pollData = await pollRes.json();
          if (!pollRes.ok)
            throw new Error(pollData.error || "Failed to poll video");

          isDone = pollData.done;
          if (isDone && pollData.response?.generatedVideos?.[0]?.video?.uri) {
            videoUri = `/api/video-download?op=${encodeURIComponent(operationName)}`;
            break;
          } else if (!isDone) {
            await new Promise((r) => setTimeout(r, 5000));
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, content: videoUri, status: "done" } : m,
          ),
        );

        // Save generated video
        // ...
        const videos = JSON.parse(
          localStorage.getItem("quantum_videos") || "[]",
        );
        const { getActiveProjectId } = await import("../lib/projectStore");
        videos.push({
          id: Date.now().toString(),
          url: videoUri,
          prompt: textToSubmit,
          date: Date.now(),
          projectId: getActiveProjectId(),
        });
        localStorage.setItem("quantum_videos", JSON.stringify(videos));
      } else if (intent === "FILE") {
        const apiMessages = [...messages, userMsg]
          .map((m) => ({ role: m.role, content: m.content }))
          .filter((m) => m.role === "user");

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, intent }),
        });
        if (!res.ok) throw new Error("Document generation failed");

        let contentText = "";
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        while (true && reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) contentText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: "Generating document...",
                          status: "loading",
                        }
                      : m,
                  ),
                );
              } catch (e) {}
            }
          }
        }

        const blob = new Blob([contentText], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const fileName =
          "document-" + Math.floor(Math.random() * 10000) + ".md";

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: url,
                  status: "done",
                  fileMetadata: {
                    name: fileName,
                    size: (blob.size / 1024).toFixed(1) + " KB",
                  },
                }
              : m,
          ),
        );

        const docs = JSON.parse(
          localStorage.getItem("quantum_documents") || "[]",
        );
        const { getActiveProjectId } = await import("../lib/projectStore");
        docs.push({
          id: Date.now().toString(),
          name: fileName,
          type: "doc",
          date: Date.now(),
          size: (blob.size / 1024).toFixed(1) + " KB",
          projectId: getActiveProjectId(),
        });
        localStorage.setItem("quantum_documents", JSON.stringify(docs));
      } else {
        const apiMessages = [...messages, userMsg]
          .map((m) => ({ role: m.role, content: m.content }))
          .filter((m) => m.role === "user");

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, intent }),
        });
        if (!res.ok) throw new Error("Chat failed");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        let fullText = "";
        while (true && reader) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.text) {
                  fullText += parsed.text;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMsgId
                        ? { ...m, content: fullText, status: "loading" }
                        : m,
                    ),
                  );
                }
              } catch (e) {}
            }
          }
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, status: "done" } : m)),
        );
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last.role === "ai" && last.status === "loading") {
          return prev.map((m) =>
            m.id === last.id
              ? { ...m, content: err.message, status: "error", type: "text" }
              : m,
          );
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: "ai",
            content: err.message,
            type: "text",
            status: "error",
          },
        ];
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#212121] w-full min-w-0 min-h-0 relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragActive(false);
      }}
      onDrop={handleDrop}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm border-2 border-dashed border-white/40 m-4 rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center pointer-events-none">
              <Paperclip className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium tracking-tight">
              Drop files here to upload
            </h3>
          </div>
        </div>
      )}

      <header className="h-14 shrink-0 flex items-center justify-between px-4 z-10 w-full pl-14 lg:pl-4">
        <div className="flex items-center space-x-2 cursor-pointer hover:bg-[#2f2f2f] px-3 py-1.5 rounded-lg transition-colors">
          <span className="font-semibold text-gray-200">Jerox AI</span>
          <span className="text-gray-400 text-xs">3.1</span>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                let txt = "Chat Export\\n\\n";
                messages.forEach((m) => {
                  txt += `[${m.role === "user" ? "User" : "Jerox AI"}]\\n`;
                  if (m.type === "text") txt += m.content + "\\n";
                  if (m.type === "image") txt += `[Image Supported]\\n`;
                  if (m.type === "video") txt += `[Video Supported]\\n`;
                  if (m.type === "file") txt += `[File Supported]\\n`;
                  txt += "\\n";
                });
                const blob = new Blob([txt], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `jerox_chat_${Date.now()}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white hover:bg-[#2f2f2f] px-3 py-1.5 rounded-lg transition-colors"
              title="Export as TXT"
            >
              <Download className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">TXT</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white hover:bg-[#2f2f2f] px-3 py-1.5 rounded-lg transition-colors"
              title="Export as PDF"
            >
              <Download className="w-4 h-4 hidden sm:block" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        )}
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto w-full custom-scrollbar min-h-0">
        <div className={`w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8 ${messages.length === 0 ? 'h-full flex items-center justify-center pb-20' : 'space-y-6 md:space-y-8'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-700 w-full max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-6">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                How can I help you today?
              </h2>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onEdit={(content) => {
                  setInput(content);
                  endRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                onDelete={(id) => {
                  setMessages((prev) => prev.filter((m) => m.id !== id));
                }}
              />
            ))
          )}
          <div ref={endRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="w-full bg-[#212121] pb-6 pt-2 px-3 sm:px-4 md:px-6">
        <div className="max-w-4xl mx-auto w-full relative">
          <div className="bg-[#2f2f2f] rounded-3xl shadow-sm border border-transparent focus-within:border-white/20 transition-colors w-full px-2 py-3 flex flex-col justify-end min-h-[60px]">
            {/* Suggestions inside prompt box */}
            {messages.length === 0 && !input.trim() && (
              <div className="flex overflow-x-auto gap-2 px-2 pb-3 mb-1 md:justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <SuggestionPill
                  icon={<ImageIcon />}
                  title="Create an Image"
                  onClick={() => handleSuggestionClick("Create an image of ")}
                />
                <SuggestionPill
                  icon={<Video />}
                  title="Generate a Video"
                  onClick={() => handleSuggestionClick("Generate a video of ")}
                />
                <SuggestionPill
                  icon={<FileText />}
                  title="Write a Resume"
                  onClick={() =>
                    handleSuggestionClick("Write a professional resume for ")
                  }
                />
                <SuggestionPill
                  icon={<FileText />}
                  title="Cover Letter"
                  onClick={() =>
                    handleSuggestionClick("Write a cover letter for ")
                  }
                />
                <SuggestionPill
                  icon={<Globe />}
                  title="Build a Website"
                  onClick={() => handleSuggestionClick("Build a website for ")}
                />
                <SuggestionPill
                  icon={<Code />}
                  title="Generate Code"
                  onClick={() => handleSuggestionClick("Write code for ")}
                />
                <SuggestionPill
                  icon={<MessageSquare />}
                  title="Explain Anything"
                  onClick={() => handleSuggestionClick("Explain ")}
                />
              </div>
            )}

            <form
              onSubmit={(e) => handleSubmit(e)}
              className="flex items-end w-full relative h-full"
            >
              {/* Plus Menu Button */}
              <div className="relative mr-2 ml-1">
                <button
                  type="button"
                  onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                  className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#424242] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {isPlusMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsPlusMenuOpen(false)}
                    />
                    <div className="absolute bottom-12 left-0 w-48 bg-[#2f2f2f] border border-white/10 shadow-2xl rounded-2xl py-2 z-50 animate-in slide-in-from-bottom-2 fade-in">
                      <PlusMenuItem
                        icon={<File />}
                        label="Upload File"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          fileInputRef.current?.click();
                        }}
                      />
                      <PlusMenuItem
                        icon={<ImageIcon />}
                        label="Upload Photo"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          photoInputRef.current?.click();
                        }}
                      />
                      <PlusMenuItem
                        icon={<Video />}
                        label="Upload Video"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          videoInputRef.current?.click();
                        }}
                      />
                      <PlusMenuItem
                        icon={<Camera />}
                        label="Open Camera"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          cameraInputRef.current?.click();
                        }}
                      />
                      <div className="h-px bg-white/10 my-1 mx-3" />
                      <PlusMenuItem
                        icon={<Sparkles />}
                        label="Generate Image"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          handleSuggestionClick("Create an image of ");
                        }}
                      />
                      <PlusMenuItem
                        icon={<Video />}
                        label="Generate Video"
                        onClick={() => {
                          setIsPlusMenuOpen(false);
                          handleSuggestionClick("Create a video of ");
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                multiple
                onChange={(e) => handleFileChange(e, "file")}
                accept=".pdf,.docx,.txt,.xlsx,.pptx"
              />
              <input
                type="file"
                className="hidden"
                ref={photoInputRef}
                multiple
                onChange={(e) => handleFileChange(e, "image")}
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              />
              <input
                type="file"
                className="hidden"
                ref={videoInputRef}
                multiple
                onChange={(e) => handleFileChange(e, "video")}
                accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
              />
              <input
                type="file"
                className="hidden"
                ref={cameraInputRef}
                capture="environment"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
              />

              <div className="flex-1 flex flex-col">
                {/* Upload Preview */}
                {attachments.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 px-1">
                    {attachments.map((file, i) => (
                      <div
                        key={i}
                        className="relative group bg-[#424242] rounded-xl px-3 py-2 flex items-center space-x-2 w-40 border border-white/5"
                      >
                        <div className="w-8 h-8 shrink-0 bg-black/20 rounded-lg flex items-center justify-center text-gray-300">
                          {file.type === "image" ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <File className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">
                            {file.name}
                          </p>
                          {file.progress < 100 ? (
                            <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-brand-500 h-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Uploaded
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Message Jerox..."
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none max-h-48 min-h-[24px] focus:outline-none focus:ring-0 text-[15px] pt-1"
                  rows={1}
                />
              </div>
              <div className="flex items-center ml-2 mr-1">
                <button
                  type="submit"
                  disabled={
                    (!input.trim() && attachments.length === 0) || isProcessing
                  }
                  className={`p-1.5 rounded-full flex items-center justify-center transition-all ${
                    (input.trim() || attachments.length > 0) && !isProcessing
                      ? "bg-white text-black hover:bg-gray-200 opacity-100 cursor-pointer"
                      : "bg-[#424242] text-gray-500 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin p-0.5" />
                  ) : (
                    <Send className="w-5 h-5 p-0.5" />
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-3 text-xs text-gray-400">
            Jerox AI can make mistakes. Consider verifying important
            information.
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestionPill({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex items-center space-x-2 px-3 py-2 rounded-full border border-white/10 bg-[#2f2f2f] hover:bg-[#424242] transition-colors whitespace-nowrap text-sm text-gray-300"
    >
      <div className="text-brand-400 children-w-4 children-h-4">{icon}</div>
      <span>{title}</span>
    </button>
  );
}

function PlusMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[#424242] text-gray-200 transition-colors text-sm text-left"
    >
      <div className="w-4 h-4 text-gray-400">{icon}</div>
      <span>{label}</span>
    </button>
  );
}

function MessageBubble({
  msg,
  onEdit,
  onDelete,
}: {
  msg: MessageNode;
  onEdit?: (content: string) => void;
  onDelete?: (id: string) => void;
}) {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (msg.type === "text") {
      navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`flex w-full group/message ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex w-full flex-col ${isUser ? "items-end" : "items-start max-w-full"}`}
      >
        <div
          className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
        >
          {!isUser && (
            <div className="shrink-0 w-8 h-8 rounded-full border border-white/10 bg-white flex items-center justify-center mr-4 mt-1">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
          )}

          <div
            className={`flex flex-col space-y-2 min-w-0 ${isUser ? "max-w-[85%] md:max-w-[75%] bg-[#2f2f2f] px-5 py-3 rounded-3xl ml-auto" : "flex-1 max-w-full"}`}
          >
            {/* User attachments */}
            {isUser && msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {msg.attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-2 bg-black/20 rounded-lg px-3 py-1.5 border border-white/5"
                  >
                    {file.type === "image" ? (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <File className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-xs font-medium text-gray-300 truncate max-w-[150px]">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {msg.role === "ai" &&
              msg.status === "loading" &&
              msg.type !== "text" && (
                <div className="flex items-center space-x-2 text-sm text-gray-400 pt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating {msg.type}...</span>
                </div>
              )}

            <div
              className={`text-[15px] leading-relaxed break-words min-w-0 w-full ${
                isUser ? "text-gray-100" : "text-gray-200"
              }`}
            >
              {msg.type === "text" &&
                (msg.status === "error" ? (
                  <div className="text-red-400 min-w-0">{msg.content}</div>
                ) : (
                  <div className={`markdown-body pt-1 min-w-0 max-w-full overflow-hidden`}>
                    <Markdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const codeString = String(children).replace(/\n$/, "");
                          if (!inline && match) {
                            return (
                              <div className="relative group my-5 rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/10 w-full max-w-full">
                                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5 sticky top-0 z-10">
                                  <span className="text-xs font-mono text-gray-400 capitalize">{match[1]}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(codeString)}
                                    className="flex items-center space-x-1 text-xs text-gray-400 hover:text-white transition-colors p-1"
                                    title="Copy Code"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Code</span>
                                  </button>
                                </div>
                                <div className="overflow-x-auto w-full max-w-full custom-scrollbar">
                                  <SyntaxHighlighter
                                    {...props}
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '0.95rem', minWidth: '100%' }}
                                  >
                                    {codeString}
                                  </SyntaxHighlighter>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                ))}

              {msg.type === "image" && msg.status === "done" && (
                <div
                  className={`rounded-xl overflow-hidden border border-white/10 group relative max-w-sm mt-2`}
                >
                  <img
                    src={msg.content}
                    alt="AI Generated"
                    className="w-full h-auto object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-black/80 px-3 py-1.5 rounded-full border border-white/10 text-xs font-medium text-white">
                      Original
                    </div>
                  </div>
                </div>
              )}

              {msg.type === "video" && msg.status === "done" && (
                <div
                  className={`rounded-xl overflow-hidden border border-white/10 bg-[#171717] aspect-video flex items-center justify-center relative group mt-2`}
                >
                  <video
                    src={msg.content}
                    controls
                    className="w-full h-full object-cover rounded-xl"
                    autoPlay
                    loop
                    muted={false}
                  />
                </div>
              )}

              {msg.type === "file" && msg.status === "done" && (
                <div className="flex items-center justify-between bg-[#212121] border border-white/10 rounded-xl p-3 max-w-sm mt-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {msg.fileMetadata?.name || "Document"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {msg.fileMetadata?.size || "File"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 pl-3">
                    <a
                      href={msg.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Open"
                    >
                      <File className="w-4 h-4" />
                    </a>
                    <a
                      href={msg.content}
                      download={msg.fileMetadata?.name}
                      className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions inside bubble */}
        <div
          className={`flex flex-wrap items-center gap-1 mt-2 opacity-100 sm:opacity-0 sm:group-hover/message:opacity-100 transition-opacity ${isUser ? "mr-2 justify-end" : "ml-12"}`}
        >
          {!isUser && msg.status === "done" && (
            <>
              <button
                onClick={handleCopy}
                className="px-2 py-1 bg-[#2f2f2f] rounded-md text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5"
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {copied ? "Copied" : "Copy"}
                </span>
              </button>
              <button
                className="px-2 py-1 bg-[#2f2f2f] rounded-md text-xs font-medium text-gray-300 hover:text-white transition-colors flex items-center space-x-1.5"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Regenerate</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-1.5 bg-[#2f2f2f] rounded-md text-gray-400 hover:text-white transition-colors flex items-center"
                title="Export PDF"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const blob = new Blob(
                    [
                      msg.type === "text"
                        ? msg.content
                        : `[${msg.type.toUpperCase()}]`,
                    ],
                    { type: "text/plain" },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `jerox_response_${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-1.5 bg-[#2f2f2f] rounded-md text-gray-400 hover:text-white transition-colors flex items-center"
                title="Export TXT"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: "Jerox AI Response",
                      text:
                        msg.type === "text"
                          ? msg.content
                          : "Check out this Jerox AI response!",
                    });
                  } else {
                    handleCopy();
                  }
                }}
                className="p-1.5 bg-[#2f2f2f] rounded-md text-gray-400 hover:text-white transition-colors flex items-center"
                title="Share"
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </div>
              </button>
            </>
          )}
          {isUser && (
            <button
              onClick={() => onEdit?.(msg.content)}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex items-center"
              title="Edit message"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
