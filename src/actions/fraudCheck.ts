"use server";

export async function checkFraudData(phone: string) {
  try {
    const cookie = process.env.STEADFAST_COOKIE;
    
    if (!cookie) {
      throw new Error("Steadfast cookie is not configured");
    }

    const response = await fetch(`https://steadfast.com.bd/user/frauds/check/${phone}`, {
      headers: {
        "Cookie": cookie,
        "Accept": "application/json"
      },
      // Using cache: 'no-store' so we always get fresh fraud data
      cache: "no-store" 
    });

    if (!response.ok) {
      throw new Error(`Steadfast API returned status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        total_delivered: data.total_delivered || 0,
        total_cancelled: data.total_cancelled || 0,
        frauds: data.frauds || []
      }
    };
  } catch (error: any) {
    console.error("Fraud Check API Error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch fraud details"
    };
  }
}
