import { NextResponse } from "next/server";
import { registryPath, readJsonFile } from "../_lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const registry = await readJsonFile<Record<string, unknown>>(registryPath, {});
  return NextResponse.json(registry);
}
