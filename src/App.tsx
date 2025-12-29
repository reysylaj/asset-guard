import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Assets from "./pages/Assets";
import Assignments from "./pages/Assignments";
import Maintenance from "./pages/Maintenance";
import Locations from "./pages/Locations";
import Reports from "./pages/Reports";
import EmployeeReport from "./pages/EmployeeReport";
import AssetReport from "./pages/AssetReport";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/employee/:id" element={<EmployeeReport />} />
          <Route path="/reports/asset/:id" element={<AssetReport />} />
          <Route path="/audit" element={<AuditLog />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
