export const OWNERSHIP_OPTIONS = [
  'TinextaCyber',
  'ServiceFactory',
  'FDM',
] as const;

export type Ownership = typeof OWNERSHIP_OPTIONS[number];
