<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ofg-ai-vault-rules -->
# OFG-AI Obsidian Vault Rules

This folder is also the user's Obsidian vault and AI working memory.

Before every AI task, read the active system files under `OFG-AI-SISTEM`:

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `00-INBOX/HIZLI-NOTLAR.md`
- `08-GOREVLER/AKTIF-GOREVLER.md`
- `05-KARAR-KAYITLARI/KARAR-DEFTERI.md`
- `02-SISTEM-AKISI/SISTEM-HARITASI.md`
- `06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`

After finishing a task, update the relevant Obsidian Markdown notes. Only touch code folders such as `src`, `public`, and `workspace` when the user gave an explicit code task. Do not touch `node_modules`.
<!-- END:ofg-ai-vault-rules -->

<!-- BEGIN:agent-branch-isolation -->
# Agent Branch Isolation

This project uses branch-based isolation for AI agents.

- `main` is the protected integration branch. Do not make direct code changes on `main`.
- Codex works from `C:\Users\Ömer\Desktop\study-hub-codex` on branch `codex/work`.
- Claude works from `C:\Users\Ömer\Desktop\study-hub-claude` on branch `claude/work`.
- Each agent may edit project code only inside its own worktree and branch.
- Do not edit the other agent's worktree.
- Merge back to `main` only after user approval.
- Local/private files such as `.env.local`, `.next`, `node_modules`, `.obsidian`, `.claude/settings.local.json`, and `workspace/workshop-brain` must not be committed.
<!-- END:agent-branch-isolation -->
