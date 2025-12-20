import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Risks from "./pages/Risks";
import Audits from "./pages/Audits";
import Nonconformities from "./pages/Nonconformities";
import Clauses from "./pages/Clauses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper for pages that need the layout
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <MainLayout>{children}</MainLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/documents" element={<PageWrapper><Documents /></PageWrapper>} />
          <Route path="/clauses" element={<PageWrapper><Clauses /></PageWrapper>} />
          <Route path="/risks" element={<PageWrapper><Risks /></PageWrapper>} />
          <Route path="/audits" element={<PageWrapper><Audits /></PageWrapper>} />
          <Route path="/nonconformities" element={<PageWrapper><Nonconformities /></PageWrapper>} />
          <Route path="/capa" element={<PageWrapper><div className="text-foreground">CAPA Module - Coming Soon</div></PageWrapper>} />
          <Route path="/training" element={<PageWrapper><div className="text-foreground">Training Module - Coming Soon</div></PageWrapper>} />
          <Route path="/reports" element={<PageWrapper><div className="text-foreground">Reports Module - Coming Soon</div></PageWrapper>} />
          <Route path="/management-review" element={<PageWrapper><div className="text-foreground">Management Review - Coming Soon</div></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><div className="text-foreground">Settings - Coming Soon</div></PageWrapper>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
