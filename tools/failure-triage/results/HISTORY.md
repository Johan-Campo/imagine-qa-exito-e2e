# Evaluation history

Seven fixtures, reconstructed excerpts of real failures seen while building this suite, each with a human-verified root cause (`fixtures/labels.json`). Single call per fixture, temperature 0, model `deepseek-ai/DeepSeek-V4-Flash-0731`. This is a small sample: read it as an illustration of behavior, not as an accuracy figure.

## How the runs differ

| Run | Configuration | Accepted by validator | Correct |
|---|---|---|---|
| A | `response_format: json_object` | 3/7 | 2/7 |
| B | `json_object` + one retry on empty answer | 4/7 | 3/7 |
| C1 | No `response_format` (final) | 7/7 | 5/7 |
| C2 | No `response_format` (final) | 7/7 | 3/7 |
| C3 | No `response_format` (final) | 6/7 | 3/7 |

Runs C1 to C3 use the same code and inputs. The only difference is the model's answers, which still vary at temperature 0.

## What went wrong in A and B, and what we did

Most of A and B was rejected because the model answered `{}` (all four fields missing). The first diagnosis was "intermittent provider glitch", and a retry was added (run B). It barely helped, so the cause was measured instead of assumed: 5 calls on the same fixture with `json_object` mode returned `{}` 5 out of 5 times, and 5 calls without `response_format` returned all four fields 5 out of 5 times. The retry was removed and the parameter dropped. The validator already checks that the answer is valid JSON, so nothing was lost.

No label, fixture or prompt wording was changed to improve the numbers. The only edit to fixtures was correcting the test name in fixtures 04 and 05 to match the test where each failure really happened.

## Final configuration, per fixture (3 runs)

| Fixture | Expected | Run 1 | Run 2 | Run 3 |
|---|---|---|---|---|
| 01 line items too broad | test_code_issue | correct | correct | correct |
| 02 quantity spinner slow | timing_or_race | test_code_issue | test_code_issue | rejected by validator |
| 03 first card changed | timing_or_race | correct | correct | correct |
| 04 confirm pointer events | test_code_issue | timing_or_race | timing_or_race | timing_or_race |
| 05 disabled combobox | test_code_issue | correct | timing_or_race | timing_or_race |
| 06 timeout, no cause | undetermined | correct | timing_or_race | timing_or_race |
| 07 cloudflare block | site_or_environment | correct | correct | correct |

## What the numbers say

- Stable and correct in 3 of 3 runs: fixtures 01, 03 and 07.
- Wrong in every run: 04 and 02. Fixture 04 is the most telling: the model proposes a timing problem, while the real cause is that the site blocks the button with CSS only and the test tried to click it.
- Fixture 06 contains almost no information (a bare 60 s timeout). The right answer is `undetermined`, and the model gave it only once in three runs. In the other two it guessed `timing_or_race`. This is the strongest reason the tool only proposes and a person decides.
- When the validator rejected an answer (run 3, fixture 02), it did its job: the answer was discarded and never shown as valid.
- There is no real `product_bug` fixture. None of our automated failures was a product defect, so that category is not evaluated.
