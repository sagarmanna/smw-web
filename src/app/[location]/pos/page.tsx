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
  upc: string;
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
    const newItem: Item = {
      id: Date.now().toString(),
      upc: productCode,
      description: "Item Description " + productCode,
      quantity: quantity,
      price: 25.00,
    };
    setItems([...items, newItem]);
    setProductCode("");
    setQuantity(1);
    productRef.current?.focus();
  };

  const removeItem = (id: string) => setItems(items.filter((item) => item.id !== id));

  const handleOverride = (id: string) => {
    const newPrice = window.prompt("Enter new price:");
    if (newPrice && !isNaN(parseFloat(newPrice))) {
      setItems(items.map(item => item.id === id ? { ...item, price: parseFloat(newPrice) } : item));
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const transactionId = "P-001-1024";
  const transactionDate = new Date().toLocaleDateString();

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-300 flex-none">
        <div className="flex flex-col w-1/3">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Customer</label>
          <Input 
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Search or Enter Customer..." 
            className="border-slate-400 h-8 text-sm rounded-none focus:ring-0 focus:border-slate-600"
          />
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Transaction ID</div>
            <div className="text-sm font-bold text-slate-700">{transactionId}</div>
          </div>
          <div className="text-right border-l pl-8 border-slate-300">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Date</div>
            <div className="text-sm font-medium">{transactionDate}</div>
          </div>
        </div>
      </header>

      {/* SCANNING BAR */}
      <section className="p-3 bg-white border-b border-slate-300 flex gap-4 items-end flex-none">
        <div className="w-20">
          <label className="text-[10px] font-bold mb-1 block uppercase text-slate-500">Qty</label>
          <Input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className="border-slate-400 h-9 text-center font-bold rounded-none" 
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold mb-1 block uppercase text-slate-500">Product Code / UPC</label>
          <Input 
            ref={productRef}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            className="border-slate-400 h-9 text-sm rounded-none" 
          />
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Table Section */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="pb-2 w-10"></th>
                <th className="pb-2 w-16">Qty</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 text-xs italic uppercase tracking-tighter">Ready for Scanning</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="py-2.5">
                      <X className="h-4 w-4 text-slate-300 hover:text-red-600 cursor-pointer" onClick={() => removeItem(item.id)} />
                    </td>
                    <td className="py-2.5 font-bold">{item.quantity}</td>
                    <td className="py-2.5">
                      <div className="font-medium text-slate-800 uppercase text-xs">{item.description}</div>
                      <div className="text-[9px] text-slate-400 font-mono">{item.upc}</div>
                    </td>
                    <td className="py-2.5 text-right font-medium">${item.price.toFixed(2)}</td>
                    <td className="py-2.5 text-center">
                      <Button 
                        onClick={() => handleOverride(item.id)}
                        className="h-6 px-3 text-[9px] uppercase font-bold bg-gray-900 text-white hover:bg-gray-900 rounded-none border-none shadow-none"
                      >
                        Override
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT: Sidebar */}
       <aside className="w-72 bg-slate-50 border-l border-slate-300 flex flex-col p-5">

  <div className="mb-5">
    <h3 className="text-xs font-black uppercase text-slate-500 mb-3 tracking-widest border-b border-slate-200 pb-2">
      Bill Summary
    </h3>

    <div className="space-y-3 py-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Discount</span>
        <span className="text-emerald-700">-$0.00</span>
      </div>

      <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
        <span className="text-slate-600">Tax</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between items-baseline pt-2">
        <span className="font-bold text-sm uppercase">Total</span>
        <span className="text-2xl font-black text-slate-900">
          ${subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Paid</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-300">
        <span className="font-bold text-sm uppercase">Balance</span>
        <span className="font-bold text-lg text-rose-700">
          ${subtotal.toFixed(2)}
        </span>
      </div>
    </div>
  </div>

  <div className="flex flex-col gap-2">
    <Button className="w-full h-12 bg-slate-800 hover:bg-slate-900 text-white rounded-none font-bold uppercase text-xs tracking-wider shadow-none">
      Payment
    </Button>

    <Button className="w-full h-9 bg-emerald-700 hover:bg-emerald-800 text-white font-bold uppercase text-xs rounded-none shadow-none">
      Discount
    </Button>

    <Button
      onClick={() => setItems([])}
      className="w-full h-9 bg-rose-700 hover:bg-rose-800 text-white font-bold uppercase text-xs rounded-none shadow-none"
    >
      Cancel
    </Button>
  </div>

</aside>

      </main>
    </div>
  );
}