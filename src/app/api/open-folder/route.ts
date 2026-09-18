import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json();
    if (!folderPath || !fs.existsSync(folderPath)) {
      return NextResponse.json({ error: "Invalid folder path" }, { status: 400 });
    }

    // Open directory in Windows File Explorer
    exec(`explorer "${folderPath}"`);

    return NextResponse.json({ success: true, folderPath });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to open folder" }, { status: 500 });
  }
}
