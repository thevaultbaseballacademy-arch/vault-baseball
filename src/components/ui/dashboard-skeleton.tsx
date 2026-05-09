import Navbar from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard-shaped skeleton: renders the Navbar + a header strip + 4 stat
 * tiles + a chart block. Used on Dashboard and VaultDashboard while auth
 * resolves so users don't see a bare centered spinner / layout flash.
 */
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </main>
  </div>
);

export default DashboardSkeleton;
