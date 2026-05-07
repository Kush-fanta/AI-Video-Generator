import { redirect } from "next/navigation";
import { Nav } from "../../src/app/components/Nav";
import { ResearchBPage } from "../../src/app/pages/ResearchB";
import { REVIEW_ENABLED } from "../../src/app/lib/env";

export default function ResearchBPageRoute() {
  if (!REVIEW_ENABLED) {
    redirect("/");
  }

  return (
    <>
      <Nav />
      <ResearchBPage />
    </>
  );
}
