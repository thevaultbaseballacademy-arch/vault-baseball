import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CertificationType } from "@/lib/certificationPricing";

export interface CertificationDefinition {
  id: string;
  certification_type: CertificationType;
  name: string;
  description: string;
  passing_score: number;
  question_count: number;
  validity_months: number;
  price_cents: number;
  is_required: boolean;
  prerequisites: CertificationType[];
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_type: CertificationType;
  status: 'active' | 'expired' | 'revoked';
  issued_at: string;
  expires_at: string;
  score: number;
  attempt_id: string | null;
}

export interface CertificationQuestion {
  id: string;
  certification_type: CertificationType;
  section: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string | null;
  is_scenario: boolean;
  display_order: number;
}

export interface CertificationAttempt {
  id: string;
  user_id: string;
  certification_type: CertificationType;
  started_at: string;
  completed_at: string | null;
  answers: Record<string, number>;
  score: number | null;
  passed: boolean | null;
  question_ids: string[];
}

// Fetch all certification definitions
export const useCertificationDefinitions = () => {
  return useQuery({
    queryKey: ['certification-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certification_definitions')
        .select('*')
        .order('is_required', { ascending: false });

      if (error) throw error;
      return data as CertificationDefinition[];
    },
  });
};

// Fetch user's certifications
export const useUserCertifications = () => {
  return useQuery({
    queryKey: ['user-certifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_certifications')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserCertification[];
    },
  });
};

// Fetch questions for a certification exam
export const useCertificationQuestions = (certType: CertificationType | null) => {
  return useQuery({
    queryKey: ['certification-questions', certType],
    queryFn: async () => {
      if (!certType) return [];

      const { data, error } = await supabase
        .from('certification_questions')
        .select('*')
        .eq('certification_type', certType)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Parse options from JSONB
      return (data || []).map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      })) as CertificationQuestion[];
    },
    enabled: !!certType,
  });
};

// Start an exam attempt
export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certType: CertificationType) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get questions for this exam
      const { data: questions, error: questionsError } = await supabase
        .from('certification_questions')
        .select('id')
        .eq('certification_type', certType)
        .eq('is_active', true);

      if (questionsError) throw questionsError;

      const questionIds = (questions || []).map(q => q.id);

      // Create attempt
      const { data, error } = await supabase
        .from('certification_attempts')
        .insert({
          user_id: user.id,
          certification_type: certType,
          question_ids: questionIds,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CertificationAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certification-attempts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start exam');
    },
  });
};

// Submit exam answers
export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      attemptId, 
      answers, 
      questions,
      certType,
      passingScore,
      validityMonths 
    }: { 
      attemptId: string; 
      answers: Record<string, number>;
      questions: CertificationQuestion[];
      certType: CertificationType;
      passingScore: number;
      validityMonths: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate score
      let correct = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correct_answer_index) {
          correct++;
        }
      });

      const score = Math.round((correct / questions.length) * 100);
      const passed = score >= passingScore;

      // Update attempt
      const { error: attemptError } = await supabase
        .from('certification_attempts')
        .update({
          completed_at: new Date().toISOString(),
          answers,
          score,
          passed,
        })
        .eq('id', attemptId);

      if (attemptError) throw attemptError;

      // If passed, create/update certification
      if (passed) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + validityMonths);

        const { error: certError } = await supabase
          .from('user_certifications')
          .upsert({
            user_id: user.id,
            certification_type: certType,
            status: 'active',
            issued_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            score,
            attempt_id: attemptId,
          }, {
            onConflict: 'user_id,certification_type',
          });

        if (certError) throw certError;
      }

      return { score, passed, correct, total: questions.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user-certifications'] });
      queryClient.invalidateQueries({ queryKey: ['certification-attempts'] });
      
      if (result.passed) {
        toast.success(`Congratulations! You passed with ${result.score}%`);
      } else {
        toast.error(`Score: ${result.score}%. You need ${result.passed ? '' : 'at least '}to pass.`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit exam');
    },
  });
};

// Bulk import questions
export const useBulkImportQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questions: Omit<CertificationQuestion, 'id'>[]) => {
      const { data, error } = await supabase
        .from('certification_questions')
        .insert(questions.map(q => ({
          ...q,
          options: JSON.stringify(q.options),
        })))
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['certification-questions'] });
      toast.success(`Imported ${data.length} questions successfully`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to import questions');
    },
  });
};

// Check if user has prerequisite certifications
export const useCheckPrerequisites = (certType: CertificationType | null, definitions: CertificationDefinition[], userCerts: UserCertification[]) => {
  if (!certType || !definitions.length) return { canTake: false, missing: [] };

  const definition = definitions.find(d => d.certification_type === certType);
  if (!definition) return { canTake: false, missing: [] };

  const prerequisites = definition.prerequisites || [];
  const activeCerts = userCerts.filter(c => c.status === 'active' && new Date(c.expires_at) > new Date());
  const activeCertTypes = activeCerts.map(c => c.certification_type);

  const missing = prerequisites.filter(p => !activeCertTypes.includes(p));

  return {
    canTake: missing.length === 0,
    missing,
  };
};
