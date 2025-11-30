import { NextRequest, NextResponse } from 'next/server';

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

    // Fetch from mock rewards store
    const response = await fetch(`${request.nextUrl.origin}/api/rewards/mock?clientUserId=${clientUserId}`);
    const data = await response.json();

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}
