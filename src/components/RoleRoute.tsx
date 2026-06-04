import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

export function RoleRoute({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow: Array<"admin" | "lider" | "participante">;
}) {
  const { user, session, loading } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["role-guard", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  if (!profile || !allow.includes(profile.role as any)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
