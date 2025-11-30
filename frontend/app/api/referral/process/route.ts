import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, clientUserId } = body;

    console.log('🎯 Processing referral signup:', { referralCode, clientUserId });

    if (!referralCode || !clientUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract referrer's wallet address from referral code
    // Format: first 6 chars of wallet address
    const referrerWallet = referralCode;

    console.log('📡 Referrer wallet:', referrerWallet);
    console.log('📡 New user wallet:', clientUserId);

    // Award 50 ZRG signup bonus to new user
    console.log('🎁 Awarding 50 ZRG signup bonus to new user');
    await fetch(`${request.nextUrl.origin}/api/rewards/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientUserId: clientUserId,
        action: 'add_signup_bonus',
        amount: 50
      })
    });

    // Award 150 ZRG referral bonus to referrer
    console.log('🎁 Awarding 150 ZRG referral bonus to referrer');
    await fetch(`${request.nextUrl.origin}/api/rewards/mock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientUserId: referrerWallet,
        action: 'add_referral',
        amount: 150
      })
    });

    return NextResponse.json({
      success: true,
      message: 'Referral processed successfully',
      rewards: {
        newUser: 50,
        referrer: 150
      }
    });

  } catch (error: any) {
    console.error('❌ Error processing referral:', error);
    return NextResponse.json(
      { error: 'Failed to process referral', message: error.message },
      { status: 500 }
    );
  }
}
