# PBS Build Observatory Dashboard

Real-time visibility dashboard for PBS Build Loop sessions. Shows active tickets, plans, findings, and verdicts as engineers run the build loop.

## Features

- 🔐 **GitHub OAuth** - Login with GitHub, restricted to `pbs-digital` org members
- 📊 **Live updates** - Polls every 10 seconds for new changes
- 🎯 **Session board** - Kanban-style view: Planning → Looping → Done
- 📝 **Plan viewer** - Read approved plans with markdown rendering
- 🔍 **Findings trail** - Cycle-by-cycle evaluator findings
- ✅ **Verdict summaries** - Final outcomes (clean, cap-reached, deadlocked)

## Architecture

```
Engineer's machine                Observatory repo              Dashboard
┌──────────────────┐           ┌──────────────────┐          ┌──────────────┐
│ Claude Code      │  git push │ pbs-build-       │  GitHub  │ React SPA    │
│ + build loop     │──────────>│ observatory      │<─────API─│ on GH Pages  │
│ + sync hook      │           │ /sessions/       │          │              │
└──────────────────┘           └──────────────────┘          └──────────────┘
```

## Setup

### 1. Create the observatory repository

Create a **private** GitHub repo:

```bash
gh repo create pbs-digital/pbs-build-observatory --private
cd pbs-build-observatory
mkdir sessions
echo "# PBS Build Observatory" > README.md
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Set up the dashboard repository

Fork or create a new repo for the dashboard:

```bash
gh repo create pbs-digital/pbs-build-observatory-dashboard --private
cd pbs-build-observatory-dashboard
# Copy all files from observatory-dashboard/ directory
git add .
git commit -m "Initial dashboard setup"
git push origin main
```

### 3. Enable GitHub Pages

In the dashboard repo settings:

1. Go to **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

The first deployment will happen automatically on the next push to `main`.

### 4. Install the sync hook

On each engineer's machine:

```bash
# Copy the hook script
mkdir -p ~/.claude/hooks
cp observatory-hook/build-observatory-sync.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/build-observatory-sync.sh
```

Add to `~/.claude/settings.json`:

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

Verify SSH access:

```bash
ssh -T git@github.com
```

### 5. Access the dashboard

1. Navigate to: `https://pbs-digital.github.io/pbs-build-observatory/`
2. Create a GitHub Personal Access Token:
   - Go to [GitHub Settings → Tokens](https://github.com/settings/tokens/new?scopes=repo,read:org&description=PBS%20Build%20Observatory)
   - Select scopes: `repo` and `read:org`
   - Generate and copy the token
3. Paste the token in the login form

The dashboard verifies you're a member of `pbs-digital` org before showing data.

## Usage

### Running a ticket with visibility

Just use the build loop as normal:

```
Plan ticket PLAT-1234
Run the build loop
```

The hook automatically:
- Detects changes in `docs/build/PLAT-1234/`
- Copies files to the observatory repo
- Generates `metadata.json` with session state
- Pushes to GitHub

Team members see updates in the dashboard within 10 seconds.

### Dashboard views

**Main dashboard:**
- Columns for Planning, Looping, Done
- Live activity indicator (🔴 N active)
- Click any card to see details

**Session detail:**
- **Plan tab** - The approved plan.md
- **Findings tab** - Cycle-by-cycle evaluator findings
- **Verdict tab** - Final verdict (when done)

## Development

### Local development

```bash
cd observatory-dashboard
npm install
npm run dev
```

Open http://localhost:5173

### Build for production

```bash
npm run build
npm run preview
```

### Environment variables

Create `.env.local` (gitignored):

```bash
# Optional: for GitHub OAuth flow (not needed for PAT flow)
VITE_GITHUB_CLIENT_ID=your_oauth_app_client_id
VITE_REDIRECT_URI=http://localhost:5173/
```

Currently, the dashboard uses **Personal Access Tokens** which is simpler than full OAuth flow. If you want to implement OAuth:

1. Create a GitHub OAuth App in pbs-digital org settings
2. Set callback URL to your GitHub Pages URL
3. Add `VITE_GITHUB_CLIENT_ID` to the build
4. Implement token exchange (requires a backend proxy)

## Troubleshooting

**Hook not syncing:**
- Check `~/.claude/hooks/build-observatory-sync.sh` is executable
- Verify SSH access to GitHub
- Look for errors in Claude Code terminal

**Dashboard not loading sessions:**
- Verify your GitHub token has `repo` and `read:org` scopes
- Check you're a member of `pbs-digital` org
- Verify the observatory repo exists and has data in `sessions/`

**Changes not appearing:**
- Wait 10 seconds (polling interval)
- Check the observatory repo for recent commits
- Verify the hook pushed successfully

**Authentication failed:**
- Generate a new token with correct scopes
- Clear browser localStorage and try again

## Security

- **Observatory repo is private** - Only org members can read
- **Dashboard checks org membership** - Rejects non-members
- **Tokens stored in localStorage** - Standard practice for SPAs
- **No secrets in code** - Token provided by user at login

## Customization

### Polling interval

Edit `Dashboard.tsx` and `SessionDetail.tsx`:

```typescript
const interval = setInterval(fetchSessions, 10000); // Change to 5000 for 5s
```

### Theme colors

Edit `tailwind.config.js`:

```javascript
colors: {
  primary: '#0066CC',   // Your primary color
  secondary: '#003366', // Your secondary color
}
```

### Status icons

Edit `SessionCard.tsx`:

```typescript
const statusConfig = {
  planning: { icon: '📝', ... },
  looping: { icon: '🔄', ... },
  done: { icon: '✅', ... },
};
```

## Future enhancements

Possible additions:
- Slack notifications on verdict
- Jira ticket status sync
- Real-time WebSocket updates (would require a backend)
- Filtering by engineer/evaluator
- Historical trends and stats
- Mobile-responsive improvements

## License

Internal PBS Digital tool.
