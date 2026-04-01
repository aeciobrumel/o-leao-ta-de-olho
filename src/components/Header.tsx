import { Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const navItems = [
  { to: '/', label: 'Consulta' },
  { to: '/historico', label: 'Histórico' },
  { to: '/resumo-ir', label: 'Resumo IR' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header
      className={cn(
        'w-full border-b backdrop-blur transition-colors',
        isDark
          ? 'border-white/10 bg-[#0f172a] shadow-soft-dark'
          : 'border-stone-200/80 bg-white shadow-soft',
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-3 lg:px-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo_leao-1x1.svg"
            alt="Logo O Leão Tá de Olho"
            className="h-8 w-8 shrink-0 object-contain sm:h-10 sm:w-10"
          />
          <div>
            <p
              className={cn(
                'font-display text-lg font-bold sm:text-xl',
                isDark ? 'text-white' : 'text-slate-950',
              )}
            >
              <span className={isDark ? 'text-lion-400' : 'text-[#0c3669]'}>O Leão</span>{' '}
              <span className={isDark ? 'text-white' : 'text-[#8b684b]'}>Tá de Olho</span>
            </p>
            <p className={cn('mt-0.5 text-xs sm:text-sm', isDark ? 'text-slate-300' : 'text-stone-600')}>
              Consulte o valor histórico da sua cripto para o Imposto de Renda.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <nav aria-label="Navegação principal" className="flex flex-wrap gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm',
                    isActive
                      ? isDark
                        ? 'bg-lion-400 font-semibold text-slate-950'
                        : 'bg-slate-950 font-semibold text-white'
                      : isDark
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-stone-100 text-slate-700 hover:bg-stone-200',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className={cn(
              'h-8 w-8 rounded-md sm:h-9 sm:w-9',
              isDark
                ? 'bg-white/5 text-white hover:bg-white/10 hover:text-lion-300'
                : 'bg-stone-100 text-slate-700 hover:bg-stone-200 hover:text-slate-950',
            )}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
