import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { customFieldDefinitionsApi } from "../services/api";
import type { GetCustomFieldDefinitionDto } from "../types/apiTypes";
import { normalizeCustomFieldDefinition } from "../lib/customFields";

interface CustomFieldDefinitionsContextValue {
  customFieldDefinitions: GetCustomFieldDefinitionDto[];
  universalCustomFields: GetCustomFieldDefinitionDto[];
  fetchCustomFieldDefinitions: (options?: { force?: boolean }) => Promise<GetCustomFieldDefinitionDto[]>;
  updateCustomFieldDefinitionLocal: (
    customFieldDefinitionId: string,
    updates: Partial<GetCustomFieldDefinitionDto>
  ) => void;
  removeCustomFieldDefinitionLocal: (customFieldDefinitionId: string) => void;
}

const CustomFieldDefinitionsContext = createContext<CustomFieldDefinitionsContextValue | null>(null);

export const CustomFieldDefinitionsProvider = ({ children }: { children: ReactNode }) => {
  const [customFieldDefinitions, setCustomFieldDefinitions] = useState<GetCustomFieldDefinitionDto[]>([]);
  const customFieldDefinitionsRef = useRef<GetCustomFieldDefinitionDto[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<GetCustomFieldDefinitionDto[]> | null>(null);

  const fetchCustomFieldDefinitions = useCallback(
    async (options?: { force?: boolean }): Promise<GetCustomFieldDefinitionDto[]> => {
      const shouldForce = options?.force ?? false;

      if (fetchPromiseRef.current && !shouldForce) {
        return fetchPromiseRef.current;
      }

      if (hasFetchedOnceRef.current && !shouldForce) {
        return customFieldDefinitionsRef.current;
      }

      fetchPromiseRef.current = customFieldDefinitionsApi
        .getAll()
        .then((response) => {
          const data = (response.data ?? []).map(normalizeCustomFieldDefinition);
          customFieldDefinitionsRef.current = data;
          hasFetchedOnceRef.current = true;
          setCustomFieldDefinitions(data);
          return data;
        })
        .finally(() => {
          fetchPromiseRef.current = null;
        });

      return fetchPromiseRef.current;
    },
    []
  );

  const updateCustomFieldDefinitionLocal = useCallback(
    (customFieldDefinitionId: string, updates: Partial<GetCustomFieldDefinitionDto>) => {
      setCustomFieldDefinitions((prev) => {
        const nextDefinitions = prev.map((field) =>
          field.id === customFieldDefinitionId
            ? normalizeCustomFieldDefinition({ ...field, ...updates })
            : field
        );
        customFieldDefinitionsRef.current = nextDefinitions;
        hasFetchedOnceRef.current = true;
        return nextDefinitions;
      });
    },
    []
  );

  const removeCustomFieldDefinitionLocal = useCallback((customFieldDefinitionId: string) => {
    setCustomFieldDefinitions((prev) => {
      const nextDefinitions = prev.filter((field) => field.id !== customFieldDefinitionId);
      customFieldDefinitionsRef.current = nextDefinitions;
      hasFetchedOnceRef.current = true;
      return nextDefinitions;
    });
  }, []);

  const universalCustomFields = useMemo(
    () => customFieldDefinitions.filter((field) => field.isUniversal === true),
    [customFieldDefinitions]
  );

  return (
    <CustomFieldDefinitionsContext.Provider
      value={{
        customFieldDefinitions,
        universalCustomFields,
        fetchCustomFieldDefinitions,
        updateCustomFieldDefinitionLocal,
        removeCustomFieldDefinitionLocal,
      }}
    >
      {children}
    </CustomFieldDefinitionsContext.Provider>
  );
};

export const useCustomFieldDefinitionsContext = () => {
  const ctx = useContext(CustomFieldDefinitionsContext);
  if (!ctx) throw new Error("useCustomFieldDefinitionsContext must be used within CustomFieldDefinitionsProvider");
  return ctx;
};
