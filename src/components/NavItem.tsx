import type { NavItemProps } from "../types/types";

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isOpen ? label : undefined}
      aria-label={label}
      className={`group flex w-full items-center rounded-lg px-2 text-sm transition-colors ${
        isOpen ? "justify-between py-1.5" : "h-10 justify-center"
      } ${
        active
          ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2 overflow-hidden">
        <span
          className={`transition-colors ${active ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-secondary)]"}`}
          style={{ color: !active ? color : undefined }}
        >
          {icon}
        </span>
        {isOpen && <span className="truncate font-medium">{label}</span>}
      </span>
      {isOpen && badge !== undefined && badge > 0 && (
        <span className="rounded-md bg-[var(--bg-soft-strong)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
          {badge}
        </span>
      )}
    </button>
  );
};

export default NavItem;
