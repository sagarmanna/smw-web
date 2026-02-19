"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface Item {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export default function POSPage() {
  const productRef = useRef<HTMLInputElement>(null);

  const [quantity, setQuantity] = useState(1);
  const [productCode, setProductCode] = useState("");
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    productRef.current?.focus();
  }, []);

  const handleScan = () => {
    if (!productCode.trim()) return;

    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: `Product ${productCode}`,
        quantity,
        price: 25.00,
      },
    ]);

    setProductCode("");
    setQuantity(1);
    productRef.current?.focus();
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updatePrice = (id: string, newPrice: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, price: newPrice } : item
    ));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const transactionId = "P001-0001";
  const transactionDate = new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* TOP SECTION */}
      <div className="flex justify-between items-end mb-6">

        {/* Left: Qty + Product Code */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
              className="w-24 h-11"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Product Code</label>
            <Input
              ref={productRef}
              placeholder="Scan or enter product code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              className="w-[450px] h-11"
            />
          </div>
        </div>

        {/* Right: Customer + Details */}
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <Input
              placeholder="Search or enter customer"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-[280px] h-11"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4 min-w-[200px]">
            <div className="text-xs text-muted-foreground mb-2">Transaction Details</div>
            <div className="space-y-1">
              <div className="text-sm"><span className="font-medium">ID:</span> {transactionId}</div>
              <div className="text-sm"><span className="font-medium">Date:</span> {transactionDate}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="flex gap-6">

        {/* TABLE */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-sm">Qty</th>
                <th className="p-4 text-left font-semibold text-sm">Description</th>
                <th className="p-4 text-right font-semibold text-sm">Unit Price</th>
                <th className="p-4 text-right font-semibold text-sm">Total</th>
                <th className="p-4 text-center font-semibold text-sm w-32">Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No items in cart. Scan a product to begin.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{item.quantity}</td>
                    <td className="p-4">{item.description}</td>
                    <td className="p-4 text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-28 text-right ml-auto"
                      />
                    </td>
                    <td className="p-4 text-right font-semibold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT ACTION PANEL */}
        <div className="w-[320px] space-y-4">
          <div className="space-y-3">
            <Button 
              size="lg" 
              disabled={items.length === 0}
              className="w-full h-14 text-lg font-semibold bg-orange-500 hover:bg-orange-600"
            >
              Payment
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              disabled={items.length === 0}
              className="w-full h-12"
            >
              Discount
            </Button>

            <Button 
              variant="outline" 
              size="lg"
              className="w-full h-12"
              onClick={() => {
                setItems([]);
                setCustomer("");
                setQuantity(1);
                setProductCode("");
                productRef.current?.focus();
              }}
            >
              Cancel
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-sm font-semibold mb-4">Order Summary</div>
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
