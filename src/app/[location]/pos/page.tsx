"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discount, setDiscount] = useState(0);

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
  const discountAmount = discountType === "percentage" ? (subtotal * discount) / 100 : discount;
  const total = subtotal - discountAmount;
  const transactionId = "P-001-1024";
  const transactionDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });

  const handleApplyDiscount = () => {
    const value = parseFloat(discountValue);
    if (!isNaN(value) && value >= 0) {
      setDiscount(value);
      setShowDiscountDialog(false);
      setDiscountValue("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 font-sans overflow-hidden">
      
     {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-300 flex-none shadow-sm">
        
        {/* Balanced & Refined Customer Field */}
        <div className="flex flex-col w-[35%]">
          <label className="text-[11px] font-bold text-blue-900 uppercase tracking-widest mb-1">
            Customer
          </label>
          <Input 
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Search or Enter Name..." 
            className="border border-slate-400 h-10 text-sm font-medium bg-white rounded-none 
                       ring-offset-0 focus-visible:ring-0 focus:ring-0 
                       focus:border-blue-700 focus:border-2 transition-all 
                       placeholder:font-normal placeholder:text-slate-400"
          />
        </div>

        {/* Transaction Info */}
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Transaction ID</div>
            <div className="text-sm font-bold text-slate-700">{transactionId}</div>
          </div>
          <div className="text-right border-l pl-8 border-slate-300">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Date</div>
            <div className="text-sm font-medium">{transactionDate.replace(/\//g, '/')}</div>
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
                      <X className="h-4 w-4 text-slate-500 hover:text-red-600 cursor-pointer" onClick={() => removeItem(item.id)} />
                    </td>
                    <td className="py-2.5 font-bold">{item.quantity}</td>
                    <td className="py-2.5">
                      <div className="font-normal text-slate-800 uppercase text-xs">{item.description}</div>
                      <div className="text-[9px] text-slate-500 font-mono">UPC: {item.upc}</div>
                    </td>
                    <td className="py-2.5 text-right font-medium">${item.price.toFixed(2)}</td>
                    <td className="py-2.5 text-center">
                      <Button 
                        onClick={() => handleOverride(item.id)}
                        className="h-8 px-4 text-xs uppercase font-bold bg-primary hover:bg-primary/90 text-white rounded-none border-none shadow-none"
                      >
                        Edit Price
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
        <span className="text-emerald-700">-${discountAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
        <span className="text-slate-600">Tax</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between items-baseline pt-2">
        <span className="font-bold text-sm uppercase">Total</span>
        <span className="text-2xl font-black text-slate-900">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>Paid</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between pt-2 border-t border-slate-300">
        <span className="font-bold text-sm uppercase">Balance</span>
        <span className="font-bold text-lg text-rose-700">
          ${total.toFixed(2)}
        </span>
      </div>
    </div>
  </div>

  <div className="flex flex-col gap-2">
    <Button 
      disabled={subtotal === 0}
      className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-none font-bold uppercase text-xs tracking-wider shadow-none disabled:pointer-events-auto disabled:cursor-not-allowed"
    >
      Payment
    </Button>

    <Button 
      onClick={() => setShowDiscountDialog(true)}
      disabled={subtotal === 0}
      className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-bold uppercase text-xs rounded-none shadow-none disabled:pointer-events-auto disabled:cursor-not-allowed"
    >
      Discount
    </Button>

    <Button
      onClick={() => setShowCancelDialog(true)}
      className="w-full h-9 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs rounded-none shadow-none"
    >
      Cancel
    </Button>
  </div>

</aside>

      </main>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this transaction? All items will be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              className="rounded-none"
            >
              No, Keep Items
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setItems([]);
                setDiscount(0);
                setShowCancelDialog(false);
              }}
              className="rounded-none"
            >
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscountDialog} onOpenChange={setShowDiscountDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Apply Discount</DialogTitle>
            <DialogDescription>
              Choose discount type and enter the amount
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setDiscountType("percentage")}
                className={`flex-1 h-12 rounded-none font-bold ${
                  discountType === "percentage"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Percentage %
              </Button>
              <Button
                onClick={() => setDiscountType("fixed")}
                className={`flex-1 h-12 rounded-none font-bold ${
                  discountType === "fixed"
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Fixed Amount $
              </Button>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">
                {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "Enter percentage (e.g., 10)" : "Enter amount (e.g., 5.00)"}
                  className="h-12 text-lg font-semibold rounded-none border-2 border-slate-300 focus:border-primary"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  {discountType === "percentage" ? "%" : "$"}
                </span>
              </div>
            </div>

            {discountValue && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded">
                <div className="text-xs text-emerald-700 font-semibold mb-1">Discount Preview</div>
                <div className="text-lg font-bold text-emerald-800">
                  -${discountType === "percentage" 
                    ? ((subtotal * parseFloat(discountValue)) / 100).toFixed(2)
                    : parseFloat(discountValue).toFixed(2)
                  }
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDiscountDialog(false);
                setDiscountValue("");
              }}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyDiscount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none"
            >
              Apply Discount
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}