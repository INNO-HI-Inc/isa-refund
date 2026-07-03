import { useRef, useState } from 'react';

export default function CopyButton({
  text,
  label = '복사하기',
  className = 'btn btn-primary btn-md',
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // fallback: 임시 textarea
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button type="button" className={`${className} ${copied ? 'copy-ok' : ''}`} onClick={copy}>
      {copied ? '복사 완료' : label}
    </button>
  );
}
