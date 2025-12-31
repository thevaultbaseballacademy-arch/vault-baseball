import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminExams = () => {
  const { user, isAdmin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-display mb-6">Exams</h1>
          <Card>
            <CardHeader>
              <CardTitle>Exam Question Banks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Exam management and CSV import interface coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminExams;
