import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
