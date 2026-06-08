# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-08T16:05:28.121Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name                            | Kind   | Median   | P95      | Baseline Median | Allowed Median |
| ------------------------------- | ------ | -------- | -------- | --------------- | -------------- |
| logic.cnMerge                   | logic  | 0.002ms  | 0.011ms  | 0.002ms         | 0.752ms        |
| logic.dataGridFilter1000Rows    | logic  | 1.456ms  | 2.343ms  | 1.479ms         | 2.229ms        |
| logic.queryBuilderEvaluate1000  | logic  | 0.325ms  | 0.584ms  | 0.324ms         | 1.074ms        |
| render.assetBrowser500          | render | 50.402ms | 66.143ms | 47.730ms        | 66.821ms       |
| render.calendar100Events        | render | 10.635ms | 14.039ms | 10.450ms        | 15.450ms       |
| render.dataGrid100              | render | 5.051ms  | 8.712ms  | 6.928ms         | 11.928ms       |
| render.dataGrid1000             | render | 9.465ms  | 14.646ms | 9.465ms         | 14.465ms       |
| render.dataGrid500Rows10Columns | render | 10.103ms | 12.139ms | 10.699ms        | 15.699ms       |
| render.documentViewer100Pages   | render | 9.733ms  | 15.341ms | 8.540ms         | 13.540ms       |
| render.gantt250                 | render | 30.439ms | 36.532ms | 29.648ms        | 41.507ms       |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: none
