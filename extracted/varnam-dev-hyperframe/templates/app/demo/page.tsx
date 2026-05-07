import { redirect } from "next/navigation";
import { Nav } from "../../src/app/components/Nav";
import { FullDemo } from "../../src/app/pages/FullDemo";
import { REVIEW_ENABLED } from "../../src/app/lib/env";

export default function DemoPage() {
  if (!REVIEW_ENABLED) {
    redirect("/");
  }

  return (
    <>
      <Nav />
      <FullDemo />
    </>
  );
}
