import { useState } from 'react';
import { cn } from '../lib/utils';

interface CoinIdentityProps {
  name: string;
  symbol: string;
  imageUrl?: string;
  className?: string;
  imageClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export default function CoinIdentity({
  name,
  symbol,
  imageUrl,
  className,
  imageClassName,
  titleClassName,
  subtitleClassName,
}: CoinIdentityProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl && !imageFailed);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {showImage ? (
        <img
          src={imageUrl}
          alt={`Icone de ${name}`}
          loading="lazy"
          className={cn('h-10 w-10 rounded-full bg-white/80 p-1 object-contain', imageClassName)}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold uppercase text-muted-foreground',
            imageClassName,
          )}
          aria-hidden="true"
        >
          {symbol.slice(0, 1)}
        </div>
      )}

      <div className="min-w-0">
        <p className={cn('truncate font-semibold text-foreground', titleClassName)}>{name}</p>
        <p className={cn('text-sm uppercase tracking-wide text-muted-foreground', subtitleClassName)}>
          {symbol}
        </p>
      </div>
    </div>
  );
}
