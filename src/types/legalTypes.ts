export interface LegalSection {
  number: number;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  callout?: {
    type: 'info' | 'warning' | 'google-compliance';
    title?: string;
    text: string;
  };
}

export interface LegalDocument {
  id: 'privacy-policy' | 'terms-of-service';
  title: string;
  subtitle: string;
  effectiveDate: string;
  lastUpdated: string;
  version: string;
  summary: string;
  sections: LegalSection[];
}

export const LEGAL_METADATA = {
  appName: 'Klip',
  appUrl: 'https://klip.app.br',
  developerName: 'Lucas Phill',
  contactEmail: 'contato@klip.app.br',
  backupContactEmail: 'lucasphill.dev@gmail.com',
  developerGithub: 'https://github.com/lucasphill',
  effectiveDate: '23 de Agosto de 2026',
  version: '1.0.0',
} as const;
