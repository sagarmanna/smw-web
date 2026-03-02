import { NextRequest, NextResponse } from 'next/server';

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

    // Call backend running on port 3005
    const backendUrl = `http://localhost:3005/admin/v2/${location}/pos/items?code=${encodeURIComponent(code)}`;
    
    try {
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
    } catch (backendError) {
      console.error('Backend connection error:', backendError);
      // Fallback to mock data if backend unavailable
    }

    // Mock response - fallback if backend unavailable
    const mockItems: Record<string, {
      id: string;
      code: string;
      description: string;
      price: number;
    }> = {
      'book': {
        id: 'item-1',
        code: 'book',
        description: 'Book',
        price: 15.99,
      },
      'pencil': {
        id: 'item-2',
        code: 'pencil',
        description: 'Pencil',
        price: 2.50,
      },
      '049000050127': {
        id: 'item-3',
        code: '049000050127',
        description: 'Sample Product',
        price: 25.00,
      },
    };

    const item = mockItems[code.toLowerCase()];

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: item,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}
