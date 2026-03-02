import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const code = searchParams.get('code');

    if (!location || !code) {
      return NextResponse.json(
        { error: 'location and code are required' },
        { status: 400 }
      );
    }

    // Call backend
    const backendUrl = `${BACKEND_URL}/admin/v2/${location}/pos/items?code=${encodeURIComponent(code)}`;
    
    const backendResponse = await fetch(backendUrl);

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      throw new Error(`Backend returned ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    
    // Backend returns: { success: true, data: { id, code, description, price, ... }, message }
    // Transform to match frontend interface
    return NextResponse.json({
      success: true,
      data: {
        id: backendData.data.id.toString(),
        code: backendData.data.code,
        description: backendData.data.description,
        price: parseFloat(backendData.data.price),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}
