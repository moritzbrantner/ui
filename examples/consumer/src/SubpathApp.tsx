import { Button } from "@moritzbrantner/ui/components/stable/button";
import { DataGrid } from "@moritzbrantner/ui/components/data/data-grid";
import { Dialog, DialogContent, DialogTrigger } from "@moritzbrantner/ui/components/stable/dialog";
import { cn, themeConfig } from "@moritzbrantner/ui/server";
import { uiTheme as atlasTheme } from "@moritzbrantner/ui/themes/atlas";

const columns = [{ accessorKey: "name", header: "Name" }];
const data = [{ name: atlasTheme.name }];

export function SubpathApp() {
  return (
    <section className={cn("grid gap-3 p-6", themeConfig.atlas.className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>Subpath dialog</DialogContent>
      </Dialog>
      <DataGrid columns={columns} data={data} />
    </section>
  );
}
