import React, { useState, useRef } from "react";
import {
  User,
  CreditCard,
  Palette,
  Settings as SettingsIcon,
  Database,
  Bell,
  Info,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSubscription, PLAN_LIMITS } from "../lib/subscriptionStore";
import { useAuth } from "../lib/useAuth";
import BackButton from "../components/BackButton";

type TabId =
  | "account"
  | "subscription"
  | "appearance"
  | "personalization"
  | "data"
  | "notifications"
  | "about";

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, signOut } = useAuth();
  const subscription = getSubscription();
  const currentPlan =
    PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleNameSave = async () => {
    if (!nameInput.trim()) return;
    try {
      await updateProfile({ full_name: nameInput });
      setIsEditingName(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update name");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to data URL for easy storage without setting up Supabase Storage buckets yet
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({ avatar_url: reader.result as string });
      } catch (error) {
        console.error(error);
        alert("Failed to upload photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || "Jerox User";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initial = user?.email ? user.email.charAt(0).toUpperCase() : "U";

  const tabs = [
    { id: "account", label: "Account", icon: <User className="w-4 h-4" /> },
    {
      id: "subscription",
      label: "Subscription",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: "personalization",
      label: "Personalization",
      icon: <SettingsIcon className="w-4 h-4" />,
    },
    {
      id: "data",
      label: "Data Controls",
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "about",
      label: "About Jerox AI",
      icon: <Info className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111] text-[#e3e3e3] font-sans">
      <BackButton />
      <header className="h-14 shrink-0 flex items-center px-4 md:px-6 w-full border-b border-white/10 z-10 sticky top-0 bg-[#111]">
        <h1 className="font-medium text-base ml-12 md:ml-0">Settings</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 border-r border-white/10 hidden md:flex flex-col py-4 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`flex items-center space-x-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors text-left ${activeTab === tab.id ? "bg-[#2a2a2a] text-white font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"}`}
            >
              <div className="shrink-0">{tab.icon}</div>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          <div className="max-w-3xl mx-auto space-y-12 mb-16">
            {/* Mobile Tab Selector */}
            <div className="md:hidden pb-4 mb-4 border-b border-white/10">
              <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm shrink-0 transition-colors ${activeTab === tab.id ? "bg-[#2a2a2a] text-white" : "bg-transparent text-gray-400 hover:bg-[#2a2a2a]"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "account" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">Account</h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      Profile
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                      <div
                        className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex items-center space-x-4">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {initial}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-white">
                              Profile Picture
                            </div>
                            <div className="text-xs text-gray-500">
                              Update your avatar
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between transition-colors">
                        <div className="mb-3 md:mb-0">
                          <div className="font-medium text-white">
                            Full Name
                          </div>
                          <div className="text-sm text-gray-400">
                            Your displayed name
                          </div>
                        </div>
                        {isEditingName ? (
                          <div className="flex items-center space-x-2">
                            <input
                              autoFocus
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              className="bg-[#333] border border-white/20 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500"
                              placeholder="Enter name"
                            />
                            <button
                              onClick={handleNameSave}
                              className="text-xs font-medium px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-500 transition-colors text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setIsEditingName(false)}
                              className="text-xs font-medium px-3 py-1.5 rounded bg-[#444] hover:bg-[#555] transition-colors text-white"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full md:w-auto md:justify-end md:space-x-4">
                            <span className="text-white font-medium mr-4">
                              {displayName}
                            </span>
                            <button
                              onClick={() => {
                                setNameInput(
                                  displayName === "Jerox User"
                                    ? ""
                                    : displayName,
                                );
                                setIsEditingName(true);
                              }}
                              className="text-xs text-gray-300 font-medium px-3 py-1.5 rounded bg-[#333] hover:bg-[#444] transition-colors"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            Email Address
                          </div>
                          <div className="text-sm text-gray-400">
                            {user?.email || "Not logged in"}
                          </div>
                        </div>
                        <div className="text-xs font-medium px-2 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                          Verified
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      Security
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                      <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                        <div>
                          <div className="font-medium text-white">
                            Authentication Method
                          </div>
                          <div className="text-xs text-gray-500">
                            You log in via Email OTP.
                          </div>
                        </div>
                      </div>
                      <div
                        className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors text-red-400"
                        onClick={handleLogout}
                      >
                        <div className="font-medium flex items-center space-x-2">
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors text-red-500">
                        <div className="font-medium flex items-center space-x-2">
                          <span>Delete Account</span>
                        </div>
                        <div className="text-xs font-medium px-3 py-1.5 rounded border border-red-500/20 hover:bg-red-500/10 transition-colors">
                          Delete
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "subscription" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  Subscription
                </h2>

                <div className="space-y-6">
                  <section>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-[50px] -mr-16 -mt-16 rounded-full pointer-events-none" />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">
                            Current Plan
                          </div>
                          <div className="text-2xl font-bold text-white capitalize">
                            {subscription.plan}
                          </div>
                          {subscription.expiryDate &&
                            subscription.plan !== "free" && (
                              <div className="text-sm text-gray-400 mt-1">
                                Renews on{" "}
                                {new Date(
                                  subscription.expiryDate,
                                ).toLocaleDateString()}
                              </div>
                            )}
                        </div>
                        <button
                          onClick={() => navigate("/pricing")}
                          className="px-5 py-2.5 bg-white text-black font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      Plan Usage
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            Chat Limit
                          </div>
                          <div className="text-sm text-gray-400">
                            Daily resets
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {subscription.usage.chatCount} /{" "}
                          {currentPlan.chat === Infinity
                            ? "Unlimited"
                            : currentPlan.chat}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">
                            Coding Limit
                          </div>
                          <div className="text-sm text-gray-400">
                            Daily resets
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {subscription.usage.codingCount} /{" "}
                          {currentPlan.coding === Infinity
                            ? "Unlimited"
                            : currentPlan.coding}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">Images</div>
                          <div className="text-sm text-gray-400">
                            Monthly limit
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {subscription.usage.imageCount} / {currentPlan.image}
                        </div>
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">Videos</div>
                          <div className="text-sm text-gray-400">
                            Monthly limit
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {subscription.usage.videoCount} / {currentPlan.video}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      Billing
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                      <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                        <div className="font-medium text-white">
                          Billing Information
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  Appearance
                </h2>

                <section>
                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                    <div className="p-4">
                      <div className="font-medium text-white mb-3">Theme</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button className="flex items-center justify-center space-x-2 p-3 bg-[#2a2a2a] border border-white/30 rounded-lg text-white font-medium">
                          System Theme
                        </button>
                        <button className="flex items-center justify-center space-x-2 p-3 bg-[#111] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                          Dark
                        </button>
                        <button className="flex items-center justify-center space-x-2 p-3 bg-[#f5f5f5] text-black border border-white/10 rounded-lg opacity-50 cursor-not-allowed">
                          Light
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-4 flex items-center justify-between">
                        <span>
                          Jerox AI currently runs in a unified dark theme to
                          reduce eye strain.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "personalization" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  Personalization
                </h2>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      AI Behavior
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                      <div className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors text-left hidden md:flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white mb-1">
                            Custom Instructions
                          </div>
                          <div className="text-sm text-gray-500">
                            Provide context about yourself or how you want the
                            AI to respond.
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="p-4 md:hidden hover:bg-white/[0.02] cursor-pointer transition-colors text-left">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-white">
                            Custom Instructions
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm text-gray-500">
                          Provide context about yourself or how you want the AI
                          to respond.
                        </div>
                      </div>

                      <div className="p-4 hover:bg-white/[0.02] cursor-pointer transition-colors text-left hidden md:flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white mb-1">
                            Preferred Response Style
                          </div>
                          <div className="text-sm text-gray-500">
                            Adjust the verbosity and tone.
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 font-medium bg-[#333] px-2.5 py-1 rounded-md">
                          Default
                        </div>
                      </div>

                      <div className="p-4 md:hidden hover:bg-white/[0.02] cursor-pointer transition-colors text-left">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-white">
                            Response Style
                          </div>
                          <div className="text-sm text-gray-300 font-medium bg-[#333] px-2 py-0.5 rounded">
                            Default
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Adjust the verbosity and tone.
                        </div>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                      Language
                    </h3>
                    <div className="bg-[#1e1e1e] border border-white/5 rounded-xl">
                      <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                        <div className="font-medium text-white">
                          Language Selection
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <span>English</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  Data Controls
                </h2>

                <section>
                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors text-white">
                      <div>
                        <div className="font-medium">Export Chats</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Download all your chat history as JSON/CSV.
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-md transition-colors self-start md:self-auto">
                        Export
                      </button>
                    </div>
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors text-white">
                      <div>
                        <div className="font-medium">Export Projects</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Download code and assets.
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-md transition-colors self-start md:self-auto">
                        Export
                      </button>
                    </div>
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors text-white">
                      <div>
                        <div className="font-medium">Export Files</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Download all generated images/videos.
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-md transition-colors self-start md:self-auto">
                        Export
                      </button>
                    </div>
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <div>
                        <div className="font-medium text-red-500">
                          Clear Cache
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Free up local browser storage.
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors self-start md:self-auto border border-red-500/20">
                        Clear Cache
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  Notifications
                </h2>

                <section>
                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                    <ToggleRow
                      title="Email Notifications"
                      description="Receive product updates and newsletters."
                      enabled={true}
                    />
                    <ToggleRow
                      title="Product Updates"
                      description="Get notified about new features inside the app."
                      enabled={true}
                    />
                    <ToggleRow
                      title="Subscription Alerts"
                      description="Alerts for plan renewals or usage limits."
                      enabled={true}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === "about" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-medium text-white mb-6">
                  About Jerox AI
                </h2>

                <section>
                  <div className="bg-[#1e1e1e] border border-white/5 rounded-xl divide-y divide-white/5">
                    <div className="p-4 flex items-center justify-between">
                      <div className="font-medium text-white">App Version</div>
                      <div className="text-sm font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                        v3.1.0
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <div className="font-medium text-white">
                        Terms of Service
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <div className="font-medium text-white">
                        Privacy Policy
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors">
                      <div className="font-medium text-white">
                        Contact Support
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
}: {
  title: string;
  description: string;
  enabled: boolean;
}) {
  const [isOn, setIsOn] = useState(enabled);
  return (
    <div
      className="p-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer"
      onClick={() => setIsOn(!isOn)}
    >
      <div className="pr-4">
        <div className="font-medium text-white">{title}</div>
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      </div>
      <div
        className={`w-10 h-6 rounded-full relative transition-colors shrink-0 ${isOn ? "bg-white" : "bg-[#333]"}`}
      >
        <div
          className={`w-4 h-4 bg-black rounded-full absolute top-1 transition-transform ${isOn ? "translate-x-5" : "translate-x-1 bg-gray-400"}`}
        />
      </div>
    </div>
  );
}
