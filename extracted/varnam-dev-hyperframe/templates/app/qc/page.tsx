import { registryPath, readJsonFile } from "../api/_lib/storage";
import { Nav } from "../../src/app/components/Nav";
import { QCReview } from "../../src/app/pages/QCReview";
import { EMPTY_REGISTRY } from "../../src/app/lib/registry-types";

export const dynamic = "force-dynamic";

export default async function QCPage() {
  const registry = await readJsonFile(registryPath, EMPTY_REGISTRY);

  return (
    <>
      <Nav />
      <QCReview initialRegistry={registry} />
    </>
  );
}
