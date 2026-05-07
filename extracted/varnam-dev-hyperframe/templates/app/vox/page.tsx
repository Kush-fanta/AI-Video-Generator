import { redirect } from "next/navigation";
import { Nav } from "../../src/app/components/Nav";
import { VoxDemoPage } from "../../src/app/pages/VoxDemo";
import { REVIEW_ENABLED } from "../../src/app/lib/env";

export default function VoxPage() {
  if (!REVIEW_ENABLED) {
    redirect("/");
  }

  return (
    <>
      <Nav />
      <VoxDemoPage />
    </>
  );
}
