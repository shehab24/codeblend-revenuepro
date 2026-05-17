import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [pixelIdSetting, testCodeSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "FB_PIXEL_ID" } }),
      prisma.setting.findUnique({ where: { key: "FB_TEST_EVENT_CODE" } }),
    ]);

    return NextResponse.json({
      pixelId: pixelIdSetting?.value || null,
      testEventCode: testCodeSetting?.value || null,
    });
  } catch {
    return NextResponse.json({ pixelId: null, testEventCode: null });
  }
}
