export interface UpdateLink {
  id: string;
  name: string;
  expiresAt: number;
  disabled: boolean;
  createdAt: number;
  createdByEmail?: string;
  submissionsCount?: number;
  lastUsedAt?: number;
}
