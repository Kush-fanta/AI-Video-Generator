import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error: "registry.json is generated only.",
      command: "pnpm template -- registry --write",
      repoRoot: "/Users/dev/Downloads/varnam-improviser",
    },
    { status: 409 },
  );
}
