import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Mines from "@/pages/mines";
import NotFound from "@/pages/not-found";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers } from "@/pages/admin/Users";
import { AdminImages } from "@/pages/admin/Images";
import { AdminRoute } from "@/components/admin/AdminRoute";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  useWebSocket();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/mines" component={Mines} />
          <Route path="/admin/dashboard">
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </Route>
          <Route path="/admin/users">
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          </Route>
          <Route path="/admin/images">
            <AdminRoute>
              <AdminImages />
            </AdminRoute>
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
