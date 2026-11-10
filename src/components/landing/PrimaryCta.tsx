import { ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { BRAND, content } from "./content";

export default function PrimaryCta() {
  const { login, isAuthenticated } = useAuth();
  const className =
    "inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#66ACCB]/25 transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0";
  const style = { backgroundImage: `linear-gradient(135deg, ${BRAND.blue}, #4f93b3)` };

  if (isAuthenticated) {
    return (
      <a href="/" className={className} style={style}>
        {content.hero.ctaAuthenticated}
        <ArrowRight className="h-5 w-5" />
      </a>
    );
  }
  return (
    <button onClick={login} className={className} style={style}>
      {content.hero.cta}
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}
