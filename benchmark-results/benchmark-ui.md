# Benchmark Results

- Command: `bun run bench`
- Status: `passed`
- Timestamp: `2026-06-06T19:35:46.946Z`
- Platform: `linux-x64`
- CI: `false`
- Baseline: `bench/baselines/linux-x64.json`

## Benchmarks

| Name | Kind | Median | P95 | Baseline Median | Allowed Median |
| --- | --- | --- | --- | --- | --- |
| logic.cnMerge | logic | 0.004ms | 0.011ms | 0.002ms | 0.752ms |
| logic.dataGridFilter1000Rows | logic | 1.472ms | 1.650ms | 1.479ms | 2.229ms |
| logic.queryBuilderEvaluate1000 | logic | 0.327ms | 0.635ms | 0.324ms | 1.074ms |
| render.assetBrowser500 | render | 41.588ms | 55.122ms | 47.730ms | 66.821ms |
| render.calendar100Events | render | 11.825ms | 14.341ms | 10.450ms | 15.450ms |
| render.dataGrid100 | render | 5.601ms | 7.408ms | 6.928ms | 11.928ms |
| render.dataGrid1000 | render | 9.859ms | 12.939ms | 9.465ms | 14.465ms |
| render.dataGrid500Rows10Columns | render | 10.620ms | 12.968ms | 10.699ms | 15.699ms |
| render.documentViewer100Pages | render | 9.254ms | 19.110ms | 8.540ms | 13.540ms |
| render.gantt250 | render | 27.866ms | 29.427ms | 29.648ms | 41.507ms |

## Failures

No benchmark failures.

## Baseline Hygiene

- Missing baseline entries: none
- Stale baseline entries: `logic.timelineHelpers1000`, `logic.workflowBuilderConnectionValidity1000`, `logic.workflowConnectionValidation`, `render.workflowBuilder50Nodes80Edges`
