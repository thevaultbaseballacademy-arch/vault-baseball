import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, differenceInHours } from 'date-fns';

interface TrialStatus {
  isTrialUser: boolean;
  isTrialExpired: boolean;
  isFullMember: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  trialStartedAt: Date | null;
  trialExpiresAt: Date | null;
  loading: boolean;
}

export const useTrialStatus = () => {
  const [status, setStatus] = useState<TrialStatus>({
    isTrialUser: false,
    isTrialExpired: false,
    isFullMember: false,
    daysRemaining: 0,
    hoursRemaining: 0,
    trialStartedAt: null,
    trialExpiresAt: null,
    loading: true,
  });

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setStatus(prev => ({ ...prev, loading: false }));
          return;
        }

        // Check team whitelist first (full access bypasses everything)
        const { data: whitelistEntry } = await supabase
          .from('team_whitelist')
          .select('full_access')
          .eq('email', session.user.email?.toLowerCase() ?? '')
          .maybeSingle();

        if (whitelistEntry?.full_access) {
          setStatus({
            isTrialUser: false,
            isTrialExpired: false,
            isFullMember: true,
            daysRemaining: 0,
            hoursRemaining: 0,
            trialStartedAt: null,
            trialExpiresAt: null,
            loading: false,
          });
          return;
        }

        // Check for active subscription (Full OS member)
        const { data: subscriptionData } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (subscriptionData?.subscribed) {
          setStatus({
            isTrialUser: false,
            isTrialExpired: false,
            isFullMember: true,
            daysRemaining: 0,
            hoursRemaining: 0,
            trialStartedAt: null,
            trialExpiresAt: null,
            loading: false,
          });
          return;
        }

        // Check for Founder's Access or other one-time purchases
        const { data: purchases } = await supabase
          .from('user_purchases')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'completed')
          .in('product_key', ['founders_access', 'vault_trial']);

        if (purchases && purchases.length > 0) {
          setStatus({
            isTrialUser: false,
            isTrialExpired: false,
            isFullMember: true,
            daysRemaining: 0,
            hoursRemaining: 0,
            trialStartedAt: null,
            trialExpiresAt: null,
            loading: false,
          });
          return;
        }

        // Check for trial
        const { data: trial } = await supabase
          .from('user_trials')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('trial_type', 'velocity_baseline')
          .maybeSingle();

        if (trial) {
          const now = new Date();
          const expiresAt = new Date(trial.expires_at);
          const startedAt = new Date(trial.started_at);
          
          const isExpired = now > expiresAt;
          const daysLeft = Math.max(0, differenceInDays(expiresAt, now));
          const hoursLeft = Math.max(0, differenceInHours(expiresAt, now) % 24);

          setStatus({
            isTrialUser: true,
            isTrialExpired: isExpired,
            isFullMember: false,
            daysRemaining: daysLeft,
            hoursRemaining: hoursLeft,
            trialStartedAt: startedAt,
            trialExpiresAt: expiresAt,
            loading: false,
          });
          return;
        }

        // Check account age as fallback (for users without trial record)
        const createdAt = session.user.created_at;
        if (createdAt) {
          const accountCreated = new Date(createdAt);
          const now = new Date();
          const accountAgeDays = differenceInDays(now, accountCreated);
          
          // If account is older than 7 days and no subscription, treat as expired trial
          if (accountAgeDays > 7) {
            setStatus({
              isTrialUser: true,
              isTrialExpired: true,
              isFullMember: false,
              daysRemaining: 0,
              hoursRemaining: 0,
              trialStartedAt: accountCreated,
              trialExpiresAt: new Date(accountCreated.getTime() + 7 * 24 * 60 * 60 * 1000),
              loading: false,
            });
            return;
          }
        }

        // Default: not a trial user
        setStatus(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error('Error checking trial status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkTrialStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkTrialStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return status;
};
