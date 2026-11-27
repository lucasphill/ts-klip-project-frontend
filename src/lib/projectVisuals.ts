import type { CSSProperties } from "react";
import {
  Bookmark,
  Box,
  Briefcase,
  Code,
  Folder,
  Heart,
  Layout,
  Sparkles,
  Star,
  Tag,
  Users,
} from "lucide-react";

export const getColorDotProps = (color?: string): { className: string; style?: CSSProperties } | null => {
  if (!color) return null;
  if (color.startsWith("bg-")) return { className: color };
  return { className: "", style: { backgroundColor: color } };
};

export const getGroupIconComponent = (iconName?: string) => {
  switch (iconName) {
    case "briefcase":
      return Briefcase;
    case "users":
      return Users;
    case "star":
      return Star;
    case "sparkles":
      return Sparkles;
    case "heart":
      return Heart;
    case "tag":
      return Tag;
    case "bookmark":
      return Bookmark;
    case "code":
      return Code;
    case "layout":
      return Layout;
    case "box":
      return Box;
    case "folder":
    default:
      return Folder;
  }
};
