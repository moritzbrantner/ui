import { uiTheme as atlasTheme } from "@moritzbrantner/ui/atlas/server";
import { Button } from "@moritzbrantner/ui/components/button";
import { DataGrid } from "@moritzbrantner/ui/components/data-grid";
import { Dialog, DialogContent, DialogTrigger } from "@moritzbrantner/ui/components/dialog";
import { cn, themeConfig } from "@moritzbrantner/ui/server";

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
