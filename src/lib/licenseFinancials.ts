// Payable / paid / due amounts (BDT) for a RevenuePro license, derived from its tier
// name and verified transactions. Shared by the client overview and "My Services".
export function getLicenseFinancials(
  license: { id: string; tier?: string | null; paymentStatus: string },
  transactions: Array<{ licenseId?: string | null; amount: number; status: string }> = []
) {
  const tier = license.tier || "";
  const tLower = tier.toLowerCase();

  const isFreeOrTrial =
    tLower.includes("trial") ||
    tLower.includes("free") ||
    tLower.includes("dev") ||
    tLower.includes("test") ||
    tLower.includes("1 day") ||
    tLower.includes("2 min") ||
    tLower.includes("5 min") ||
    tLower.includes("5 day") ||
    tLower.includes("15 day") ||
    tLower.includes("lifetime") ||
    tier === "0";

  let payableAmount = 0;
  if (!isFreeOrTrial) {
    if (tLower.includes("yearly") || tLower.includes("elite") || tLower.includes("1 year") || tLower.includes("12 month")) {
      payableAmount = 2999;
    } else if (tLower.includes("biannual") || tLower.includes("6 month") || tLower.includes("6m")) {
      payableAmount = 1499;
    } else if (tLower.includes("quarterly") || tLower.includes("3 month")) {
      payableAmount = 749;
    } else if (tLower.includes("2 month")) {
      payableAmount = 499;
    } else if (tLower.includes("monthly") || tLower.includes("basic") || tLower.includes("1 month")) {
      payableAmount = 249;
    } else {
      payableAmount = 249;
    }
  }

  const txPaid = transactions
    .filter((tx) => tx.licenseId === license.id && (tx.status === "verified" || tx.status === "completed"))
    .reduce((sum, tx) => sum + tx.amount, 0);

  let totalPaid = txPaid;
  if (license.paymentStatus === "paid" && totalPaid < payableAmount) {
    totalPaid = payableAmount;
  }

  const balanceDue = isFreeOrTrial ? 0 : Math.max(0, payableAmount - totalPaid);

  return {
    isFreeOrTrial,
    payableAmount,
    totalPaid,
    balanceDue,
  };
}
