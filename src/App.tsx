import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Assets from "./pages/Assets";
import Assignments from "./pages/Assignments";
import Maintenance from "./pages/Maintenance";
import Locations from "./pages/Locations";
import Reports from "./pages/Reports";
import EmployeeReport from "./pages/EmployeeReport";
import AssetDetails from '@/pages/AssetDetails';
import AuditLog from "./pages/AuditLog";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            <Route path="/assets" element={
              <ProtectedRoute>
                <Assets />
              </ProtectedRoute>
            } />

            <Route
              path="/assets/:id"
              element={
                <ProtectedRoute>
                  <AssetDetails />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />

            
            <Route path="/assignments" element={
              <ProtectedRoute>
                <Assignments />
              </ProtectedRoute>
            } />
            <Route path="/maintenance" element={
              <ProtectedRoute requiredRoles={['it', 'admin']}>
                <Maintenance />
              </ProtectedRoute>
            } />
            <Route path="/locations" element={
              <ProtectedRoute>
                <Locations />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/reports/employee/:id" element={
              <ProtectedRoute>
                <EmployeeReport />
              </ProtectedRoute>
            } />
            
            <Route path="/audit" element={
              <ProtectedRoute requiredRoles={['auditor', 'admin']}>
                <AuditLog />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
