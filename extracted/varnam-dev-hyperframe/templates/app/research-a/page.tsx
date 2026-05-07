import { redirect } from "next/navigation";
import { Nav } from "../../src/app/components/Nav";
import { ResearchAPage } from "../../src/app/pages/ResearchA";
import { REVIEW_ENABLED } from "../../src/app/lib/env";

export default function ResearchAPageRoute() {
  if (!REVIEW_ENABLED) {
    redirect("/");
  }

  return (
    <>
      <Nav />
      <ResearchAPage />
    </>
  );
}
