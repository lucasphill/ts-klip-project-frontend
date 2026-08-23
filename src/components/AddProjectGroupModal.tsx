import { useEffect, useState, type FC, type FormEvent } from "react";
import {
  Bookmark,
  Box,
  Briefcase,
  CircleHelp,
  Code,
  Folder,
  Heart,
  Layout,
  Loader2,
  Sparkles,
  Star,
  Tag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateProjectGroupDto, GetProjectGroupDto } from "@/types/apiTypes";

interface AddProjectGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: CreateProjectGroupDto & { id?: string }) => Promise<void> | void;
  group?: GetProjectGroupDto | null;
}

const PRESET_COLORS = [
  "#2f6fb2",
  "#1f9d8f",
  "#d9772b",
  "#bb4f5c",
  "#7a6ac8",
  "#2f839f",
  "#708142",
  "#c15f2e",
];

const PRESET_ICONS = [
  { id: "folder", label: "Pasta", icon: Folder },
  { id: "briefcase", label: "Trabalho", icon: Briefcase },
  { id: "users", label: "Equipe", icon: Users },
  { id: "star", label: "Destaque", icon: Star },
  { id: "sparkles", label: "Especial", icon: Sparkles },
  { id: "heart", label: "Pessoal", icon: Heart },
  { id: "tag", label: "Categoria", icon: Tag },
  { id: "bookmark", label: "Favorito", icon: Bookmark },
  { id: "code", label: "Desenvolvimento", icon: Code },
  { id: "layout", label: "Design", icon: Layout },
  { id: "box", label: "Produto", icon: Box },
];

export const AddProjectGroupModal: FC<AddProjectGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  group,
}) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState("folder");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setColor(group.color || PRESET_COLORS[0]);
      setIcon(group.icon || "folder");
      return;
    }

    setName("");
    setColor(PRESET_COLORS[0]);
    setIcon("folder");
  }, [group, isOpen]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        icon,
        id: group?.id,
      });
      onClose();
    } catch {
      // onSave lida com toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent
        className="surface-panel w-[min(100%-1.5rem,36rem)] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] p-0"
        showCloseButton={!isSubmitting}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-[var(--border-subtle)] px-5 py-4 sm:px-6">
            <DialogTitle className="text-lg font-bold text-[var(--text-primary)]">
              {group ? "Editar grupo de projetos" : "Novo grupo de projetos"}
            </DialogTitle>
            <DialogDescription className="mt-1 flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span>Organize projetos relacionados em pastas com cor e ícone dedicados.</span>
              <HoverCard openDelay={150}>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    aria-label="Ajuda sobre grupos de projetos"
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]"
                  >
                    <CircleHelp className="h-3.5 w-3.5" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 text-xs">
                  Grupos agrupam visualmente seus projetos na barra lateral para manter seu espaço de trabalho limpo.
                </HoverCardContent>
              </HoverCard>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            {/* Nome do grupo */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Nome do grupo *</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Trabalho, Pessoal, Clientes..."
                className="field h-10 px-3 text-sm"
                autoFocus
                required
              />
            </div>

            {/* Seleção de Ícone */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Ícone</Label>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {PRESET_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      title={item.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-sm ring-2 ring-[var(--brand-soft)]"
                          : "border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Cor */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-[var(--text-secondary)]">Cor do grupo</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-7 w-7 rounded-lg border transition-all ${
                      color === c
                        ? "scale-110 border-[var(--text-primary)] ring-2 ring-[var(--border-strong)]"
                        : "border-[var(--border-subtle)] hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    title={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] px-5 py-3.5 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-soft)]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : group?.id ? (
                "Salvar grupo"
              ) : (
                "Criar grupo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectGroupModal;
