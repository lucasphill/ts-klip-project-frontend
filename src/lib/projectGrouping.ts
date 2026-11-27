import type { GetProjectGroupDto, GetProjectsDto } from "../types/apiTypes";

/**
 * Filtra os projetos pelo termo de busca e separa os que estão em pastas dos que ficam na raiz.
 * Durante uma busca, pastas sem resultado somem da lista.
 */
export const groupProjects = (
  projects: GetProjectsDto[],
  groups: GetProjectGroupDto[],
  search: string
) => {
  const term = search.toLowerCase().trim();
  const filtered = term ? projects.filter((project) => project.name.toLowerCase().includes(term)) : projects;

  const groupedProjects = new Map<string, GetProjectsDto[]>();
  const rootProjects: GetProjectsDto[] = [];

  filtered.forEach((project) => {
    const groupId = project.groupId ?? project.group_id;
    if (groupId) {
      const list = groupedProjects.get(groupId) ?? [];
      list.push(project);
      groupedProjects.set(groupId, list);
    } else {
      rootProjects.push(project);
    }
  });

  const visibleGroups = term ? groups.filter((group) => groupedProjects.has(group.id)) : groups;

  return { groupedProjects, rootProjects, visibleGroups, isSearching: term.length > 0 };
};
