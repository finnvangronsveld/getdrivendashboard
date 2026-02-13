import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import AddRide from "@/pages/AddRide";
import RideHistory from "@/pages/RideHistory";
import Settings from "@/pages/Settings";
import Navbar from "@/components/Navbar";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#D9F99D] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Navbar /><Dashboard /></ProtectedRoute>} />
      <Route path="/rides/add" element={<ProtectedRoute><Navbar /><AddRide /></ProtectedRoute>} />
      <Route path="/rides/edit/:rideId" element={<ProtectedRoute><Navbar /><AddRide /></ProtectedRoute>} />
      <Route path="/rides" element={<ProtectedRoute><Navbar /><RideHistory /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Navbar /><Settings /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#050505]">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#0F0F11', border: '1px solid #27272A', color: '#fff' },
            }}
          />
          <Analytics />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
