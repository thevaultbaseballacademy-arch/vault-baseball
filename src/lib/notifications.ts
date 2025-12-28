import { supabase } from "@/integrations/supabase/client";

interface CreateNotificationParams {
  userId: string;
  type: 'like' | 'comment' | 'mention';
  title: string;
  message: string;
  postId?: string;
  actorId: string;
}

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  postId,
  actorId
}: CreateNotificationParams) => {
  // Don't notify yourself
  if (userId === actorId) return;

  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        post_id: postId,
        actor_id: actorId
      });

    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

export const getActorName = async (actorId: string): Promise<string> => {
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('user_id', actorId)
    .maybeSingle();

  return data?.display_name || 'Someone';
};

export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

export const getMentionedUserIds = async (mentionNames: string[]): Promise<string[]> => {
  if (mentionNames.length === 0) return [];

  const { data } = await supabase
    .from('profiles')
    .select('user_id')
    .in('display_name', mentionNames);

  return data?.map(p => p.user_id) || [];
};
