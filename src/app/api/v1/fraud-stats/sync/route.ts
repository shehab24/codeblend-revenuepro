import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { key, domain, stats } = await request.json();

    // Console logs so you can physically watch the terminal!
    console.log("\n=========================================");
    console.log(`[SYNC INCOMING] Fraud data received from: ${domain || 'Unknown Domain'}`);
    console.log(`[SYNC INCOMING] Total records in payload: ${stats ? stats.length : 0}`);
    if (stats && stats.length > 0) {
      console.log(`[SYNC INCOMING] First record preview:`, stats[0]);
    }
    console.log("=========================================\n");

    if (!stats || !Array.isArray(stats) || !domain) {
      return NextResponse.json({ success: false, error: "Missing domain or stats array" }, { status: 400 });
    }

    // Try to find a license if a key was provided, but don't require it
    let licenseId: string | null = null;
    if (key) {
      const license = await prisma.license.findUnique({ where: { key } });
      if (license) {
        licenseId = license.id;
      }
    }

    let synced = 0;

    for (const stat of stats) {
      if (!stat.phone) continue;

      // Check if this phone+domain combo already exists
      const existing = await prisma.fraudStat.findFirst({
        where: { phone: stat.phone, domain: domain }
      });

      if (existing) {
        await prisma.fraudStat.update({
          where: { id: existing.id },
          data: {
            licenseId: licenseId || existing.licenseId,
            total_parcel: parseInt(stat.total_parcel) || 0,
            success_parcel: parseInt(stat.success_parcel) || 0,
            cancelled_parcel: parseInt(stat.cancelled_parcel) || 0,
            success_ratio: parseFloat(stat.success_ratio) || 0,
            pathao_success: parseInt(stat.pathao_success) || 0,
            pathao_cancel: parseInt(stat.pathao_cancel) || 0,
            steadfast_success: parseInt(stat.steadfast_success) || 0,
            steadfast_cancel: parseInt(stat.steadfast_cancel) || 0,
            parceldex_success: parseInt(stat.parceldex_success) || 0,
            parceldex_cancel: parseInt(stat.parceldex_cancel) || 0,
            redx_success: parseInt(stat.redx_success) || 0,
            redx_cancel: parseInt(stat.redx_cancel) || 0,
            paperfly_success: parseInt(stat.paperfly_success) || 0,
            paperfly_cancel: parseInt(stat.paperfly_cancel) || 0,
            carrybee_success: parseInt(stat.carrybee_success) || 0,
            carrybee_cancel: parseInt(stat.carrybee_cancel) || 0,
            courier_data: stat.courier_data ? (typeof stat.courier_data === 'string' ? stat.courier_data : JSON.stringify(stat.courier_data)) : null,
            reports: stat.reports ? (typeof stat.reports === 'string' ? stat.reports : JSON.stringify(stat.reports)) : null,
            last_checked: new Date(),
          }
        });
      } else {
        await prisma.fraudStat.create({
          data: {
            licenseId,
            domain,
            phone: stat.phone,
            total_parcel: parseInt(stat.total_parcel) || 0,
            success_parcel: parseInt(stat.success_parcel) || 0,
            cancelled_parcel: parseInt(stat.cancelled_parcel) || 0,
            success_ratio: parseFloat(stat.success_ratio) || 0,
            pathao_success: parseInt(stat.pathao_success) || 0,
            pathao_cancel: parseInt(stat.pathao_cancel) || 0,
            steadfast_success: parseInt(stat.steadfast_success) || 0,
            steadfast_cancel: parseInt(stat.steadfast_cancel) || 0,
            parceldex_success: parseInt(stat.parceldex_success) || 0,
            parceldex_cancel: parseInt(stat.parceldex_cancel) || 0,
            redx_success: parseInt(stat.redx_success) || 0,
            redx_cancel: parseInt(stat.redx_cancel) || 0,
            paperfly_success: parseInt(stat.paperfly_success) || 0,
            paperfly_cancel: parseInt(stat.paperfly_cancel) || 0,
            carrybee_success: parseInt(stat.carrybee_success) || 0,
            carrybee_cancel: parseInt(stat.carrybee_cancel) || 0,
            courier_data: stat.courier_data ? (typeof stat.courier_data === 'string' ? stat.courier_data : JSON.stringify(stat.courier_data)) : null,
            reports: stat.reports ? (typeof stat.reports === 'string' ? stat.reports : JSON.stringify(stat.reports)) : null,
          }
        });
      }
      synced++;
    }

    return NextResponse.json({ success: true, synced });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
