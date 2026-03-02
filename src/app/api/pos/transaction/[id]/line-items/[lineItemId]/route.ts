import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lineItemId: string }> }
) {
  try {
    const { id, lineItemId } = await params;
    const body = await request.json();
    const { location, overridePrice, quantity } = body;

    if (!location || (overridePrice === undefined && quantity === undefined)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: { overridePrice?: number; quantity?: number } = {};

    // Validate and add price if provided
    if (overridePrice !== undefined) {
      const price = parseFloat(overridePrice);
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid price format or negative price' },
          { status: 400 }
        );
      }
      updateData.overridePrice = price;
    }

    // Validate and add quantity if provided
    if (quantity !== undefined) {
      const qty = parseInt(quantity);
      if (isNaN(qty) || qty < 1 || qty > 999) {
        return NextResponse.json(
          { success: false, error: 'Quantity must be between 1 and 999' },
          { status: 400 }
        );
      }
      updateData.quantity = qty;
    }

    const backendUrl = `http://localhost:3005/admin/v2/${location}/pos/transaction/${id}/line-items/${lineItemId}`;
    
    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update line item' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating line item:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
