import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface MentionTextProps {
  content: string;
}

interface ProfileMatch {
  display_name: string;
  user_id: string;
}

const MentionText = ({ content }: MentionTextProps) => {
  const [profileMap, setProfileMap] = useState<Map<string, string>>(new Map());
  
  // Extract all mentions from content
  const mentionRegex = /@(\w+(?:\s\w+)?)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  useEffect(() => {
    const fetchProfiles = async () => {
      if (mentions.length === 0) return;

      // Use public_profiles view which only exposes limited data
      const { data: profiles } = await supabase
        .from('public_profiles')
        .select('user_id, display_name')
        .in('display_name', mentions);

      if (profiles) {
        const map = new Map<string, string>();
        profiles.forEach(p => {
          if (p.display_name) {
            map.set(p.display_name.toLowerCase(), p.user_id);
          }
        });
        setProfileMap(map);
      }
    };

    fetchProfiles();
  }, [content]);

  // Parse and render content with clickable mentions
  const parts = content.split(/(@\w+(?:\s\w+)?)/g);
  
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const mentionName = part.slice(1);
          const userId = profileMap.get(mentionName.toLowerCase());
          
          if (userId) {
            return (
              <Link
                key={index}
                to={`/profile/${userId}`}
                className="text-primary font-medium hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </Link>
            );
          }
          
          return (
            <span
              key={index}
              className="text-primary font-medium"
            >
              {part}
            </span>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </span>
  );
};

export default MentionText;
