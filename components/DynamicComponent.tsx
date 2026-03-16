import { getWidgetById } from "@/lib/widget-queries";
import { DynamicComponentClient } from "@/components/DynamicComponentClient";
import type { WidgetDef } from "@/types/widget";

export async function DynamicComponent({ id }: { id: string }) {
  const comp = await getWidgetById(id);
  if (!comp || comp.status !== "approved") return null;

  const definition = JSON.parse(comp.definition) as WidgetDef;
  return <DynamicComponentClient definition={definition} />;
}
