import { getComponentById } from "@/lib/components";
import { seedComponents } from "@/lib/component-seeds";
import { DynamicComponentClient } from "@/components/DynamicComponentClient";
import type { ComponentDef } from "@/types/component";

export async function DynamicComponent({ id }: { id: string }) {
  // Seed on first use (INSERT OR IGNORE is idempotent)
  await seedComponents();

  const comp = await getComponentById(id);
  if (!comp || comp.status !== "approved") return null;

  const definition = JSON.parse(comp.definition) as ComponentDef;
  return <DynamicComponentClient definition={definition} />;
}
