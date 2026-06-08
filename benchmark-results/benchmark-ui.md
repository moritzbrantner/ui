# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-08T13:34:09.971Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name | Kind | Median | P95 | Baseline Median | Allowed Median |
| --- | --- | --- | --- | --- | --- |
| logic.cnMerge | logic | 0.002ms | 0.005ms | 0.002ms | 0.752ms |
| logic.dataGridFilter1000Rows | logic | 1.462ms | 1.656ms | 1.479ms | 2.229ms |
| logic.queryBuilderEvaluate1000 | logic | 0.328ms | 0.398ms | 0.324ms | 1.074ms |
| render.assetBrowser500 | render | 41.048ms | 48.158ms | 47.730ms | 66.821ms |
| render.calendar100Events | render | 10.481ms | 12.592ms | 10.450ms | 15.450ms |
| render.dataGrid100 | render | 4.873ms | 8.381ms | 6.928ms | 11.928ms |
| render.dataGrid1000 | render | 8.771ms | 13.354ms | 9.465ms | 14.465ms |
| render.dataGrid500Rows10Columns | render | 8.930ms | 15.251ms | 10.699ms | 15.699ms |
| render.documentViewer100Pages | render | 9.127ms | 11.240ms | 8.540ms | 13.540ms |
| render.gantt250 | render | 27.182ms | 30.294ms | 29.648ms | 41.507ms |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: none
