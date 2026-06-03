import type { ComponentTier } from "../src/component-registry";

type MobileViewport = {
  name: "mobile-min";
  width: 360;
  height: 568;
};

type MobileUsabilityAllowance = {
  reason: string;
};

type InternalScrollAllowance = MobileUsabilityAllowance & {
  selector: string;
};

const includedTiers = ["stable", "patterns", "data", "shell", "social", "media"] as const;
const excludedTiers = ["labs"] as const;

export const mobileUsabilityConfig = {
  viewport: { name: "mobile-min", width: 360, height: 568 } satisfies MobileViewport,
  includedTiers: includedTiers satisfies readonly ComponentTier[],
  excludedTiers: excludedTiers satisfies readonly ComponentTier[],
  internalScrollStories: new Map<string, InternalScrollAllowance>([
    [
      "components-data-display-data-grid--default",
      {
        selector: '[data-slot="table-container"]',
        reason: "Dense tabular data is usable through an owned internal scroll region.",
      },
    ],
    [
      "components-data-display-comparison-matrix--mobile-scroll",
      {
        selector: '[data-slot="comparison-matrix"]',
        reason: "Wide comparison columns remain usable through a component-owned scroll region.",
      },
    ],
    [
      "components-data-display-calendar-card-days--default",
      {
        selector: '[data-slot="calendar"]',
        reason: "Calendar grids can preserve day geometry through a component-owned scroll region.",
      },
    ],
    [
      "components-data-display-process-map--release-lifecycle",
      {
        selector: '[data-slot="process-map"]',
        reason: "Process maps can preserve step order through an owned scroll region.",
      },
    ],
    [
      "components-data-display-relationship-map--stakeholder-map",
      {
        selector: '[data-slot="relationship-map-scroll-area"]',
        reason: "Relationship maps can preserve graph geometry through an owned scroll region.",
      },
    ],
  ]),
  denseControlStories: new Map<string, MobileUsabilityAllowance>([
    [
      "components-forms-inputs-form-controls--basic",
      {
        reason: "The story intentionally groups dense form controls for component comparison.",
      },
    ],
    [
      "components-stable-primitive-components--overview",
      {
        reason: "The primitive overview intentionally presents dense controls for coverage.",
      },
    ],
  ]),
};

export type { InternalScrollAllowance, MobileUsabilityAllowance };
