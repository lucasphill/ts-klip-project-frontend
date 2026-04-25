import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { customFieldDefinitionsApi } from '../services/api';
import type { GetCustomFieldDefinitionDto } from '../types/apiTypes';

interface UniversalCustomFieldsContextValue {
  universalCustomFields: GetCustomFieldDefinitionDto[];
  fetchUniversalCustomFields: (options?: { force?: boolean }) => Promise<GetCustomFieldDefinitionDto[]>;
}

const UniversalCustomFieldsContext = createContext<UniversalCustomFieldsContextValue | null>(null);

const normalizeFieldOptions = (options?: string | string[] | null) => {
  if (Array.isArray(options)) {
    return options.map((option) => option.trim()).filter(Boolean);
  }

  return String(options ?? '')
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean);
};

const normalizeCustomField = (field: GetCustomFieldDefinitionDto): GetCustomFieldDefinitionDto => ({
  ...field,
  options: normalizeFieldOptions(field.options),
  isUniversal: Boolean(field.isUniversal),
});

export const UniversalCustomFieldsProvider = ({ children }: { children: ReactNode }) => {
  const [universalCustomFields, setUniversalCustomFields] = useState<GetCustomFieldDefinitionDto[]>([]);
  const fieldsRef = useRef<GetCustomFieldDefinitionDto[]>([]);
  const hasFetchedOnceRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<GetCustomFieldDefinitionDto[]> | null>(null);

  const fetchUniversalCustomFields = useCallback(async (options?: { force?: boolean }) => {
    const shouldForce = options?.force ?? false;

    if (fetchPromiseRef.current && !shouldForce) {
      return fetchPromiseRef.current;
    }

    if (hasFetchedOnceRef.current && !shouldForce) {
      return fieldsRef.current;
    }

    fetchPromiseRef.current = customFieldDefinitionsApi
      .getAll()
      .then((response) => {
        const fields = (response.data ?? [])
          .map(normalizeCustomField)
          .filter((field) => field.isUniversal);
        fieldsRef.current = fields;
        hasFetchedOnceRef.current = true;
        setUniversalCustomFields(fields);
        return fields;
      })
      .finally(() => {
        fetchPromiseRef.current = null;
      });

    return fetchPromiseRef.current;
  }, []);

  return (
    <UniversalCustomFieldsContext.Provider value={{ universalCustomFields, fetchUniversalCustomFields }}>
      {children}
    </UniversalCustomFieldsContext.Provider>
  );
};

export const useUniversalCustomFields = () => {
  const ctx = useContext(UniversalCustomFieldsContext);
  if (!ctx) throw new Error('useUniversalCustomFields must be used within UniversalCustomFieldsProvider');
  return ctx;
};
