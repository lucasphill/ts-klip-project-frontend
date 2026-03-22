import type { NavItemProps } from "../types/types";

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center rounded-xl px-2.5 py-2 text-sm transition-all ${
        isOpen ? "justify-between" : "justify-center"
      } ${active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"}`}
    >
      <span className="flex min-w-0 items-center gap-2.5 overflow-hidden">
        <span className={`transition-colors ${active ? "text-slate-800" : "group-hover:text-slate-700"}`} style={{ color: !active ? color : undefined }}>
          {icon}
        </span>
        {isOpen && <span className="truncate font-medium">{label}</span>}
      </span>
      {isOpen && badge !== undefined && badge > 0 && (
        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{badge}</span>
      )}
    </button>
  );
};

export default NavItem;
