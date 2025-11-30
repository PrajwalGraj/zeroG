import { NextRequest, NextResponse } from 'next/server';

// x402 Payment Configuration
const PAYMENT_RECIPIENT = "0x742c5f0be69d2f401f52c167e5c5ac1d8c537b5f9c0ffbf6b4db7c08d0ab5678";
const PAYMENT_COST_APT = 0.1; // 0.1 APT
const PAYMENT_COST_OCTAS = 10000000; // 0.1 APT in Octas

// Mock pool analytics database
const POOL_DATABASE: Record<string, { 
  score: number; 
  risk: string; 
  tvl: string; 
  apy: string;
  volume24h: string;
  fees24h: string;
  impermanentLoss: string;
  liquidityDepth: string;
  priceImpact: string;
  weeklyReturn: string;
  monthlyReturn: string;
  sharpeRatio: string;
  maxDrawdown: string;
}> = {
  "APT-USDC": {
    score: 92,
    risk: "Low",
    tvl: "$12.5M",
    apy: "18.5%",
    volume24h: "$4.2M",
    fees24h: "$12,450",
    impermanentLoss: "0.8%",
    liquidityDepth: "95%",
    priceImpact: "0.12%",
    weeklyReturn: "+2.5%",
    monthlyReturn: "+12.3%",
    sharpeRatio: "2.45",
    maxDrawdown: "3.2%"
  },
  "MOJO-APT": {
    score: 67,
    risk: "Medium",
    tvl: "$3.2M",
    apy: "45.2%",
    volume24h: "$1.8M",
    fees24h: "$8,920",
    impermanentLoss: "4.2%",
    liquidityDepth: "72%",
    priceImpact: "0.89%",
    weeklyReturn: "+5.8%",
    monthlyReturn: "+28.5%",
    sharpeRatio: "1.78",
    maxDrawdown: "12.7%"
  },
  "CAKE-APT": {
    score: 45,
    risk: "High",
    tvl: "$890K",
    apy: "127.8%",
    volume24h: "$650K",
    fees24h: "$5,340",
    impermanentLoss: "15.3%",
    liquidityDepth: "48%",
    priceImpact: "2.45%",
    weeklyReturn: "+12.4%",
    monthlyReturn: "+45.2%",
    sharpeRatio: "1.12",
    maxDrawdown: "28.5%"
  }
};

// In-memory payment verification (mock)
const processedPayments = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { poolAddress } = body;

    if (!poolAddress) {
      return NextResponse.json(
        { error: "Pool address is required" },
        { status: 400 }
      );
    }

    // Step 1: Check for X-PAYMENT header (x402 protocol standard)
    const paymentHeader = request.headers.get('x-payment');

    // Step 2: If no payment, return 402 with payment requirements
    if (!paymentHeader) {
      return NextResponse.json(
        {
          error: "Payment Required",
          message: "This API requires payment via x402 protocol",
          payment: {
            cost: PAYMENT_COST_APT,
            costOctas: PAYMENT_COST_OCTAS,
            currency: "APT",
            recipient: PAYMENT_RECIPIENT,
            network: "Aptos Testnet",
            description: `Premium analytics for ${poolAddress}`,
            resourceId: poolAddress
          },
          protocol: "x402",
          version: "1.0"
        },
        { 
          status: 402,
          headers: {
            'X-Protocol': 'x402',
            'X-Payment-Required': 'true'
          }
        }
      );
    }

    // Step 3: Verify payment (mock verification - checks for valid transaction hash format)
    let paymentData;
    try {
      paymentData = JSON.parse(paymentHeader);
    } catch {
      return NextResponse.json(
        { 
          error: "Invalid Payment", 
          message: "Payment header must be valid JSON"
        },
        { status: 402 }
      );
    }

    const { transactionHash, amount, recipient } = paymentData;

    // Validate payment data
    if (!transactionHash || !transactionHash.startsWith('0x')) {
      return NextResponse.json(
        { 
          error: "Invalid Payment", 
          message: "Invalid transaction hash format"
        },
        { status: 402 }
      );
    }

    if (recipient !== PAYMENT_RECIPIENT) {
      return NextResponse.json(
        { 
          error: "Invalid Payment", 
          message: "Payment sent to wrong recipient"
        },
        { status: 402 }
      );
    }

    if (amount < PAYMENT_COST_OCTAS) {
      return NextResponse.json(
        { 
          error: "Insufficient Payment", 
          message: `Payment amount ${amount} is less than required ${PAYMENT_COST_OCTAS}`
        },
        { status: 402 }
      );
    }

    // Check for duplicate payments
    if (processedPayments.has(transactionHash)) {
      return NextResponse.json(
        { 
          error: "Payment Already Used", 
          message: "This transaction has already been used"
        },
        { status: 402 }
      );
    }

    // Mark payment as processed
    processedPayments.add(transactionHash);

    // Step 4: Payment verified! Return premium data
    const poolData = POOL_DATABASE[poolAddress];

    if (!poolData) {
      return NextResponse.json(
        { error: "Pool not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          poolAddress,
          ...poolData,
          paymentVerified: true,
          transactionHash,
          timestamp: new Date().toISOString()
        },
        message: "Premium data unlocked via x402 payment protocol"
      },
      { 
        status: 200,
        headers: {
          'X-Protocol': 'x402',
          'X-Payment-Verified': 'true'
        }
      }
    );

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

// GET method for API info
export async function GET() {
  return NextResponse.json({
    name: "Pool Analytics API",
    version: "1.0.0",
    protocol: "x402 (Coinbase Payment Protocol)",
    description: "Premium DeFi pool analytics with pay-per-use access",
    payment: {
      cost: PAYMENT_COST_APT,
      currency: "APT",
      recipient: PAYMENT_RECIPIENT,
      network: "Aptos Testnet"
    },
    endpoints: {
      POST: "/api/pool-score - Get pool analytics (requires x402 payment)"
    },
    howItWorks: [
      "1. Client requests data without payment",
      "2. Server returns 402 Payment Required with payment details",
      "3. Client sends APT payment on-chain",
      "4. Client retries request with X-PAYMENT header containing tx hash",
      "5. Server verifies payment and returns premium data"
    ]
  });
}
