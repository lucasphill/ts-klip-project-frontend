import { describe, expect, it } from "vitest";
import { groupProjects } from "./projectGrouping";
import type { GetProjectGroupDto, GetProjectsDto } from "../types/apiTypes";

const project = (id: string, name: string, groupId?: string | null): GetProjectsDto => ({
  id,
  name,
  groupId,
  createdAt: "",
});
const group = (id: string, name: string): GetProjectGroupDto => ({
  id,
  name,
  orderIndex: 0,
  createdAt: "",
  projects: [],
});

const projects = [
  project("1", "Argus", "g1"),
  project("2", "Klip", "g1"),
  project("3", "Compras"),
  project("4", "Casa", null),
  { ...project("5", "Estudos"), groupId: undefined, group_id: "g2" },
];
const groups = [group("g1", "Trabalho"), group("g2", "Pessoal"), group("g3", "Vazia")];

describe("groupProjects", () => {
  it("splits projects between folders and the root", () => {
    const result = groupProjects(projects, groups, "");
    expect(result.rootProjects.map((p) => p.id)).toEqual(["3", "4"]);
    expect(result.groupedProjects.get("g1")?.map((p) => p.id)).toEqual(["1", "2"]);
    expect(result.groupedProjects.get("g2")?.map((p) => p.id)).toEqual(["5"]);
  });

  it("keeps every folder, even empty ones, when not searching", () => {
    expect(groupProjects(projects, groups, "").visibleGroups.map((g) => g.id)).toEqual(["g1", "g2", "g3"]);
  });

  it("filters ignoring case and surrounding spaces, hiding folders without matches", () => {
    const result = groupProjects(projects, groups, "  KLI ");
    expect(result.isSearching).toBe(true);
    expect(result.rootProjects).toEqual([]);
    expect(result.groupedProjects.get("g1")?.map((p) => p.id)).toEqual(["2"]);
    expect(result.visibleGroups.map((g) => g.id)).toEqual(["g1"]);
  });
});
