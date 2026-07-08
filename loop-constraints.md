# Loop Constraints

## Push & Merge

- Do not push before telling me.
- Never auto-merge to main without human approval.
- Always create a draft PR first; let me review before marking ready.

## Paths

- Never edit `.env`, `.env.*`, `auth/`, `payments/`, `secrets/`, `credentials/`.
- Never edit infrastructure configs without human approval.

## Code

- Always run tests before proposing a fix.
- Never disable tests to make CI green.
- Never refactor unrelated code.
- Max 3 fix attempts per item; escalate after that.

## Communication

- Always tell me what you are about to do before doing it.
- Never close an issue or PR without my approval.

## Budget

- If token spend hits 80% of daily cap, switch to report-only.
- If `loop-pause-all` is active, exit immediately.

