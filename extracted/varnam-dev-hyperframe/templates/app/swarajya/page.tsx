import { registryPath, readJsonFile } from "../api/_lib/storage";
import { Nav } from "../../src/app/components/Nav";
import { Catalog } from "../../src/app/pages/Catalog";
import { EMPTY_REGISTRY } from "../../src/app/lib/registry-types";

export const dynamic = "force-dynamic";

export default async function SwarajyaPage() {
  const registry = await readJsonFile(registryPath, EMPTY_REGISTRY);

  const kitCount = Object.values(registry.templates || {}).filter(
    (t: any) => t.category === "swarajya-kit",
  ).length;
  const legacyCount = Object.values(registry.templates || {}).filter(
    (t: any) => t.category === "swarajya",
  ).length;

  return (
    <>
      <Nav />
      <Catalog
        initialRegistry={registry}
        channelFilter={["swarajya-kit", "swarajya"]}
        title="Swarajya — Channel Kit"
        subtitle={`${kitCount} kit templates (new YouTube language) + ${legacyCount} legacy (magazine aesthetic)`}
      />
    </>
  );
}
