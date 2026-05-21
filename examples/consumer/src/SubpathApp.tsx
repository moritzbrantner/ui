import { Button } from "@moritzbrantner/ui/components/button";
import { DataGrid } from "@moritzbrantner/ui/components/data-grid";
import { Dialog, DialogContent, DialogTrigger } from "@moritzbrantner/ui/components/dialog";
import { ThemeModeSwitch } from "@moritzbrantner/ui/client";
import { cn, themeConfig } from "@moritzbrantner/ui/server";

const columns = [{ accessorKey: "name", header: "Name" }];
const data = [{ name: themeConfig.bobba.name }];

export function SubpathApp() {
  return (
    <section className={cn("grid gap-3", themeConfig.bobba.className)}>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>Subpath dialog</DialogContent>
      </Dialog>
      <DataGrid columns={columns} data={data} />
      <ThemeModeSwitch />
    </section>
  );
}
