import { redirect } from "next/navigation";
import { Nav } from "../../src/app/components/Nav";
import { UpiDemoV2Page } from "../../src/app/pages/UpiDemoV2";
import { REVIEW_ENABLED } from "../../src/app/lib/env";

export default function DemoV2Page() {
  if (!REVIEW_ENABLED) {
    redirect("/");
  }

  return (
    <>
      <Nav />
      <UpiDemoV2Page />
    </>
  );
}
