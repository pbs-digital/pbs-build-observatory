# PBS Build Observatory

Real-time visibility dashboard for PBS Build Loop sessions.

## Structure

- `/sessions/` - Session data (plans, findings, verdicts) pushed automatically by engineers
- `/dashboard/` - React dashboard source code
- `/.github/workflows/` - Auto-deployment to GitHub Pages

## Access

**Dashboard:** https://pbs-digital.github.io/pbs-build-observatory/

Login with your GitHub Personal Access Token (requires `pbs-digital` org membership).

## Setup

### For engineers (installing the sync hook)

1. Copy the hook script:
   ```bash
   curl -o ~/.claude/hooks/build-observatory-sync.sh \
     https://raw.githubusercontent.com/pbs-digital/pbs-claude-marketplace/main/observatory-hook/build-observatory-sync.sh
   
   chmod +x ~/.claude/hooks/build-observatory-sync.sh
   ```

2. Configure Claude Code by adding to `~/.claude/settings.json`:
   ```json
   {
     "hooks": {
       "afterToolResult": "~/.claude/hooks/build-observatory-sync.sh"
     },
     "env": {
       "OBSERVATORY_REPO": "git@github.com:pbs-digital/pbs-build-observatory.git"
     }
   }
   ```

3. Verify SSH access:
   ```bash
   ssh -T git@github.com
   ```

### For team leads (setting up the dashboard)

See [dashboard/README.md](dashboard/README.md) for complete setup instructions.

## How it works

When engineers run the build loop:

1. Claude Code creates files in `docs/build/<TICKET-ID>/`
2. The sync hook detects changes and pushes to this repo's `/sessions/` directory
3. The dashboard polls GitHub API every 10 seconds and displays updates
4. Team members see progress in real-time at the dashboard URL

## Session structure

```
sessions/
└── PLAT-1234/
    ├── metadata.json           # Session state, status, timestamps
    ├── plan.md                 # Approved plan
    ├── findings-cycle-1.md     # Evaluator findings from cycle 1
    ├── findings-cycle-2.md     # Evaluator findings from cycle 2
    └── verdict.md              # Final verdict (clean/cap-reached/deadlocked)
```

## Documentation

- [Dashboard setup and usage](dashboard/README.md)
- [Complete setup guide](https://github.com/pbs-digital/pbs-claude-marketplace/blob/main/SETUP-OBSERVATORY.md)
- [Hook documentation](https://github.com/pbs-digital/pbs-claude-marketplace/tree/main/observatory-hook)

## Support

For issues or questions, reach out in your team's engineering channel.
