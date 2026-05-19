"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import type { TooltipValueType } from "recharts";

import { cn } from "../lib/cn";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

const INITIAL_DIMENSION = { width: 320, height: 200 } as const;
const GRAPH_VIEWBOX = { width: 640, height: 320 } as const;
const GRAPH_PADDING = { top: 20, right: 24, bottom: 44, left: 48 } as const;
const GRAPH_SCROLL_POINT_WIDTH = 48;
const GRAPH_TOOLTIP_WIDTH = 184;
const GRAPH_TOOLTIP_ROW_HEIGHT = 22;
type TooltipNameType = number | string;
type ChartDatumValue = number | string | null | undefined;

type ChartDatum = Record<string, ChartDatumValue>;

type ChartSeries = {
  key: string;
  label?: React.ReactNode;
  color?: string;
  className?: string;
};

type ChartPretextItem = {
  id?: string;
  x: number | string;
  y: number | string;
  children: React.ReactNode;
  className?: string;
  textAnchor?: React.ComponentProps<"text">["textAnchor"];
  dominantBaseline?: React.ComponentProps<"text">["dominantBaseline"];
};

type ChartGraphProps = Omit<React.ComponentProps<"figure">, "children"> & {
  data: ChartDatum[];
  series: ChartSeries[];
  xKey?: string;
  ariaLabel?: string;
  caption?: React.ReactNode;
  emptyMessage?: React.ReactNode;
  height?: number;
  width?: number;
  yDomain?: [number, number];
  yTickCount?: number;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  scrollable?: boolean;
  scrollPointWidth?: number;
  formatLabel?: (value: ChartDatumValue, datum: ChartDatum, index: number) => React.ReactNode;
  formatValue?: (value: number) => React.ReactNode;
  pretext?: ChartPretextItem[];
};

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = INITIAL_DIMENSION,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"];
  initialDimension?: {
    width: number;
    height: number;
  };
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme ?? config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  } & Omit<
    RechartsPrimitive.DefaultTooltipContentProps<TooltipValueType, TooltipNameType>,
    "accessibilityLayer"
  >) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>{labelFormatter(value, payload)}</div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color ?? item.payload?.fill ?? item.color;

            return (
              <div
                key={index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label ?? item.name}
                        </span>
                      </div>
                      {item.value != null && (
                        <span className="font-mono font-medium text-foreground tabular-nums">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : String(item.value)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & {
  hideIcon?: boolean;
  nameKey?: string;
} & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
              )}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

function ChartPretext({ className, ...props }: React.ComponentProps<"g">) {
  return (
    <g
      data-slot="chart-pretext"
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none fill-muted-foreground text-[10px] tabular-nums",
        className,
      )}
      {...props}
    />
  );
}

function ChartPretextText({
  className,
  children,
  dominantBaseline = "middle",
  textAnchor = "middle",
  ...props
}: React.ComponentProps<"text">) {
  return (
    <text
      data-slot="chart-pretext-text"
      dominantBaseline={dominantBaseline}
      textAnchor={textAnchor}
      className={cn("font-medium", className)}
      {...props}
    >
      {children}
    </text>
  );
}

function ChartLineGraph(props: ChartGraphProps) {
  return <ChartGraph graph="line" xScale="point" ariaLabel="Line chart" {...props} />;
}

function ChartAreaGraph(props: ChartGraphProps) {
  return (
    <ChartGraph graph="area" xScale="point" includeZero ariaLabel="Area chart" {...props} />
  );
}

function ChartBarGraph(props: ChartGraphProps) {
  return <ChartGraph graph="bar" xScale="band" includeZero ariaLabel="Bar chart" {...props} />;
}

function ChartGraph({
  graph,
  includeZero = false,
  xScale,
  data,
  series,
  xKey = "label",
  ariaLabel,
  caption,
  emptyMessage = "No chart data.",
  height = GRAPH_VIEWBOX.height,
  width = GRAPH_VIEWBOX.width,
  yDomain,
  yTickCount = 5,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  interactive = true,
  scrollable,
  scrollPointWidth = GRAPH_SCROLL_POINT_WIDTH,
  formatLabel = defaultFormatLabel,
  formatValue = defaultFormatValue,
  pretext,
  className,
  ...props
}: ChartGraphProps & {
  graph: "area" | "bar" | "line";
  includeZero?: boolean;
  xScale: "band" | "point";
}) {
  const shouldScroll = scrollable ?? data.length > 12;
  const chartWidth = shouldScroll
    ? Math.max(width, GRAPH_PADDING.left + GRAPH_PADDING.right + data.length * scrollPointWidth)
    : width;
  const layout = getChartLayout({ width: chartWidth, height });
  const domain = getValueDomain(data, series, yDomain, includeZero);
  const yTicks = getTicks(domain, yTickCount);
  const slot = `chart-${graph}-graph`;
  const hasData = data.length > 0 && series.length > 0;
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const activeDatum = activeIndex == null ? null : data[activeIndex];
  const activeX =
    activeIndex == null
      ? null
      : xScale === "band"
        ? getBandCenterX(layout, data.length, activeIndex)
        : getPointX(layout, data.length, activeIndex);
  const activeValues =
    activeDatum && activeIndex != null
      ? series.map((item, index) => {
          const value = getNumericValue(activeDatum[item.key]);

          return {
            key: item.key,
            label: item.label ?? item.key,
            color: getSeriesColor(item, index),
            value,
            displayValue: value == null ? "No data" : formatValue(value),
          };
        })
      : [];

  return (
    <figure data-slot={slot} className={cn("grid gap-2", className)} {...props}>
      {hasData ? (
        <>
          <div
            data-slot="chart-scroll-area"
            className={cn(
              "overflow-x-auto overflow-y-visible",
              shouldScroll && "pb-2 [scrollbar-width:thin]",
            )}
          >
            <div
              data-slot="chart-scroll-content"
              className="relative"
              style={{ minWidth: shouldScroll ? chartWidth : undefined }}
            >
              <svg
                role="img"
                aria-label={ariaLabel}
                viewBox={`0 0 ${chartWidth} ${height}`}
                className="h-auto w-full overflow-visible"
                onPointerLeave={() => setActiveIndex(null)}
              >
                {showGrid ? (
                  <ChartGridLines layout={layout} ticks={yTicks} domain={domain} />
                ) : null}
                <ChartAxes
                  data={data}
                  domain={domain}
                  formatLabel={formatLabel}
                  formatValue={formatValue}
                  layout={layout}
                  showXAxis={showXAxis}
                  showYAxis={showYAxis}
                  ticks={yTicks}
                  xKey={xKey}
                  xScale={xScale}
                />
                <ChartGraphPretext pretext={pretext} />
                <g data-slot={`${slot}-series`}>
                  {graph === "line"
                    ? renderLineGraphSeries(data, series, layout, domain, activeIndex)
                    : graph === "area"
                      ? renderAreaGraphSeries(data, series, layout, domain, activeIndex)
                      : renderBarGraphSeries(data, series, layout, domain, activeIndex)}
                </g>
                {interactive ? (
                  <ChartInteractionLayer
                    activeIndex={activeIndex}
                    activeValues={activeValues}
                    activeX={activeX}
                    ariaLabel={ariaLabel}
                    data={data}
                    domain={domain}
                    formatLabel={formatLabel}
                    layout={layout}
                    onActiveIndexChange={setActiveIndex}
                    series={series}
                    xKey={xKey}
                    xScale={xScale}
                  />
                ) : null}
              </svg>
            </div>
          </div>
          {showLegend ? <ChartGraphLegend series={series} /> : null}
        </>
      ) : (
        <div
          role="img"
          aria-label={ariaLabel}
          className="flex min-h-40 items-center justify-center border border-dashed text-sm text-muted-foreground"
        >
          {emptyMessage}
        </div>
      )}
      {caption ? (
        <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

function ChartGraphPretext({ pretext }: { pretext?: ChartPretextItem[] }) {
  return (
    <ChartPretext>
      {pretext?.map((item, index) => (
        <ChartPretextText
          key={item.id ?? index}
          x={item.x}
          y={item.y}
          className={item.className}
          textAnchor={item.textAnchor}
          dominantBaseline={item.dominantBaseline}
        >
          {item.children}
        </ChartPretextText>
      ))}
    </ChartPretext>
  );
}

function renderLineGraphSeries(
  data: ChartDatum[],
  series: ChartSeries[],
  layout: ChartLayout,
  domain: [number, number],
  activeIndex: number | null,
) {
  return series.map((item, index) => {
    const color = getSeriesColor(item, index);
    const points = data
      .map((datum, datumIndex) => {
        const value = getNumericValue(datum[item.key]);

        if (value == null) {
          return null;
        }

        return {
          index: datumIndex,
          x: getPointX(layout, data.length, datumIndex),
          y: scaleY(layout, domain, value),
        };
      })
      .filter((point): point is { index: number; x: number; y: number } => point !== null);

    return (
      <g key={item.key} data-slot="chart-line-graph-line">
        <path
          d={getLinePath(points)}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          className={item.className}
          opacity={activeIndex == null ? undefined : 0.72}
        />
        {points.map((point, pointIndex) => (
          <circle
            key={pointIndex}
            cx={point.x}
            cy={point.y}
            r={activeIndex === point.index ? 4 : 3}
            fill="var(--background)"
            stroke={color}
            strokeWidth={activeIndex === point.index ? 2 : 1.5}
          />
        ))}
      </g>
    );
  });
}

function renderAreaGraphSeries(
  data: ChartDatum[],
  series: ChartSeries[],
  layout: ChartLayout,
  domain: [number, number],
  activeIndex: number | null,
) {
  const baseline = scaleY(layout, domain, 0);

  return series.map((item, index) => {
    const color = getSeriesColor(item, index);
    const points = data
      .map((datum, datumIndex) => {
        const value = getNumericValue(datum[item.key]);

        if (value == null) {
          return null;
        }

        return {
          index: datumIndex,
          x: getPointX(layout, data.length, datumIndex),
          y: scaleY(layout, domain, value),
        };
      })
      .filter((point): point is { index: number; x: number; y: number } => point !== null);

    return (
      <g key={item.key} data-slot="chart-area-graph-area">
        <path
          d={getAreaPath(points, baseline)}
          fill={color}
          fillOpacity={index === 0 ? 0.24 : 0.14}
          className={item.className}
        />
        <path
          d={getLinePath(points)}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          opacity={activeIndex == null ? undefined : 0.78}
        />
        {points.map((point, pointIndex) => (
          <circle
            key={pointIndex}
            cx={point.x}
            cy={point.y}
            r={activeIndex === point.index ? 4 : 0}
            fill="var(--background)"
            stroke={color}
            strokeWidth={2}
          />
        ))}
      </g>
    );
  });
}

function renderBarGraphSeries(
  data: ChartDatum[],
  series: ChartSeries[],
  layout: ChartLayout,
  domain: [number, number],
  activeIndex: number | null,
) {
  const bandWidth = layout.plotWidth / data.length;
  const groupWidth = bandWidth * 0.68;
  const barWidth = groupWidth / Math.max(series.length, 1);

  return data.map((datum, datumIndex) => {
    const groupX = layout.left + bandWidth * datumIndex + (bandWidth - groupWidth) / 2;

    return series.map((item, seriesIndex) => {
      const value = getNumericValue(datum[item.key]) ?? 0;
      const y = scaleY(layout, domain, value);
      const zeroY = scaleY(layout, domain, 0);

      return (
        <rect
          key={`${datumIndex}-${item.key}`}
          data-slot="chart-bar-graph-bar"
          x={groupX + barWidth * seriesIndex}
          y={Math.min(y, zeroY)}
          width={Math.max(barWidth - 3, 1)}
          height={Math.abs(zeroY - y)}
          fill={getSeriesColor(item, seriesIndex)}
          className={item.className}
          opacity={activeIndex == null || activeIndex === datumIndex ? undefined : 0.35}
        />
      );
    });
  });
}

function ChartInteractionLayer({
  activeIndex,
  activeValues,
  activeX,
  ariaLabel,
  data,
  domain,
  formatLabel,
  layout,
  onActiveIndexChange,
  series,
  xKey,
  xScale,
}: {
  activeIndex: number | null;
  activeValues: Array<{
    key: string;
    label: React.ReactNode;
    color: string;
    value: number | null;
    displayValue: React.ReactNode;
  }>;
  activeX: number | null;
  ariaLabel?: string;
  data: ChartDatum[];
  domain: [number, number];
  formatLabel: (value: ChartDatumValue, datum: ChartDatum, index: number) => React.ReactNode;
  layout: ChartLayout;
  onActiveIndexChange: (index: number | null) => void;
  series: ChartSeries[];
  xKey: string;
  xScale: "band" | "point";
}) {
  const activeDatum = activeIndex == null ? null : data[activeIndex];
  const activeLabel =
    activeDatum && activeIndex != null
      ? formatLabel(activeDatum[xKey], activeDatum, activeIndex)
      : null;
  const activeY =
    activeDatum == null
      ? null
      : Math.min(
          ...series.flatMap((item) => {
            const value = getNumericValue(activeDatum[item.key]);

            return value == null ? [] : [scaleY(layout, domain, value)];
          }),
        );

  return (
    <g data-slot="chart-interaction-layer">
      {activeIndex != null && activeX != null ? (
        <line
          data-slot="chart-crosshair"
          x1={activeX}
          x2={activeX}
          y1={layout.top}
          y2={layout.bottom}
          className="stroke-border"
          strokeDasharray="4 4"
        />
      ) : null}
      {data.map((datum, index) => {
        const hitArea = getDatumHitArea(layout, data.length, index, xScale);
        const label = formatLabel(datum[xKey], datum, index);

        return (
          <rect
            key={index}
            data-slot="chart-hit-area"
            role="graphics-symbol"
            aria-label={`${ariaLabel ?? "Chart"} ${label}`}
            tabIndex={0}
            x={hitArea.x}
            y={layout.top}
            width={hitArea.width}
            height={layout.plotHeight}
            fill="transparent"
            className="cursor-crosshair outline-none"
            onFocus={() => onActiveIndexChange(index)}
            onBlur={() => onActiveIndexChange(null)}
            onPointerEnter={() => onActiveIndexChange(index)}
            onPointerMove={() => onActiveIndexChange(index)}
          />
        );
      })}
      {activeIndex != null && activeX != null && activeDatum ? (
        <ChartGraphTooltip
          label={activeLabel}
          layout={layout}
          values={activeValues}
          x={activeX}
          y={Number.isFinite(activeY) ? activeY : layout.top}
        />
      ) : null}
    </g>
  );
}

function ChartGraphTooltip({
  label,
  layout,
  values,
  x,
  y,
}: {
  label: React.ReactNode;
  layout: ChartLayout;
  values: Array<{
    key: string;
    label: React.ReactNode;
    color: string;
    value: number | null;
    displayValue: React.ReactNode;
  }>;
  x: number;
  y: number | null;
}) {
  const height = 34 + values.length * GRAPH_TOOLTIP_ROW_HEIGHT;
  const tooltipX = clamp(
    x - GRAPH_TOOLTIP_WIDTH / 2,
    layout.left,
    layout.right - GRAPH_TOOLTIP_WIDTH,
  );
  const preferredY = (y ?? layout.top) - height - 10;
  const tooltipY = clamp(preferredY, layout.top, Math.max(layout.top, layout.bottom - height));

  return (
    <foreignObject
      data-slot="chart-graph-tooltip"
      x={tooltipX}
      y={tooltipY}
      width={GRAPH_TOOLTIP_WIDTH}
      height={height}
      className="pointer-events-none overflow-visible"
    >
      <div className="grid gap-1 rounded-lg border border-border/70 bg-background/95 px-2.5 py-2 text-xs shadow-xl backdrop-blur">
        <div className="font-medium text-foreground">{label}</div>
        <div className="grid gap-1">
          {values.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="font-mono font-medium text-foreground tabular-nums">
                {item.displayValue}
              </span>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
}

type ChartLayout = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  plotWidth: number;
  plotHeight: number;
};

function getChartLayout({ width, height }: { width: number; height: number }): ChartLayout {
  const left = GRAPH_PADDING.left;
  const right = width - GRAPH_PADDING.right;
  const top = GRAPH_PADDING.top;
  const bottom = height - GRAPH_PADDING.bottom;

  return {
    width,
    height,
    left,
    right,
    top,
    bottom,
    plotWidth: right - left,
    plotHeight: bottom - top,
  };
}

function ChartGridLines({
  layout,
  ticks,
  domain,
}: {
  layout: ChartLayout;
  ticks: number[];
  domain: [number, number];
}) {
  return (
    <g data-slot="chart-grid" className="stroke-border/60">
      {ticks.map((tick) => {
        const y = scaleY(layout, domain, tick);

        return (
          <line
            key={tick}
            x1={layout.left}
            x2={layout.right}
            y1={y}
            y2={y}
            strokeDasharray="3 4"
          />
        );
      })}
    </g>
  );
}

function ChartAxes({
  data,
  domain,
  formatLabel,
  formatValue,
  layout,
  showXAxis,
  showYAxis,
  ticks,
  xKey,
  xScale,
}: {
  data: ChartDatum[];
  domain: [number, number];
  formatLabel: (value: ChartDatumValue, datum: ChartDatum, index: number) => React.ReactNode;
  formatValue: (value: number) => React.ReactNode;
  layout: ChartLayout;
  showXAxis: boolean;
  showYAxis: boolean;
  ticks: number[];
  xKey: string;
  xScale: "band" | "point";
}) {
  const xLabelStep = Math.max(1, Math.ceil(data.length / 6));

  return (
    <ChartPretext data-slot="chart-axes" className="fill-muted-foreground">
      {showYAxis
        ? ticks.map((tick) => (
            <ChartPretextText
              key={tick}
              x={layout.left - 10}
              y={scaleY(layout, domain, tick)}
              textAnchor="end"
            >
              {formatValue(tick)}
            </ChartPretextText>
          ))
        : null}
      {showXAxis
        ? data.map((datum, index) => {
            if (index % xLabelStep !== 0 && index !== data.length - 1) {
              return null;
            }

            return (
              <ChartPretextText
                key={index}
                x={
                  xScale === "band"
                    ? getBandCenterX(layout, data.length, index)
                    : getPointX(layout, data.length, index)
                }
                y={layout.bottom + 22}
                dominantBaseline="hanging"
              >
                {formatLabel(datum[xKey], datum, index)}
              </ChartPretextText>
            );
          })
        : null}
    </ChartPretext>
  );
}

function ChartGraphLegend({ series }: { series: ChartSeries[] }) {
  if (series.length <= 1) {
    return null;
  }

  return (
    <div data-slot="chart-graph-legend" className="flex flex-wrap items-center gap-4 text-xs">
      {series.map((item, index) => (
        <div key={item.key} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden="true"
            className="size-2 shrink-0"
            style={{ backgroundColor: getSeriesColor(item, index) }}
          />
          <span>{item.label ?? item.key}</span>
        </div>
      ))}
    </div>
  );
}

function getNumericValue(value: ChartDatumValue): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function getValueDomain(
  data: ChartDatum[],
  series: ChartSeries[],
  yDomain: [number, number] | undefined,
  includeZero: boolean,
): [number, number] {
  if (yDomain) {
    return normalizeDomain(yDomain);
  }

  const values = data.flatMap((datum) =>
    series.flatMap((item) => {
      const value = getNumericValue(datum[item.key]);

      return value == null ? [] : [value];
    }),
  );

  if (includeZero) {
    values.push(0);
  }

  if (!values.length) {
    return [0, 1];
  }

  return normalizeDomain([Math.min(...values), Math.max(...values)]);
}

function normalizeDomain([min, max]: [number, number]): [number, number] {
  if (min === max) {
    const offset = min === 0 ? 1 : Math.abs(min) * 0.1;

    return [min - offset, max + offset];
  }

  return [min, max];
}

function getTicks([min, max]: [number, number], tickCount: number): number[] {
  const count = Math.max(tickCount, 2);
  const step = (max - min) / (count - 1);

  return Array.from({ length: count }, (_, index) => min + step * index);
}

function scaleY(layout: ChartLayout, [min, max]: [number, number], value: number): number {
  return layout.bottom - ((value - min) / (max - min)) * layout.plotHeight;
}

function getPointX(layout: ChartLayout, dataLength: number, index: number): number {
  if (dataLength <= 1) {
    return layout.left + layout.plotWidth / 2;
  }

  return layout.left + (layout.plotWidth / (dataLength - 1)) * index;
}

function getBandCenterX(layout: ChartLayout, dataLength: number, index: number): number {
  if (dataLength <= 0) {
    return layout.left + layout.plotWidth / 2;
  }

  return layout.left + (layout.plotWidth / dataLength) * (index + 0.5);
}

function getLinePath(points: Array<{ x: number; y: number }>): string {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function getAreaPath(points: Array<{ x: number; y: number }>, baseline: number): string {
  if (!points.length) {
    return "";
  }

  const linePath = getLinePath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

function getDatumHitArea(
  layout: ChartLayout,
  dataLength: number,
  index: number,
  xScale: "band" | "point",
): { x: number; width: number } {
  if (xScale === "band") {
    const bandWidth = layout.plotWidth / dataLength;

    return {
      x: layout.left + bandWidth * index,
      width: bandWidth,
    };
  }

  const current = getPointX(layout, dataLength, index);
  const previous = index === 0 ? layout.left : getPointX(layout, dataLength, index - 1);
  const next = index === dataLength - 1 ? layout.right : getPointX(layout, dataLength, index + 1);
  const x = index === 0 ? layout.left : previous + (current - previous) / 2;
  const width =
    index === dataLength - 1 ? layout.right - x : next - (next - current) / 2 - x;

  return {
    x,
    width: Math.max(width, 1),
  };
}

function getSeriesColor(series: ChartSeries, index: number): string {
  return series.color ?? `var(--chart-${(index % 5) + 1})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function defaultFormatLabel(value: ChartDatumValue): React.ReactNode {
  return value == null ? "" : String(value);
}

function defaultFormatValue(value: number): React.ReactNode {
  return Number.isInteger(value)
    ? value.toLocaleString()
    : value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartAreaGraph,
  ChartBarGraph,
  ChartContainer,
  ChartLineGraph,
  ChartLegend,
  ChartLegendContent,
  ChartPretext,
  ChartPretextText,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
};
export type { ChartDatum, ChartDatumValue, ChartGraphProps, ChartPretextItem, ChartSeries };
