import type { NavItemProps } from "../types/types";

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isOpen ? label : undefined}
      aria-label={label}
      className={`group relative flex w-full items-center rounded-lg px-2 text-sm transition-all duration-200 ${
        isOpen ? "h-9 justify-between" : "h-10 justify-center"
      } ${
        active
          ? "bg-[var(--bg-soft-strong)] text-[var(--text-primary)]"
          : "text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex min-w-0 items-center overflow-hidden">
        <span
          className={`shrink-0 transition-colors ${active ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-secondary)]"}`}
          style={{ color: !active ? color : undefined }}
        >
          {icon}
        </span>
        <span
          className={`overflow-hidden whitespace-nowrap font-medium transition-all duration-200 ${
            isOpen ? "max-w-[10rem] opacity-100 ml-2" : "max-w-0 opacity-0 ml-0 pointer-events-none"
          }`}
        >
          {label}
        </span>
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-md bg-[var(--bg-soft-strong)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] transition-all duration-200 ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default NavItem;
