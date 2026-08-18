import { type FC, type ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CollapsibleBadge {
  text: string;
  variant?: 'success' | 'neutral' | 'warning' | 'info';
}

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badge?: CollapsibleBadge;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  description,
  icon,
  badge,
  isOpen,
  onToggle,
  children,
  className = '',
  headerAction,
}) => {
  const getBadgeStyle = (variant: CollapsibleBadge['variant'] = 'neutral') => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'info':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      case 'neutral':
      default:
        return 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }
  };

  return (
    <div
      className={`bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm transition-all duration-200 ${className}`}
    >
      {/* Header / Toggle Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-5 cursor-pointer hover:bg-[var(--bg-hover)] select-none transition-colors border-b border-transparent data-[open=true]:border-[var(--border-subtle)]"
        data-open={isOpen}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {icon && (
            <div className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--primary)] border border-[var(--border-subtle)] shrink-0">
              {icon}
            </div>
          )}
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-[var(--text-primary)] truncate">
                {title}
              </h2>
              {badge && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle(
                    badge.variant
                  )}`}
                >
                  {badge.text}
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          {headerAction && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {headerAction}
            </div>
          )}
          <button
            type="button"
            className="p-1 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors focus:outline-none"
            aria-label={isOpen ? `Recolher seção ${title}` : `Expandir seção ${title}`}
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {isOpen && <div className="p-5 pt-4 animate-in fade-in-50 duration-150">{children}</div>}
    </div>
  );
};
