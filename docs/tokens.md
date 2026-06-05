# Design Tokens

Generated from `src/token-metadata.ts` by `bun run generate:tokens`.

## Themes

| Theme  | Light tokens | Dark tokens |
| ------ | -----------: | ----------: |
| bobba  |           89 |          89 |
| custom |           89 |          89 |
| zleek  |           89 |          89 |
| atlas  |           89 |          89 |
| studio |           89 |          89 |
| paper  |           89 |          89 |

## Tokens

| Token                          | Category  | Description                                        |
| ------------------------------ | --------- | -------------------------------------------------- |
| `--background`                 | color     | Page background color.                             |
| `--foreground`                 | color     | Default foreground text color.                     |
| `--card`                       | color     | Card and surface background color.                 |
| `--card-foreground`            | color     | Card and surface foreground color.                 |
| `--popover`                    | color     | Overlay background color.                          |
| `--popover-foreground`         | color     | Overlay foreground color.                          |
| `--primary`                    | color     | Primary action and accent color.                   |
| `--primary-foreground`         | color     | Foreground color on primary backgrounds.           |
| `--secondary`                  | color     | Secondary action background color.                 |
| `--secondary-foreground`       | color     | Foreground color on secondary backgrounds.         |
| `--muted`                      | color     | Muted surface background color.                    |
| `--muted-foreground`           | color     | Muted text color.                                  |
| `--accent`                     | color     | Accent surface background color.                   |
| `--accent-foreground`          | color     | Accent foreground color.                           |
| `--destructive`                | color     | Destructive action color.                          |
| `--border`                     | color     | Default border color.                              |
| `--input`                      | color     | Input border and track color.                      |
| `--ring`                       | color     | Focus ring color.                                  |
| `--chart-1`                    | color     | First chart series color.                          |
| `--chart-2`                    | color     | Second chart series color.                         |
| `--chart-3`                    | color     | Third chart series color.                          |
| `--chart-4`                    | color     | Fourth chart series color.                         |
| `--chart-5`                    | color     | Fifth chart series color.                          |
| `--sidebar`                    | color     | Sidebar background color.                          |
| `--sidebar-foreground`         | color     | Sidebar foreground color.                          |
| `--sidebar-primary`            | color     | Sidebar primary color.                             |
| `--sidebar-primary-foreground` | color     | Foreground color on sidebar primary backgrounds.   |
| `--sidebar-accent`             | color     | Sidebar accent color.                              |
| `--sidebar-accent-foreground`  | color     | Foreground color on sidebar accent backgrounds.    |
| `--sidebar-border`             | color     | Sidebar border color.                              |
| `--sidebar-ring`               | color     | Sidebar focus ring color.                          |
| `--font-sans-app`              | font      | Application sans font stack.                       |
| `--font-mono-app`              | font      | Application monospace font stack.                  |
| `--radius`                     | radius    | Base radius used by Tailwind radius aliases.       |
| `--ui-radius-control`          | radius    | Control radius token.                              |
| `--ui-radius-surface`          | radius    | Surface radius token.                              |
| `--ui-radius-overlay`          | radius    | Overlay radius token.                              |
| `--glass-inset-surface`        | surface   | Glass inset control background.                    |
| `--ui-surface-padding-sm`      | surface   | Small surface padding.                             |
| `--ui-surface-padding-md`      | surface   | Medium surface padding.                            |
| `--ui-surface-gap`             | surface   | Default surface content gap.                       |
| `--ui-control-height-xs`       | control   | Extra-small control height.                        |
| `--ui-control-height-sm`       | control   | Small control height.                              |
| `--ui-control-height-md`       | control   | Medium control height.                             |
| `--ui-control-height-lg`       | control   | Large control height.                              |
| `--ui-control-padding-x-sm`    | control   | Small horizontal control padding.                  |
| `--ui-control-padding-x-md`    | control   | Medium horizontal control padding.                 |
| `--ui-control-gap`             | control   | Default inline control gap.                        |
| `--ui-focus-ring-width`        | focus     | Focus ring width.                                  |
| `--ui-motion-hover-y`          | motion    | Vertical translation used by hover affordances.    |
| `--ui-motion-hover-scale`      | motion    | Scale transform used by hover affordances.         |
| `--glass-blur`                 | shadow    | Backdrop blur amount for glass themes.             |
| `--glass-shadow`               | shadow    | Default elevated surface shadow.                   |
| `--glass-interactive-shadow`   | shadow    | Shadow used by interactive elevated controls.      |
| `--glass-raised-shadow`        | shadow    | Raised glass control shadow.                       |
| `--glass-inset-shadow`         | shadow    | Inset glass control shadow.                        |
| `--glass-inset-highlight`      | shadow    | Glass highlight used by inset and raised surfaces. |
| `--glass-surface-tint`         | shadow    | Glass surface tint used by themed backgrounds.     |
| `--ui-shadow-surface`          | shadow    | Surface shadow alias.                              |
| `--ui-shadow-interactive`      | shadow    | Interactive shadow alias.                          |
| `--ui-button-height-xs`        | component | Extra-small button height.                         |
| `--ui-button-height-sm`        | component | Small button height.                               |
| `--ui-button-height-md`        | component | Medium button height.                              |
| `--ui-button-height-lg`        | component | Large button height.                               |
| `--ui-button-padding-x-xs`     | component | Extra-small button horizontal padding.             |
| `--ui-button-padding-x-sm`     | component | Small button horizontal padding.                   |
| `--ui-button-padding-x-md`     | component | Medium button horizontal padding.                  |
| `--ui-button-padding-x-lg`     | component | Large button horizontal padding.                   |
| `--ui-button-radius`           | component | Button radius.                                     |
| `--ui-input-height`            | component | Input height.                                      |
| `--ui-input-padding-x`         | component | Input horizontal padding.                          |
| `--ui-input-radius`            | component | Input radius.                                      |
| `--ui-card-padding`            | component | Card padding.                                      |
| `--ui-card-gap`                | component | Card content gap.                                  |
| `--ui-card-radius`             | component | Card radius.                                       |
| `--ui-overlay-padding`         | component | Overlay padding.                                   |
| `--ui-overlay-gap`             | component | Overlay content gap.                               |
| `--ui-overlay-radius`          | component | Overlay radius.                                    |
| `--ui-menu-padding`            | component | Menu content padding.                              |
| `--ui-menu-item-padding-x`     | component | Menu item horizontal padding.                      |
| `--ui-menu-item-padding-y`     | component | Menu item vertical padding.                        |
| `--ui-menu-item-radius`        | component | Menu item radius.                                  |
| `--ui-toolbar-padding-x`       | component | Toolbar horizontal padding.                        |
| `--ui-toolbar-padding-y`       | component | Toolbar vertical padding.                          |
| `--ui-toolbar-gap`             | component | Toolbar gap.                                       |
| `--ui-toolbar-min-height`      | component | Toolbar minimum height.                            |
| `--ui-tabs-list-padding`       | component | Tabs list padding.                                 |
| `--ui-tabs-trigger-padding-x`  | component | Tabs trigger horizontal padding.                   |
| `--ui-tabs-radius`             | component | Tabs radius.                                       |
