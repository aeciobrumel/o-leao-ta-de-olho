import * as Dialog from '@radix-ui/react-dialog';
import { Heart, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const STORAGE_KEY = 'o-leao-ta-de-olho:doacao-modal-seen';

export default function DoacaoModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Apoiar o projeto via PIX"
        className={cn(
          'fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full',
          'bg-lion-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg',
          'transition-all hover:bg-lion-300 active:scale-95 hover:shadow-xl',
        )}
      >
        <Heart className="h-4 w-4 fill-slate-950" aria-hidden />
        Apoiar
      </button>

      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2',
              'rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            )}
          >
            <Dialog.Close
              className="absolute right-4 top-4 rounded-md p-1 text-stone-400 hover:text-stone-600 dark:text-slate-500 dark:hover:text-slate-300"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>

            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2">
                <img
                  src="/logo_leao-1x1.svg"
                  alt=""
                  aria-hidden
                  className="h-8 w-8 object-contain"
                />
                <Dialog.Title className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Apoie o projeto
                </Dialog.Title>
              </div>

              <Dialog.Description className="text-sm text-stone-500 dark:text-slate-400">
                O Leão Tá de Olho é gratuito e sem anúncios. Se ele te ajudou,
                considere contribuir com qualquer valor via PIX.
              </Dialog.Description>

              <img
                src="/pixbr.jpeg"
                alt="QR Code PIX para doação"
                className="h-52 w-52 rounded-xl border border-stone-200 object-contain dark:border-slate-700"
              />

              <p className="text-xs text-stone-400 dark:text-slate-500">
                Escaneie o QR Code com o app do seu banco
              </p>

              <Button
                variant="lion"
                className="w-full"
                onClick={() => handleOpenChange(false)}
              >
                <Heart className="h-4 w-4 fill-slate-950" aria-hidden />
                Obrigado pelo apoio!
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
