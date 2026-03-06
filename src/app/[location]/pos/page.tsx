"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";
import { usePOSTransaction } from "@/hooks/usePOSTransaction";
import { usePOSItemLookup } from "@/hooks/usePOSItemLookup";
import { addLineItem, updateLineItemPrice, updateLineItemQuantity, deleteLineItem, applyDiscount, getTransaction } from "@/lib/api/pos.api";
import { isStorageAvailable } from "@/utils/pos-storage";
import { toast } from "sonner";

interface Item {
  id: string;
  lineItemId?: string;
  description: string;
  quantity: number;
  price: number;
  upc: string;
  isUpdatingQuantity?: boolean;
  isDeletingItem?: boolean;
}

interface TransactionLineItem {
  id: number;
  itemId: string;
  quantity: number;
  price: number;
}

export default function POSPage() {
  const params = useParams();
  const location = params.location as string;
  const { locations } = useAppSelector((state) => state.locations);
  const locationData = locations.find(loc => loc.slug === location);
  const locationId = locationData?.id || 1;
  
  const { transactionId, numericTransactionId, transactionDate, isLoading, initializeTransaction, resetTransaction } = usePOSTransaction(locationId, location);
  const { isScanning, scanItem } = usePOSItemLookup(location);
  
  const productRef = useRef<HTMLInputElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [productCode, setProductCode] = useState("");
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);
  const [showEditPriceDialog, setShowEditPriceDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [discount, setDiscount] = useState(0);
  const [backendDiscountAmount, setBackendDiscountAmount] = useState(0);
  const [backendTotal, setBackendTotal] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Check if localStorage is available (warn about incognito mode)
    if (!isStorageAvailable()) {
      toast.warning('POS may not work properly in incognito/private mode. Transaction data will not persist on refresh.');
    }

    // Initialize transaction and restore line items if any
    initializeTransaction().then((transactionData) => {
      if (transactionData.lineItems && transactionData.lineItems.length > 0) {
        console.log('[POS Page] Restoring', transactionData.lineItems.length, 'line items');
        
        // Map API line items to UI Item format
        const restoredItems: Item[] = transactionData.lineItems.map((lineItem) => ({
          id: `restored-${lineItem.id}`,
          lineItemId: lineItem.id.toString(),
          description: lineItem.item.description,
          quantity: lineItem.quantity,
          price: lineItem.overridePrice ? parseFloat(lineItem.overridePrice) : parseFloat(lineItem.price),
          upc: lineItem.item.code,
        }));
        
        setItems(restoredItems);
        toast.success(`Restored ${transactionData.lineItems.length} item(s) from previous session`);
      }
      
      // Restore discount if exists
      if (transactionData.discountAmount && parseFloat(transactionData.discountAmount) > 0) {
        setBackendDiscountAmount(parseFloat(transactionData.discountAmount));
        setBackendTotal(parseFloat(transactionData.totalAmount || '0'));
        console.log('[POS Page] Restored discount:', transactionData.discountAmount);
      }
      
      setTimeout(() => productRef.current?.focus(), 100);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const resolveAddedLineItemId = useCallback((lineItems: TransactionLineItem[] | undefined, itemId: string) => {
    if (!lineItems || lineItems.length === 0) return undefined;

    const matching = lineItems.filter((lineItem) => String(lineItem.itemId) === String(itemId));
    if (matching.length === 0) return undefined;

    const latest = matching.reduce((currentLatest, lineItem) =>
      lineItem.id > currentLatest.id ? lineItem : currentLatest
    );

    return latest.id.toString();
  }, []);

  const handleScan = async () => {
    if (!productCode.trim()) return;
    
    const itemData = await scanItem(productCode);
    
    if (itemData) {
      // Check if item already exists
      const existingItem = items.find(i => i.upc === itemData.code);

      if (existingItem && existingItem.lineItemId) {
        const originalQty = existingItem.quantity;
        const newQty = originalQty + quantity;

        setItems(prevItems =>
          prevItems.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: newQty }
              : item
          )
        );

        try {
          await updateLineItemQuantity(
            String(numericTransactionId),
            location,
            existingItem.lineItemId,
            newQty
          );
          toast.success('Quantity updated');
        } catch (error) {
          toast.error('Failed to update quantity');
          console.error('Failed to update quantity:', error);
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: originalQty }
                : item
            )
          );
        }
      } else if (existingItem) {
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === existingItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
        toast.warning('Item is still syncing. Please try again.');
      } else {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const newItem: Item = {
          id: tempId,
          upc: itemData.code,
          description: itemData.description,
          quantity: quantity,
          price: itemData.price,
        };

        // Optimistic UI update
        setItems(prevItems => [...prevItems, newItem]);

        try {
          const response = await addLineItem(String(numericTransactionId), location, {
            itemId: itemData.id,
            quantity: quantity,
          });

          const transactionData = response.data || response;
          const lineItemId = resolveAddedLineItemId(transactionData?.lineItems, itemData.id);

          if (!lineItemId) {
            toast.error('Item added but failed to link line item ID');
          } else {
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === tempId ? { ...item, lineItemId } : item
              )
            );
          }
        } catch (error) {
          toast.error('Failed to save item to transaction');
          console.error('Failed to add line item:', error);
          setItems(prevItems => prevItems.filter((item) => item.id !== tempId));
        }
      }
      
      setProductCode("");
      setQuantity(1);
    }
    
    setTimeout(() => productRef.current?.focus(), 0);
  };

  const removeItem = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || item.isDeletingItem) return;

    if (!item.lineItemId) {
      toast.info('Item removed (was not saved to transaction)');
      setItems(prevItems => prevItems.filter((existingItem) => existingItem.id !== id));
      return;
    }

    setItems(prevItems =>
      prevItems.map(existingItem =>
        existingItem.id === id ? { ...existingItem, isDeletingItem: true } : existingItem
      )
    );

    try {
      await deleteLineItem(
        String(numericTransactionId),
        location,
        item.lineItemId
      );
      
      const remainingItems = items.filter((item) => item.id !== id);
      setItems(prevItems => prevItems.filter((existingItem) => existingItem.id !== id));
      
      // Fetch updated transaction to sync bill with backend
      const updatedTransaction = await getTransaction(String(numericTransactionId), location);
      
      // If no items left, clear discount
      if (remainingItems.length === 0 && parseFloat(updatedTransaction.data.discountAmount || '0') > 0) {
        await applyDiscount(String(numericTransactionId), location, 0);
        setBackendDiscountAmount(0);
        setBackendTotal(0);
      } else {
        // Update with backend values
        setBackendDiscountAmount(parseFloat(updatedTransaction.data.discountAmount || '0'));
        setBackendTotal(parseFloat(updatedTransaction.data.totalAmount || '0'));
      }
      
      toast.success('Item removed from transaction');
    } catch (error) {
      console.error('Failed to delete line item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
      setItems(prevItems =>
        prevItems.map(existingItem =>
          existingItem.id === id ? { ...existingItem, isDeletingItem: false } : existingItem
        )
      );
    }
  };

  const handleQuantityChange = useCallback((itemId: string, newQuantity: string) => {
    const qty = parseInt(newQuantity, 10);
    
    // Validate input
    if (newQuantity === '' || isNaN(qty)) {
      return;
    }
    
    if (qty < 1 || qty > 999) {
      toast.error('Quantity must be between 1 and 999');
      return;
    }

    // Update local state immediately
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: qty } : item
    ));

    // Clear existing timer for this item
    if (debounceTimers.current[itemId]) {
      clearTimeout(debounceTimers.current[itemId]);
    }

    // Set new debounced API call
    debounceTimers.current[itemId] = setTimeout(() => {
      const item = items.find(i => i.id === itemId);
      if (!item?.lineItemId) {
        toast.error('Cannot update quantity: Line item ID not found');
        return;
      }

      setItems(prev =>
        prev.map(i =>
          i.id === itemId ? { ...i, isUpdatingQuantity: true } : i
        )
      );

      (async () => {
        try {
          await updateLineItemQuantity(
            numericTransactionId,
            location,
            item.lineItemId as string,
            qty
          );
          toast.success('Quantity updated successfully');
        } catch (error) {
          console.error('Failed to update quantity:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
        } finally {
          setItems(prev =>
            prev.map(i =>
              i.id === itemId ? { ...i, isUpdatingQuantity: false } : i
            )
          );
        }
      })();
    }, 1000);
  }, [items, location, numericTransactionId]);

  const handleOverride = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setSelectedItem(item);
      setNewPrice(item.price.toString());
      setShowEditPriceDialog(true);
    }
  };

  const handleApplyPriceChange = async () => {
    const price = parseFloat(newPrice);
    if (!isNaN(price) && price >= 0 && selectedItem) {
      setIsUpdatingPrice(true);
      
      try {
        if (!selectedItem.lineItemId) {
          toast.error('Cannot update price: Line item ID not found');
          setIsUpdatingPrice(false);
          return;
        }
        
        await updateLineItemPrice(
          String(numericTransactionId),
          location,
          selectedItem.lineItemId,
          price
        );
        
        // Update local state
        setItems(prevItems => prevItems.map(item => 
          item.id === selectedItem.id ? { ...item, price } : item
        ));
        
        setShowEditPriceDialog(false);
        setNewPrice("");
        setSelectedItem(null);
        toast.success('Price updated successfully');
      } catch (error) {
        console.error('Failed to update price:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update price');
      } finally {
        setIsUpdatingPrice(false);
      }
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * parseFloat(String(item.price))), 0);
  const discountAmount = backendDiscountAmount || 0;
  const total = backendTotal || (subtotal - discountAmount);

  const handleApplyDiscount = async () => {
    const value = parseFloat(discountValue);
    if (!isNaN(value) && value >= 0) {
      const finalDiscountAmount = discountType === "percentage" ? (subtotal * value) / 100 : value;
      
      setIsApplyingDiscount(true);
      try {
        const response = await applyDiscount(String(numericTransactionId), location, finalDiscountAmount);
        
        // Use backend-calculated values
        const data = response.data;
        setBackendDiscountAmount(parseFloat(data.discountAmount));
        setBackendTotal(parseFloat(data.totalAmount));
        setDiscount(value);
        
        setShowDiscountDialog(false);
        setDiscountValue("");
        toast.success('Discount applied successfully');
      } catch (error) {
        console.error('Failed to apply discount:', error);
        toast.error('Failed to apply discount');
      } finally {
        setIsApplyingDiscount(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden relative">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-semibold text-foreground">Initializing Transaction...</p>
          </div>
        </div>
      )}
      
     {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-3 bg-muted/50 border-b border-border flex-none shadow-sm">
        
        {/* Balanced & Refined Customer Field */}
        <div className="flex flex-col w-[35%]">
          <label className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">
            Customer
          </label>
          <Input 
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            placeholder="Search or Enter Name..." 
            className="border border-input h-10 text-sm font-medium bg-background rounded-none 
                       ring-offset-0 focus-visible:ring-0 focus:ring-0 
                       focus:border-primary focus:border-2 transition-all 
                       placeholder:font-normal placeholder:text-muted-foreground"
          />
        </div>

        {/* Transaction Info */}
        <div className="flex gap-8">
          <div className="text-right">
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Transaction ID</div>
            <div className="text-sm font-bold text-foreground">{transactionId}</div>
          </div>
          <div className="text-right border-l pl-8 border-border">
            <div className="text-[9px] font-bold text-muted-foreground uppercase">Date</div>
            <div className="text-sm font-medium text-foreground">{transactionDate}</div>
          </div>
        </div>
        
      </header>

      {/* SCANNING BAR */}
      <section className="p-3 bg-background border-b border-border flex gap-4 items-end flex-none">
        <div className="w-20">
          <label className="text-[10px] font-bold mb-1 block uppercase text-muted-foreground">Qty</label>
          <Input 
            type="number" 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className="border-input h-9 text-center font-bold rounded-none" 
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold mb-1 block uppercase text-muted-foreground">Product Code / UPC</label>
          <Input 
            ref={productRef}
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            disabled={isScanning}
            className="border-input h-9 text-sm rounded-none" 
          />
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* LEFT: Table Section */}
        <div className="flex-1 overflow-auto bg-background p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                <th className="pb-2 w-10"></th>
                <th className="pb-2 w-16">Qty</th>
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground text-xs italic uppercase tracking-tighter">Ready for Scanning</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="text-sm">
                    <td className="py-2.5">
                      <div className="relative inline-block">
                        <X 
                          className={`h-4 w-4 text-muted-foreground hover:text-red-600 ${
                            item.isDeletingItem ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                          }`} 
                          onClick={() => !item.isDeletingItem && removeItem(item.id)} 
                        />
                        {item.isDeletingItem && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          className="w-16 h-8 text-center font-bold border-input rounded-none"
                          disabled={item.isUpdatingQuantity}
                        />
                        {item.isUpdatingQuantity && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5">
                      <div className="font-normal text-foreground uppercase text-xs">{item.description}</div>
                      <div className="text-[9px] text-muted-foreground font-mono">UPC: {item.upc}</div>
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
       <aside className="w-72 bg-muted/50 border-l border-border flex flex-col p-5">

  <div className="mb-5">
    <h3 className="text-xs font-black uppercase text-muted-foreground mb-3 tracking-widest border-b border-border pb-2">
      Bill Summary
    </h3>

    <div className="space-y-3 py-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Discount</span>
        <span className="text-emerald-700 dark:text-emerald-400">-${discountAmount.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm border-b border-border pb-2">
        <span className="text-muted-foreground">Tax</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between items-baseline pt-2">
        <span className="font-bold text-sm uppercase">Total</span>
        <span className="text-2xl font-black text-foreground">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Paid</span>
        <span>$0.00</span>
      </div>

      <div className="flex justify-between pt-2 border-t border-border">
        <span className="font-bold text-sm uppercase">Balance</span>
        <span className="font-bold text-lg text-rose-700 dark:text-rose-400">
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
              onClick={async () => {
                setItems([]);
                setDiscount(0);
                setShowCancelDialog(false);
                resetTransaction();
                await initializeTransaction();
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
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Percentage %
              </Button>
              <Button
                onClick={() => setDiscountType("fixed")}
                className={`flex-1 h-12 rounded-none font-bold ${
                  discountType === "fixed"
                    ? "bg-primary text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                Fixed Amount $
              </Button>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">
                {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "Enter percentage (e.g., 10)" : "Enter amount (e.g., 5.00)"}
                  className="h-12 text-lg font-semibold rounded-none border-2 border-input focus:border-primary"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">
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
              disabled={isApplyingDiscount}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyDiscount}
              disabled={isApplyingDiscount}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-none"
            >
              {isApplyingDiscount ? 'Applying...' : 'Apply Discount'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Price Dialog */}
      <Dialog open={showEditPriceDialog} onOpenChange={setShowEditPriceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Price</DialogTitle>
            <DialogDescription>
              Enter the new price for this item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-3 rounded border border-border">
              <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Item</div>
              <div className="text-sm font-bold text-foreground">{selectedItem?.description}</div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-bold text-muted-foreground uppercase">Current Price</span>
              <span className="text-xl font-bold text-foreground">${selectedItem?.price.toFixed(2)}</span>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground mb-2 block uppercase">
                New Price
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                className="h-12 text-2xl font-bold text-center rounded-none border-2 border-input focus:border-primary"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditPriceDialog(false);
                setNewPrice("");
                setSelectedItem(null);
              }}
              disabled={isUpdatingPrice}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyPriceChange}
              disabled={!newPrice || isNaN(parseFloat(newPrice)) || parseFloat(newPrice) < 0 || isUpdatingPrice}
              className="bg-primary hover:bg-primary/90 text-white rounded-none"
            >
              {isUpdatingPrice ? 'Updating...' : 'Apply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
