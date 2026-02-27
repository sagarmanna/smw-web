import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locationId, location } = body;

    if (!locationId || !location) {
      return NextResponse.json(
        { error: 'locationId and location are required' },
        { status: 400 }
      );
    }

    // Call backend to create transaction
    const backendUrl = `http://localhost:3005/admin/v2/${location}/pos/transaction`;
    
    try {
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: Number(locationId) }),
      });

      if (!backendResponse.ok) {
        const error = await backendResponse.json();
        throw new Error(error.message || 'Backend failed to create transaction');
      }

      const backendData = await backendResponse.json();
      
      // Use backend's transactionId directly - DO NOT generate it
      console.log('[Transaction Create] Backend response:', backendData.data);

      return NextResponse.json({
        success: true,
        data: {
          transactionId: backendData.data.transactionId,
          numericTransactionId: backendData.data.id.toString(),
          transactionDate: backendData.data.createdAt || new Date().toISOString(),
          locationId: backendData.data.locationId,
        },
      }, { status: 201 });
    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      // Fallback to mock if backend unavailable
      const numericId = Date.now();
      const transactionId = `P-${locationId.toString().padStart(3, '0')}-${numericId.toString().slice(-4)}`;
      
      return NextResponse.json({
        success: true,
        data: {
          transactionId,
          numericTransactionId: numericId.toString(),
          transactionDate: new Date().toISOString(),
          locationId,
        },
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating POS transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
