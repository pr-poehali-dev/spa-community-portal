import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import Cookies from "js-cookie";

const Home = lazy(() => import("./pages/Home"));
const EventsListPage = lazy(() => import("./pages/EventsListPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const EventsCalendarPage = lazy(() => import("./pages/EventsCalendarPage"));
const BathsListPage = lazy(() => import("./pages/BathsListPage"));
const BathDetailPage = lazy(() => import("./pages/BathDetailPage"));
const MastersListPage = lazy(() => import("./pages/MastersListPage"));
const MasterDetailPage = lazy(() => import("./pages/MasterDetailPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const BlogEditorPage = lazy(() => import("./pages/BlogEditorPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const TelegramCallbackPage = lazy(() => import("./pages/TelegramCallbackPage"));
const YandexCallbackPage = lazy(() => import("./pages/YandexCallbackPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminSaunasPage = lazy(() => import("./pages/admin/AdminSaunasPage"));
const AdminMastersPage = lazy(() => import("./pages/admin/AdminMastersPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminTransactionsPage = lazy(() => import("./pages/admin/AdminTransactionsPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminRoleApplicationsPage = lazy(() => import("./pages/admin/AdminRoleApplicationsPage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage"));
const ApplyRolePage = lazy(() => import("./pages/ApplyRolePage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Загрузка...</div>
  </div>
);

const App = () => {
  // Clean up old auth tokens on app start (one-time migration)
  useEffect(() => {
    const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
    if (token && token.split('.').length !== 3) {
      console.log('[App] Обнаружен старый невалидный токен, очищаем всё хранилище');
      Cookies.remove('auth_token');
      Cookies.remove('telegram_user');
      Cookies.remove('yandex_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('telegram_user');
      localStorage.removeItem('yandex_user');
      localStorage.removeItem('telegram_auth_refresh_token');
      localStorage.removeItem('yandex_auth_refresh_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
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
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/events" element={<Layout><EventsListPage /></Layout>} />
              <Route path="/events/:slug" element={<Layout><EventDetailPage /></Layout>} />
              <Route path="/calendar" element={<Layout><EventsCalendarPage /></Layout>} />
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
              <Route path="/auth/yandex/callback" element={<YandexCallbackPage />} />
              <Route path="/forgot-password" element={<Layout><ForgotPasswordPage /></Layout>} />
              <Route path="/reset-password" element={<Layout><ResetPasswordPage /></Layout>} />
              <Route path="/account" element={<Layout><AccountPage /></Layout>} />
              <Route path="/account/apply-role" element={<Layout><ApplyRolePage /></Layout>} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;