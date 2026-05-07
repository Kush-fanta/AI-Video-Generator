import { registryPath, readJsonFile } from "./api/_lib/storage";
import { Nav } from "../src/app/components/Nav";
import { Catalog } from "../src/app/pages/Catalog";
import { EMPTY_REGISTRY } from "../src/app/lib/registry-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const registry = await readJsonFile(registryPath, EMPTY_REGISTRY);

  return (
    <>
      <Nav />
      <Catalog initialRegistry={registry} />
    </>
  );
}
