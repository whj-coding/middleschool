# Loop Run Log - Middle School

Append one JSON object per run. Prune entries older than 30 days.

## Format

```json
{
  "run_id": "2026-07-08T08:15:00Z",
  "pattern": "daily-triage",
  "duration_s": 45,
  "items_found": 4,
  "actions_taken": 0,
  "escalations": 0,
  "tokens_estimate": 52000,
  "outcome": "report-only"
}
```

## Recent Runs

<!-- Loop appends below this line -->

{"run_id":"2026-07-08T06:53:01Z","pattern":"daily-triage","duration_s":900,"items_found":3,"actions_taken":0,"escalations":3,"tokens_estimate":12000,"outcome":"report-only"}
{"run_id":"2026-07-08T12:50:50Z","pattern":"daily-triage-l2-fix","duration_s":3900,"items_found":3,"actions_taken":3,"escalations":1,"tokens_estimate":26000,"outcome":"fixed-verified-review-blocked"}
{"run_id":"2026-07-08T12:52:45Z","pattern":"daily-triage-l2-review-followup","duration_s":720,"items_found":1,"actions_taken":1,"escalations":0,"tokens_estimate":6000,"outcome":"edge-fixed-verified"}
