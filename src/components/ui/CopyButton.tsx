import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { Button, type ButtonProps } from './Button';

interface CopyButtonProps extends Pick<ButtonProps, 'variant' | 'size'> {
  text: string;
  className?: string;
}

type CopyState = 'idle' | 'copied' | 'error';

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback para browsers sem Clipboard API (HTTP, iframes restritos)
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!ok) {
    throw new Error('execCommand falhou');
  }
}

export default function CopyButton({ text, className, variant = 'secondary', size = 'sm' }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');

  async function handleCopy() {
    try {
      await copyToClipboard(text);
      setState('copied');
      window.setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('error');
      window.setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button className={className} onClick={handleCopy} variant={variant} size={size}>
        {state === 'copied' ? (
          <Check className="h-4 w-4" />
        ) : state === 'error' ? (
          <X className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        {state === 'copied' ? 'Copiado' : state === 'error' ? 'Erro ao copiar' : 'Copiar texto'}
      </Button>
      {state === 'error' && (
        <p className="text-xs text-destructive">
          Não foi possível copiar. Selecione o texto manualmente.
        </p>
      )}
    </div>
  );
}
