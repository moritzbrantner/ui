# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-09T13:36:45.599Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name                            | Kind   | Median   | P95      | Baseline Median | Allowed Median |
| ------------------------------- | ------ | -------- | -------- | --------------- | -------------- |
| logic.cnMerge                   | logic  | 0.002ms  | 0.007ms  | 0.002ms         | 0.752ms        |
| logic.dataGridFilter1000Rows    | logic  | 1.478ms  | 1.735ms  | 1.479ms         | 2.229ms        |
| logic.queryBuilderEvaluate1000  | logic  | 0.337ms  | 0.492ms  | 0.324ms         | 1.074ms        |
| render.assetBrowser500          | render | 44.675ms | 63.640ms | 47.730ms        | 66.821ms       |
| render.calendar100Events        | render | 11.657ms | 17.942ms | 10.450ms        | 15.450ms       |
| render.dataGrid100              | render | 5.820ms  | 10.461ms | 6.928ms         | 11.928ms       |
| render.dataGrid1000             | render | 9.801ms  | 18.791ms | 9.465ms         | 14.465ms       |
| render.dataGrid500Rows10Columns | render | 9.405ms  | 10.921ms | 10.699ms        | 15.699ms       |
| render.documentViewer100Pages   | render | 11.357ms | 16.844ms | 8.540ms         | 13.540ms       |
| render.gantt250                 | render | 28.974ms | 43.538ms | 29.648ms        | 41.507ms       |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: none
