import { Octokit } from '@octokit/rest';
import type { SessionMetadata, Session, Cycle } from '../types';

const OWNER = 'pbs-digital';
const REPO = 'pbs-build-observatory';

export class GitHubAPI {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async verifyOrgMembership(): Promise<boolean> {
    try {
      const { data } = await this.octokit.orgs.checkMembershipForUser({
        org: OWNER,
        username: await this.getUsername(),
      });
      return !!data;
    } catch {
      return false;
    }
  }

  async getUsername(): Promise<string> {
    const { data } = await this.octokit.users.getAuthenticated();
    return data.login;
  }

  async getUserInfo() {
    const { data } = await this.octokit.users.getAuthenticated();
    return {
      login: data.login,
      name: data.name || data.login,
      avatar_url: data.avatar_url,
      email: data.email || undefined,
    };
  }

  async fetchSessions(): Promise<SessionMetadata[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: OWNER,
        repo: REPO,
        path: 'sessions',
      });

      if (!Array.isArray(data)) return [];

      const sessions = await Promise.all(
        data
          .filter((item) => item.type === 'dir')
          .map(async (dir) => {
            try {
              const metadata = await this.fetchFile(`sessions/${dir.name}/metadata.json`);
              return JSON.parse(metadata) as SessionMetadata;
            } catch {
              return null;
            }
          })
      );

      return sessions.filter((s): s is SessionMetadata => s !== null);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }

  async fetchSession(ticketId: string): Promise<Session | null> {
    try {
      const metadataContent = await this.fetchFile(`sessions/${ticketId}/metadata.json`);
      const metadata = JSON.parse(metadataContent) as SessionMetadata;

      const [plan, cycles, verdict] = await Promise.all([
        this.fetchFile(`sessions/${ticketId}/plan.md`).catch(() => undefined),
        this.fetchCycles(ticketId, metadata.currentCycle),
        this.fetchFile(`sessions/${ticketId}/verdict.md`).catch(() => undefined),
      ]);

      return { metadata, plan, cycles, verdict };
    } catch (error) {
      console.error(`Error fetching session ${ticketId}:`, error);
      return null;
    }
  }

  private async fetchCycles(ticketId: string, currentCycle: number): Promise<Cycle[]> {
    const cycles: Cycle[] = [];

    for (let i = 1; i <= currentCycle; i++) {
      try {
        const findings = await this.fetchFile(`sessions/${ticketId}/findings-cycle-${i}.md`);
        cycles.push({ number: i, findings });
      } catch {
        // Cycle file doesn't exist yet
      }
    }

    return cycles;
  }

  async fetchFile(path: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path,
    });

    if ('content' in data) {
      return atob(data.content);
    }

    throw new Error(`File not found: ${path}`);
  }
}
