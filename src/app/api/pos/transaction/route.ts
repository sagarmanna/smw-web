import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId } = body;

    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // Mock response - will be replaced with actual backend integration
    const transactionId = `P-${locationId.toString().padStart(3, '0')}-${Date.now().toString().slice(-4)}`;
    const transactionDate = new Date().toISOString();

    const response = {
      success: true,
      data: {
        transactionId,
        transactionDate,
        locationId,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating POS transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
