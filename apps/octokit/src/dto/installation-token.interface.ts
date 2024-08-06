export interface Permissions {
  actions: string;
  contents: string;
  metadata: string;
}

export interface InstallationToken {
  type: string;
  tokenType: string;
  token: string;
  installationId: number;
  permissions: Permissions;
  createdAt: string;
  expiresAt: string;
  repositorySelection: string;
}

export interface InstallationTokenResponseDTO {
  success: boolean;
  token: InstallationToken;
}
