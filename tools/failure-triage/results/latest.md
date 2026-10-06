# Failure triage evaluation

Sample size: 7. Single run, temperature 0. Answers can still vary between runs.
Fixtures are reconstructed excerpts of real failures, NOT a general accuracy figure.

| fixture | expected | got | validator accepted | match |
|---|---|---|---|---|
| 01-line-items-too-broad.md | test_code_issue | test_code_issue | yes | yes |
| 02-quantity-spinner-slow.md | timing_or_race | (rejected_by_validator) | no | no |
| 03-first-card-changed.md | timing_or_race | timing_or_race | yes | yes |
| 04-confirm-pointer-events.md | test_code_issue | timing_or_race | yes | no |
| 05-disabled-combobox-not-found.md | test_code_issue | timing_or_race | yes | no |
| 06-test-timeout-no-cause.md | undetermined | timing_or_race | yes | no |
| 07-cloudflare-block.md | site_or_environment | site_or_environment | yes | yes |

Accepted by validator: 6/7
Correct: 3/7

Per expected category:
- test_code_issue: 1/3 correct
- timing_or_race: 1/2 correct
- undetermined: 0/1 correct
- site_or_environment: 1/1 correct
