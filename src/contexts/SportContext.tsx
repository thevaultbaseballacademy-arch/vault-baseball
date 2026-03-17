import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SportType, SportConfig, getSportConfig } from "@/lib/sportTypes";

interface SportContextType {
  sport: SportType;
  sportConfig: SportConfig;
  setSport: (sport: SportType) => Promise<void>;
  loading: boolean;
}

const SportContext = createContext<SportContextType>({
  sport: 'baseball',
  sportConfig: getSportConfig('baseball'),
  setSport: async () => {},
  loading: true,
});

export const useSport = () => useContext(SportContext);

export const SportProvider = ({ children }: { children: ReactNode }) => {
  const [sport, setSportState] = useState<SportType>('baseball');
  const [loading, setLoading] = useState(true);

  // Load sport from profile on auth
  useEffect(() => {
    const loadSport = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('sport_type')
            .eq('user_id', session.user.id)
            .single();
          
          if (data?.sport_type) {
            setSportState(data.sport_type as SportType);
          }
        }
      } catch (err) {
        console.error('Error loading sport preference:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSport();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('sport_type')
          .eq('user_id', session.user.id)
          .single();
        
        if (data?.sport_type) {
          setSportState(data.sport_type as SportType);
        }
      } else {
        setSportState('baseball');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setSport = async (newSport: SportType) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { error } = await supabase
        .from('profiles')
        .update({ sport_type: newSport } as any)
        .eq('user_id', session.user.id);
      
      if (!error) {
        setSportState(newSport);
      }
    }
  };

  return (
    <SportContext.Provider value={{
      sport,
      sportConfig: getSportConfig(sport),
      setSport,
      loading,
    }}>
      {children}
    </SportContext.Provider>
  );
};
