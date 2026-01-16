import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Documents from "./pages/Documents";
import Risks from "./pages/Risks";
import Audits from "./pages/Audits";
import Nonconformities from "./pages/Nonconformities";
import Clauses from "./pages/Clauses";
import Training from "./pages/Training";
import CAPA from "./pages/CAPA";
import ManagementReview from "./pages/ManagementReview";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Wrapper for pages that need the layout and protection
const ProtectedPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedPageWrapper><Index /></ProtectedPageWrapper>} />
            <Route path="/documents" element={<ProtectedPageWrapper><Documents /></ProtectedPageWrapper>} />
            <Route path="/clauses" element={<ProtectedPageWrapper><Clauses /></ProtectedPageWrapper>} />
            <Route path="/risks" element={<ProtectedPageWrapper><Risks /></ProtectedPageWrapper>} />
            <Route path="/audits" element={<ProtectedPageWrapper><Audits /></ProtectedPageWrapper>} />
            <Route path="/nonconformities" element={<ProtectedPageWrapper><Nonconformities /></ProtectedPageWrapper>} />
            <Route path="/capa" element={<ProtectedPageWrapper><CAPA /></ProtectedPageWrapper>} />
            <Route path="/training" element={<ProtectedPageWrapper><Training /></ProtectedPageWrapper>} />
            <Route path="/employees" element={<ProtectedPageWrapper><Employees /></ProtectedPageWrapper>} />
            <Route path="/reports" element={<ProtectedPageWrapper><Reports /></ProtectedPageWrapper>} />
            <Route path="/management-review" element={<ProtectedPageWrapper><ManagementReview /></ProtectedPageWrapper>} />
            <Route path="/settings" element={<ProtectedPageWrapper><div className="text-foreground">Settings - Coming Soon</div></ProtectedPageWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
