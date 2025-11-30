import { NextRequest, NextResponse } from 'next/server';

// Mock rewards store (in production, use a database)
const rewardsStore: Record<string, {
  referralRewards: number;
  liquidityRewards: number;
  signupBonus: number;
  referralCount: number;
}> = {};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientUserId = searchParams.get('clientUserId');

    if (!clientUserId) {
      return NextResponse.json(
        { error: 'clientUserId is required' },
        { status: 400 }
      );
    }

    // Get or initialize user rewards
    const userRewards = rewardsStore[clientUserId] || {
      referralRewards: 0,
      liquidityRewards: 0,
      signupBonus: 0,
      referralCount: 0
    };

    console.log('📊 Fetching rewards for:', clientUserId, userRewards);

    return NextResponse.json({
      success: true,
      data: userRewards
    });

  } catch (error: any) {
    console.error('❌ Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientUserId, action, amount } = body;

    if (!clientUserId || !action) {
      return NextResponse.json(
        { error: 'clientUserId and action are required' },
        { status: 400 }
      );
    }

    // Initialize user if not exists
    if (!rewardsStore[clientUserId]) {
      rewardsStore[clientUserId] = {
        referralRewards: 0,
        liquidityRewards: 0,
        signupBonus: 0,
        referralCount: 0
      };
    }

    // Update rewards based on action
    switch (action) {
      case 'add_referral':
        rewardsStore[clientUserId].referralRewards += amount || 150;
        rewardsStore[clientUserId].referralCount += 1;
        console.log('🎁 Added referral reward:', clientUserId, amount || 150);
        break;
      
      case 'add_signup_bonus':
        rewardsStore[clientUserId].signupBonus += amount || 50;
        console.log('🎉 Added signup bonus:', clientUserId, amount || 50);
        break;
      
      case 'add_liquidity':
        rewardsStore[clientUserId].liquidityRewards += amount || 10;
        console.log('💧 Added liquidity reward:', clientUserId, amount || 10);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: rewardsStore[clientUserId]
    });

  } catch (error: any) {
    console.error('❌ Error updating rewards:', error);
    return NextResponse.json(
      { error: 'Failed to update rewards', message: error.message },
      { status: 500 }
    );
  }
}
