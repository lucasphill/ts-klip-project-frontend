import type { NavItemProps } from "../types/types";

const NavItem = ({ icon, label, active, isOpen, onClick, badge, color }: NavItemProps) => {
  return (
    <>
      <button
        onClick={onClick}
        className={`group flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all
        ${active
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`
        }>
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`transition-colors ${active ? 'text-indigo-600' : 'group-hover:text-slate-700'}`} style={{ color: !active ? color : undefined }}>
            {icon}
          </span>
          {isOpen && <span className="text-sm truncate">{label}</span>}
        </div>
        {isOpen && badge !== undefined && badge > 0 && (
          <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md group-hover:bg-indigo-200 group-hover:text-indigo-700">
            {badge}
          </span>
        )}
      </button>
    </>
  );
}

export default NavItem;