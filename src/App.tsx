/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ImagesGallery from "./pages/ImagesGallery";
import VideoLibrary from "./pages/VideoLibrary";
import DocumentsLibrary from "./pages/DocumentsLibrary";
import Projects from "./pages/Projects";
import Pricing from "./pages/Pricing";
import AdminDashboard from "./pages/AdminDashboard";
import UserMenu from "./components/UserMenu";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./lib/useAuth";
import { Loader2 } from "lucide-react";
import { fetchSubscriptionFromSupabase } from "./lib/subscriptionStore";

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div className="flex-1 flex items-center justify-center bg-[#212121]"><Loader2 className="w-8 h-8 animate-spin text-brand-400" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscriptionFromSupabase();
    }
  }, [user]);

  return (
    <BrowserRouter>
      <AuthModal />
      <UserMenu />
      <Sidebar>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat/:chatId" element={<Dashboard />} />
          <Route path="/images" element={<ImagesGallery />} />
          <Route path="/videos" element={<VideoLibrary />} />
          <Route path="/documents" element={<DocumentsLibrary />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}

