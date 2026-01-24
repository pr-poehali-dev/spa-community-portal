
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import EventsListPage from "./pages/EventsListPage";
import EventDetailPage from "./pages/EventDetailPage";
import BathsListPage from "./pages/BathsListPage";
import BathDetailPage from "./pages/BathDetailPage";
import MastersListPage from "./pages/MastersListPage";
import MasterDetailPage from "./pages/MasterDetailPage";
import BlogPage from "./pages/BlogPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events/:slug" element={<EventDetailPage />} />
            <Route path="/bany" element={<BathsListPage />} />
            <Route path="/bany/:slug" element={<BathDetailPage />} />
            <Route path="/masters" element={<MastersListPage />} />
            <Route path="/masters/:slug" element={<MasterDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;