import React from "react";

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

export function HighlightedText({ text, highlight }: HighlightedTextProps) {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }

  // Create a case-insensitive regular expression to split the text.
  // We use capture groups so the split array includes the matched parts.
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark 
            key={index} 
            className="bg-yellow-500/40 text-yellow-200 rounded px-1"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
