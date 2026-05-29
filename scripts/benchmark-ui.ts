import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { JSDOM } from "jsdom";
import * as React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

type BenchmarkKind = "logic" | "render";
type BenchmarkResult = {
  kind: BenchmarkKind;
  name: string;
  median: number;
  p95: number;
};
type BenchmarkRunner = (() => BenchmarkResult) & {
  benchmarkName: string;
};
type UiModule = Record<string, any>;
type BenchmarkBaseline = {
  results?: Record<string, BenchmarkResult>;
};
type BenchmarkFailure = {
  allowedMedian: number;
  baseline: BenchmarkResult;
  name: string;
  result: BenchmarkResult;
};
type BenchmarkOrgChartNode = {
  id: string;
  label: string;
  description: string;
  children: BenchmarkOrgChartNode[];
};

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(
  packageRoot,
  "bench",
  "baselines",
  `${process.platform}-${process.arch}.json`,
);
const updateBaseline = process.argv.includes("--update");
const distEntry = path.join(packageRoot, "dist", "index.js");
const labsEntry = path.join(packageRoot, "dist", "labs.js");
const runningInCi = process.env.CI === "true";

if (!existsSync(distEntry)) {
  console.error("@moritzbrantner/ui benchmark requires dist/. Run `bun run build` first.");
  process.exit(1);
}

const ui = (await import(distEntry)) as UiModule;
const labs = (await import(labsEntry)) as UiModule;
const benchmarks: BenchmarkRunner[] = [
  benchmark("logic.cnMerge", "logic", () => {
    ui.cn(
      "px-2 py-1 text-sm bg-card text-foreground",
      "px-4",
      false && "hidden",
      "data-[state=open]:bg-accent",
    );
  }),
  benchmark("logic.queryBuilderEvaluate1000", "logic", () => {
    const fields = [
      { id: "name", label: "Name", type: "text" },
      { id: "score", label: "Score", type: "number" },
      { id: "status", label: "Status", type: "select" },
    ];
    const expression = {
      id: "root",
      combinator: "and",
      rules: [
        { id: "name", fieldId: "name", operator: "contains", value: "alpha" },
        { id: "score", fieldId: "score", operator: "gte", value: 500 },
        {
          id: "group",
          combinator: "or",
          rules: [
            { id: "ready", fieldId: "status", operator: "eq", value: "ready" },
            { id: "blocked", fieldId: "status", operator: "neq", value: "archived" },
          ],
        },
      ],
    };
    const rows = Array.from({ length: 1000 }, (_, index) => ({
      name: index % 2 === 0 ? `alpha-${index}` : `beta-${index}`,
      score: index,
      status: index % 3 === 0 ? "ready" : "blocked",
    }));

    for (const row of rows) {
      labs.evaluateQueryBuilderExpression(expression, row, fields);
    }
  }),
  benchmark("logic.dataGridFilter1000Rows", "logic", () => {
    const rows = createRows(1000);

    rows.filter((row) =>
      [row.name, row.amount, row.status].join(" ").toLocaleLowerCase().includes("paid"),
    );
  }),
  benchmark("render.dataGrid100", "render", () => {
    renderUi(
      React.createElement(ui.DataGrid, {
        columns: [
          { accessorKey: "name", header: "Name" },
          { accessorKey: "amount", header: "Amount" },
          { accessorKey: "status", header: "Status" },
        ],
        data: createRows(100),
      }),
    );
  }),
  benchmark("render.dataGrid1000", "render", () => {
    renderUi(
      React.createElement(ui.DataGrid, {
        columns: [
          { accessorKey: "name", header: "Name" },
          { accessorKey: "amount", header: "Amount" },
          { accessorKey: "status", header: "Status" },
        ],
        data: createRows(1000),
      }),
    );
  }),
  benchmark("render.dataGrid500Rows10Columns", "render", () => {
    renderUi(
      React.createElement(ui.DataGrid, {
        columns: Array.from({ length: 10 }, (_, index) => ({
          accessorKey: `field${index}`,
          header: `Field ${index}`,
          meta: { dataGridFilter: index % 2 === 0 ? "text" : "number" },
        })),
        data: Array.from({ length: 500 }, (_, rowIndex) =>
          Object.fromEntries(
            Array.from({ length: 10 }, (_, columnIndex) => [
              `field${columnIndex}`,
              columnIndex % 2 === 0 ? `Row ${rowIndex}` : rowIndex * columnIndex,
            ]),
          ),
        ),
      }),
    );
  }),
  benchmark("render.calendar100Events", "render", () => {
    renderUi(
      React.createElement(ui.Calendar, {
        defaultMonth: new Date(2026, 3, 1),
        mode: "single",
        showOutsideDays: false,
        icsData: createCalendarData(100),
      }),
    );
  }),
  benchmark("render.documentViewer100Pages", "render", () => {
    renderUi(
      React.createElement(labs.DocumentViewer, {
        pages: Array.from({ length: 100 }, (_, index) => ({
          id: `page-${index + 1}`,
          pageNumber: index + 1,
          width: 300,
          height: 420,
          text: `Invoice page ${index + 1} includes revenue and exception details.`,
        })),
      }),
    );
  }),
  benchmark("render.assetBrowser500", "render", () => {
    renderUi(
      React.createElement(labs.AssetBrowser, {
        items: createAssetBrowserItems(500),
        selectionMode: "multiple",
        virtualized: true,
      }),
    );
  }),
  benchmark("render.gantt250", "render", () => {
    renderUi(
      React.createElement(labs.Gantt, {
        tasks: createGanttTasks(250),
        showDependencyLines: true,
        virtualized: true,
      }),
    );
  }),
  benchmark("render.orgChart340", "render", () => {
    renderUi(
      React.createElement(ui.OrgChart, {
        nodes: createOrgChartNodes(4, 4),
        defaultExpandedDepth: 1,
        maxRenderedNodes: 120,
      }),
    );
  }),
];

const results: Record<string, BenchmarkResult> = {};

for (const runBenchmark of benchmarks) {
  const result = runBenchmark();
  results[result.name] = result;
  console.log(
    `${result.name}: median ${result.median.toFixed(3)}ms, p95 ${result.p95.toFixed(3)}ms`,
  );
}

if (updateBaseline) {
  mkdirSync(path.dirname(baselinePath), { recursive: true });
  writeFileSync(`${baselinePath}`, `${JSON.stringify({ results }, null, 2)}\n`);
  console.log(`Updated benchmark baseline: ${path.relative(packageRoot, baselinePath)}`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error(`Missing benchmark baseline ${path.relative(packageRoot, baselinePath)}.`);
  console.error("Run `bun run bench:update` after reviewing the current benchmark results.");
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8")) as BenchmarkBaseline;
let failures = getBenchmarkFailures(results, baseline);

if (failures.length > 0) {
  console.warn(
    `@moritzbrantner/ui benchmark retry: rerunning ${failures.length} failed benchmark${failures.length === 1 ? "" : "s"} once to filter transient host load.`,
  );

  for (const failure of failures) {
    const runner = benchmarks.find((runBenchmark) => runBenchmark.benchmarkName === failure.name);

    if (!runner) {
      continue;
    }

    const retryResult = runner();
    const bestResult = retryResult.median < failure.result.median ? retryResult : failure.result;
    results[failure.name] = bestResult;
    console.warn(
      `${failure.name}: retry median ${retryResult.median.toFixed(3)}ms, keeping ${bestResult.median.toFixed(3)}ms`,
    );
  }

  failures = getBenchmarkFailures(results, baseline);
}

if (failures.length > 0) {
  console.error("@moritzbrantner/ui benchmark verification failed:");

  for (const failure of failures) {
    console.error(
      `- ${failure.name}: median ${failure.result.median.toFixed(3)}ms exceeds allowed ${failure.allowedMedian.toFixed(3)}ms`,
    );
  }

  process.exit(1);
}

console.log("@moritzbrantner/ui benchmarks verified");

function benchmark(name: string, kind: BenchmarkKind, callback: () => void): BenchmarkRunner {
  const runBenchmark = () => {
    const samples: number[] = [];

    for (let index = 0; index < 5; index += 1) {
      callback();
    }

    for (let index = 0; index < 30; index += 1) {
      const start = performance.now();
      callback();
      samples.push(performance.now() - start);
    }

    samples.sort((left, right) => left - right);

    return {
      kind,
      name,
      median: percentile(samples, 0.5),
      p95: percentile(samples, 0.95),
    };
  };

  return Object.assign(runBenchmark, { benchmarkName: name });
}

function getBenchmarkFailures(
  currentResults: Record<string, BenchmarkResult>,
  baseline: BenchmarkBaseline,
): BenchmarkFailure[] {
  const failures: BenchmarkFailure[] = [];

  for (const [name, result] of Object.entries(currentResults)) {
    const baselineResult = baseline.results?.[name];

    if (!baselineResult) {
      failures.push({
        allowedMedian: 0,
        baseline: {
          kind: result.kind,
          name,
          median: 0,
          p95: 0,
        },
        name,
        result,
      });
      continue;
    }

    const allowedMedian = getAllowedMedian(result, baselineResult);

    if (result.median > allowedMedian) {
      failures.push({ allowedMedian, baseline: baselineResult, name, result });
    }
  }

  return failures;
}

function getAllowedMedian(result: BenchmarkResult, baselineResult: BenchmarkResult): number {
  const tolerance = result.kind === "logic" ? (runningInCi ? 2 : 1.25) : runningInCi ? 2.5 : 1.4;
  const noiseFloorMs = result.kind === "logic" ? (runningInCi ? 1.5 : 0.75) : runningInCi ? 20 : 5;

  return Math.max(baselineResult.median * tolerance, baselineResult.median + noiseFloorMs);
}

function renderUi(element: React.ReactElement): void {
  const document = ensureDomGlobals().document;
  const container = document.createElement("div");

  document.body.append(container);

  const root = createRoot(container);

  flushSync(() => {
    root.render(element);
  });
  flushSync(() => {
    root.unmount();
  });

  container.remove();
}

function ensureDomGlobals(): Window & typeof globalThis {
  if (globalThis.window?.document) {
    return globalThis.window;
  }

  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    pretendToBeVisual: true,
    url: "http://127.0.0.1/",
  });

  defineGlobal("window", dom.window);
  defineGlobal("document", dom.window.document);
  defineGlobal("navigator", dom.window.navigator);
  defineGlobal("HTMLElement", dom.window.HTMLElement);
  defineGlobal("Element", dom.window.Element);

  return dom.window as unknown as Window & typeof globalThis;
}

function defineGlobal(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, {
    configurable: true,
    enumerable: false,
    value,
    writable: true,
  });
}

function createRows(count: number): Array<{ name: string; amount: number; status: string }> {
  return Array.from({ length: count }, (_, index) => ({
    name: `Account ${index}`,
    amount: index * 37,
    status: index % 2 === 0 ? "paid" : "pending",
  }));
}

function createCalendarData(count: number): unknown[] {
  return [
    "vcalendar",
    [
      ["version", {}, "text", "2.0"],
      ["prodid", {}, "text", "-//platform-packages//UI Benchmark//EN"],
    ],
    Array.from({ length: count }, (_, index) => [
      "vevent",
      [
        ["uid", {}, "text", `event-${index}`],
        ["summary", {}, "text", `Event ${index}`],
        ["dtstart", {}, "date", `2026-04-${String((index % 28) + 1).padStart(2, "0")}`],
        ["dtend", {}, "date", `2026-04-${String((index % 28) + 2).padStart(2, "0")}`],
      ],
      [],
    ]),
  ];
}

function createWorkflowNodes(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `node-${index}`,
    label: `Node ${index}`,
    x: (index % 10) * 220,
    y: Math.floor(index / 10) * 140,
    inputs: [{ id: "in", label: "Input", kind: "text" }],
    outputs: [{ id: "out", label: "Output", kind: "text" }],
  }));
}

function createWorkflowEdges(count: number, nodeCount: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `edge-${index}`,
    sourceNodeId: `node-${index % Math.max(nodeCount - 1, 1)}`,
    sourcePortId: "out",
    targetNodeId: `node-${(index + 1) % nodeCount}`,
    targetPortId: "in",
  }));
}

function createAssetBrowserItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `asset-${index}`,
    name: `Asset ${index}`,
    type: index % 2 === 0 ? "image" : "document",
    mimeType: index % 2 === 0 ? "image/png" : "application/pdf",
    description: `Asset ${index} package artifact`,
    size: 1024 + index * 37,
  }));
}

function createGanttTasks(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const startDay = (index % 28) + 1;
    const endDay = Math.min(startDay + 2, 28);

    return {
      id: `task-${index}`,
      label: `Task ${index}`,
      start: `2026-04-${String(startDay).padStart(2, "0")}`,
      end: `2026-04-${String(endDay).padStart(2, "0")}`,
      progress: index % 100,
      dependencies: index > 0 ? [`task-${index - 1}`] : [],
    };
  });
}

function createOrgChartNodes(
  depth: number,
  breadth: number,
  prefix = "node",
): BenchmarkOrgChartNode[] {
  if (depth === 0) {
    return [];
  }

  return Array.from({ length: breadth }, (_, index) => {
    const id = `${prefix}-${index}`;

    return {
      id,
      label: `Node ${id}`,
      description: "Team member",
      children: createOrgChartNodes(depth - 1, breadth, id),
    };
  });
}

function percentile(samples: number[], value: number): number {
  const index = Math.min(samples.length - 1, Math.floor(samples.length * value));

  return samples[index] ?? 0;
}
