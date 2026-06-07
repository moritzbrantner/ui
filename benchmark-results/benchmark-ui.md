# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-06T21:41:23.073Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name                            | Kind   | Median   | P95       | Baseline Median | Allowed Median |
| ------------------------------- | ------ | -------- | --------- | --------------- | -------------- |
| logic.cnMerge                   | logic  | 0.004ms  | 0.035ms   | 0.002ms         | 0.752ms        |
| logic.dataGridFilter1000Rows    | logic  | 1.471ms  | 1.531ms   | 1.479ms         | 2.229ms        |
| logic.queryBuilderEvaluate1000  | logic  | 0.647ms  | 1.489ms   | 0.324ms         | 1.074ms        |
| render.assetBrowser500          | render | 45.279ms | 120.269ms | 47.730ms        | 66.821ms       |
| render.calendar100Events        | render | 8.408ms  | 14.609ms  | 10.450ms        | 15.450ms       |
| render.dataGrid100              | render | 3.073ms  | 5.706ms   | 6.928ms         | 11.928ms       |
| render.dataGrid1000             | render | 6.538ms  | 9.288ms   | 9.465ms         | 14.465ms       |
| render.dataGrid500Rows10Columns | render | 6.785ms  | 7.382ms   | 10.699ms        | 15.699ms       |
| render.documentViewer100Pages   | render | 6.869ms  | 7.668ms   | 8.540ms         | 13.540ms       |
| render.gantt250                 | render | 28.184ms | 32.867ms  | 29.648ms        | 41.507ms       |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: none
