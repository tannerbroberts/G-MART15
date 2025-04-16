import React, { useState } from 'react';

interface ClipboardButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ClipboardButton: React.FC<ClipboardButtonProps> = ({
  text,
  label = 'Copy to Clipboard',
  successLabel = 'Copied!',
  className = '',
  style = {},
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={style}
      title="Copy to clipboard"
    >
      {copied ? successLabel : label}
    </button>
  );
};

export default ClipboardButton;