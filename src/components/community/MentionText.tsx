import { Fragment } from "react";

interface MentionTextProps {
  content: string;
}

const MentionText = ({ content }: MentionTextProps) => {
  // Parse @mentions in text
  const parts = content.split(/(@\w+(?:\s\w+)?)/g);
  
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        // Check if this part is a mention (starts with @)
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              className="text-primary font-medium hover:underline cursor-pointer"
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
