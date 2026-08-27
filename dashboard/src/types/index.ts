export interface SessionMetadata {
  ticketId: string;
  engineer: string;
  branch: string;
  status: 'planning' | 'looping' | 'done';
  startedAt: string;
  lastUpdatedAt: string;
  currentCycle: number;
  totalCycles: number;
  evaluators: string[];
  planApproved: boolean;
}

export interface Finding {
  evaluator: string;
  severity: 'blocking' | 'warning';
  summary: string;
  details: string;
}

export interface Cycle {
  number: number;
  findings: string; // markdown content
}

export interface Session {
  metadata: SessionMetadata;
  plan?: string; // markdown content
  cycles: Cycle[];
  verdict?: string; // markdown content
}

export interface AuthState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email?: string;
}
