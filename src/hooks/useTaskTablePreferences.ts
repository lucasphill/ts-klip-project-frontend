import { useEffect, useMemo, useRef, useState } from 'react';

export type TaskStatusFilter = 'all' | 'completed' | 'pending';
export type TaskSortBy = 'due_date' | 'title' | 'created';
export type TaskSortDir = 'asc' | 'desc';

type TaskTablePreferences = {
  statusFilter: TaskStatusFilter;
  sortBy: TaskSortBy;
  sortDir: TaskSortDir;
};

type UseTaskTablePreferencesParams = {
  scope: string;
  activeView: string;
};

type StoredTaskTablePreferences = Partial<TaskTablePreferences> & {
  version?: number;
};

const STORAGE_PREFIX = 'klip:task-table-preferences';
const STORAGE_VERSION = 1;

const DEFAULT_PREFERENCES: TaskTablePreferences = {
  statusFilter: 'all',
  sortBy: 'due_date',
  sortDir: 'asc'
};

const isStatusFilter = (value: unknown): value is TaskStatusFilter =>
  value === 'all' || value === 'completed' || value === 'pending';

const isSortBy = (value: unknown): value is TaskSortBy =>
  value === 'due_date' || value === 'title' || value === 'created';

const isSortDir = (value: unknown): value is TaskSortDir =>
  value === 'asc' || value === 'desc';

const buildStorageKey = (scope: string, activeView: string) =>
  `${STORAGE_PREFIX}:v${STORAGE_VERSION}:${scope}:${activeView}`;

const parsePreferences = (rawValue: string | null): TaskTablePreferences => {
  if (!rawValue) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(rawValue) as StoredTaskTablePreferences;
    return {
      statusFilter: isStatusFilter(parsed.statusFilter) ? parsed.statusFilter : DEFAULT_PREFERENCES.statusFilter,
      sortBy: isSortBy(parsed.sortBy) ? parsed.sortBy : DEFAULT_PREFERENCES.sortBy,
      sortDir: isSortDir(parsed.sortDir) ? parsed.sortDir : DEFAULT_PREFERENCES.sortDir
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const useTaskTablePreferences = ({ scope, activeView }: UseTaskTablePreferencesParams) => {
  const storageKey = useMemo(() => buildStorageKey(scope, activeView), [scope, activeView]);
  const skipNextPersistRef = useRef(false);
  const [preferences, setPreferences] = useState<TaskTablePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    skipNextPersistRef.current = true;
    const stored = window.localStorage.getItem(storageKey);
    setPreferences(parsePreferences(stored));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    const payload: StoredTaskTablePreferences = {
      version: STORAGE_VERSION,
      statusFilter: preferences.statusFilter,
      sortBy: preferences.sortBy,
      sortDir: preferences.sortDir
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [preferences, storageKey]);

  const setStatusFilter = (statusFilter: TaskStatusFilter) => {
    setPreferences(prev => ({ ...prev, statusFilter }));
  };

  const setSortBy = (sortBy: TaskSortBy) => {
    setPreferences(prev => ({ ...prev, sortBy }));
  };

  const setSortDir = (sortDir: TaskSortDir) => {
    setPreferences(prev => ({ ...prev, sortDir }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
    statusFilter: preferences.statusFilter,
    sortBy: preferences.sortBy,
    sortDir: preferences.sortDir,
    setStatusFilter,
    setSortBy,
    setSortDir,
    resetPreferences
  };
};
