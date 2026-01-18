
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import EventsListPage from "./pages/EventsListPage";
import EventDetailPage from "./pages/EventDetailPage";
import BathsListPage from "./pages/BathsListPage";
import BathDetailPage from "./pages/BathDetailPage";
import MastersListPage from "./pages/MastersListPage";
import MasterDetailPage from "./pages/MasterDetailPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogEditorPage from "./pages/BlogEditorPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import TelegramCallbackPage from "./pages/TelegramCallbackPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminSaunasPage from "./pages/admin/AdminSaunasPage";
import AdminMastersPage from "./pages/admin/AdminMastersPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminTransactionsPage from "./pages/admin/AdminTransactionsPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import AdminRoleApplicationsPage from "./pages/admin/AdminRoleApplicationsPage";
import AdminBlogPage from "./pages/admin/AdminBlogPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ApplyRolePage from "./pages/ApplyRolePage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="saunas" element={<AdminSaunasPage />} />
              <Route path="masters" element={<AdminMastersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="role-applications" element={<AdminRoleApplicationsPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/events" element={<Layout><EventsListPage /></Layout>} />
            <Route path="/events/:slug" element={<Layout><EventDetailPage /></Layout>} />
            <Route path="/bany" element={<Layout><BathsListPage /></Layout>} />
            <Route path="/bany/:slug" element={<Layout><BathDetailPage /></Layout>} />
            <Route path="/masters" element={<Layout><MastersListPage /></Layout>} />
            <Route path="/masters/:slug" element={<Layout><MasterDetailPage /></Layout>} />
            <Route path="/blog" element={<Layout><BlogPage /></Layout>} />
            <Route path="/blog/editor" element={<Layout><BlogEditorPage /></Layout>} />
            <Route path="/blog/:postId" element={<Layout><BlogPostPage /></Layout>} />
            <Route path="/about" element={<Layout><AboutPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/auth/telegram/callback" element={<TelegramCallbackPage />} />
            <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
            <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
            <Route path="/account" element={<Layout><AccountPage /></Layout>} />
            <Route path="/account/apply-role" element={<Layout><ApplyRolePage /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;