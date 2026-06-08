# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-08T13:05:07.773Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name                            | Kind   | Median   | P95      | Baseline Median | Allowed Median |
| ------------------------------- | ------ | -------- | -------- | --------------- | -------------- |
| logic.cnMerge                   | logic  | 0.002ms  | 0.005ms  | 0.002ms         | 0.752ms        |
| logic.dataGridFilter1000Rows    | logic  | 1.456ms  | 1.666ms  | 1.479ms         | 2.229ms        |
| logic.queryBuilderEvaluate1000  | logic  | 0.331ms  | 0.404ms  | 0.324ms         | 1.074ms        |
| render.assetBrowser500          | render | 42.982ms | 57.561ms | 47.730ms        | 66.821ms       |
| render.calendar100Events        | render | 10.814ms | 11.481ms | 10.450ms        | 15.450ms       |
| render.dataGrid100              | render | 5.972ms  | 10.030ms | 6.928ms         | 11.928ms       |
| render.dataGrid1000             | render | 9.281ms  | 13.801ms | 9.465ms         | 14.465ms       |
| render.dataGrid500Rows10Columns | render | 9.480ms  | 13.569ms | 10.699ms        | 15.699ms       |
| render.documentViewer100Pages   | render | 9.658ms  | 12.617ms | 8.540ms         | 13.540ms       |
| render.gantt250                 | render | 28.333ms | 31.851ms | 29.648ms        | 41.507ms       |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: none
