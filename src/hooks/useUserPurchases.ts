import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPurchase {
  id: string;
  user_id: string;
  product_key: string;
  stripe_session_id: string | null;
  amount_cents: number;
  status: string;
  purchased_at: string;
  expires_at: string | null;
}

// Map product keys to course IDs they grant access to
const PRODUCT_TO_COURSES: Record<string, string[]> = {
  'velocity_12week': ['velocity-system'],
  'velocity_accelerator': ['velocity-system'],
  'longevity_beta': ['arm-health-workload'],
  'transfer_beta': ['transfer-system'],
  'velocity_max_pack': ['velocity-system', 'speed-agility'],
  'basic': ['speed-agility'],
  'performance': ['velocity-system', 'strength-conditioning', 'speed-agility', 'arm-health-workload'],
  'elite': ['velocity-system', 'strength-conditioning', 'speed-agility', 'arm-health-workload', 'strength-power-system', 'organizational-development'],
};

export function useUserPurchases(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-purchases", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", userId)
        .order("purchased_at", { ascending: false });
      
      if (error) throw error;
      return data as UserPurchase[];
    },
    enabled: !!userId,
  });
}

export function useHasProductAccess(userId: string | undefined, productKey: string) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const hasAccess = purchases?.some(p => 
    p.product_key === productKey && 
    p.status === 'completed' &&
    (!p.expires_at || new Date(p.expires_at) > new Date())
  ) ?? false;
  
  return { hasAccess, isLoading };
}

export function useHasCourseAccess(userId: string | undefined, courseId: string) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const hasAccess = purchases?.some(purchase => {
    if (purchase.status !== 'completed') return false;
    if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) return false;
    
    const grantedCourses = PRODUCT_TO_COURSES[purchase.product_key] || [];
    return grantedCourses.includes(courseId);
  }) ?? false;
  
  return { hasAccess, isLoading };
}

export function useUnlockedCourses(userId: string | undefined) {
  const { data: purchases, isLoading } = useUserPurchases(userId);
  
  const unlockedCourses = new Set<string>();
  
  purchases?.forEach(purchase => {
    if (purchase.status !== 'completed') return;
    if (purchase.expires_at && new Date(purchase.expires_at) < new Date()) return;
    
    const grantedCourses = PRODUCT_TO_COURSES[purchase.product_key] || [];
    grantedCourses.forEach(c => unlockedCourses.add(c));
  });
  
  return { unlockedCourses: Array.from(unlockedCourses), isLoading };
}