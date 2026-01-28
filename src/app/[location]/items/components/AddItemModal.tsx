"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { Plus } from "lucide-react";
import { ItemRow } from "../itemsListing.api";
import {
  getItemCategories,
  createItemCategory,
  type ItemCategoryOption,
} from "../itemCategories.api";
import {
  TAX_STATUS_OPTIONS,
  STATUS_OPTIONS,
  TAX_STATUS_ID_MAP,
  type TaxStatusLabel,
  type StatusLabel,
} from "../items.constants";
import { apiClient } from "@/lib/api/client";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (itemData?: Partial<ItemRow>, itemId?: number) => void;
  location: string;
  initialData?: ItemRow | null;
  mode?: "add" | "edit";
}

interface ItemFormData {
  itemCategory: string;
  code: string;
  description: string;
  price: string;
  royaltyFree: "Yes" | "No";
  tax: TaxStatusLabel;
  status: StatusLabel;
}

const taxOptions = [...TAX_STATUS_OPTIONS];
const statusOptions = [...STATUS_OPTIONS];

export function AddItemModal({ isOpen, onClose, onSuccess, location, initialData = null, mode = "add" }: AddItemModalProps) {
  const [formData, setFormData] = React.useState<ItemFormData>({
    itemCategory: "",
    code: "",
    description: "",
    price: "",
    royaltyFree: "No",
    tax: "No Tax",
    status: "Enable",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showRoyaltyFreeConfirm, setShowRoyaltyFreeConfirm] = React.useState(false);
  const [itemCategoryOptions, setItemCategoryOptions] = React.useState<{ value: string; label: string }[]>([]);
  const [itemCategoriesLoading, setItemCategoriesLoading] = React.useState(false);
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isCreatingCategory, setIsCreatingCategory] = React.useState(false);
  const lastCategoriesLocationRef = React.useRef<string | null>(null);
  const [itemCategories, setItemCategories] = React.useState<ItemCategoryOption[]>([]);

  // Initialize form data when modal opens or initialData changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData && mode === "edit") {
        setFormData({
          itemCategory: initialData.itemCategory || "",
          code: initialData.code || "",
          description: initialData.description || "",
          price: initialData.price?.toString() || "",
          royaltyFree: (initialData.royaltyFree === "Yes" ? "Yes" : "No") as "Yes" | "No",
          tax: (initialData.tax as TaxStatusLabel) || "No Tax",
          status: (initialData.status as StatusLabel) || "Enable",
        });
      } else {
        setFormData({
          itemCategory: "",
          code: "",
          description: "",
          price: "",
          royaltyFree: "No",
          tax: "No Tax",
          status: "Enable",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, mode]);

  // Fetch item categories for the SearchableSelect (when modal opens / location changes)
  const fetchItemCategories = React.useCallback(() => {
    setItemCategoriesLoading(true);
    
    getItemCategories(location)
      .then((res) => {
        if (!res.success) {
          setItemCategoryOptions([]);
          return;
        }
        // Filter duplicates by name to ensure unique keys, keeping the first occurrence
        const seen = new Set<string>();
        const opts = res.data
          .filter((c) => {
            if (seen.has(c.name)) return false;
            seen.add(c.name);
            return true;
          })
          .map((c) => ({ value: c.name, label: c.name }));
        setItemCategoryOptions(opts);
        setItemCategories(res.data);
        lastCategoriesLocationRef.current = location;
      })
      .catch(() => {
        setItemCategoryOptions([]);
      })
      .finally(() => {
        setItemCategoriesLoading(false);
      });
  }, [location]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (lastCategoriesLocationRef.current === location && itemCategoryOptions.length > 0) return;
    fetchItemCategories();
  }, [isOpen, location, itemCategoryOptions.length, fetchItemCategories]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be blank");
      return;
    }

    setIsCreatingCategory(true);
    try {
      const response = await createItemCategory(location, { name: newCategoryName.trim() });
      if (response.success) {
        toast.success("Item category created successfully");
        // Update local lists so the new category is immediately available
        setItemCategories((prev) => [...prev, response.data]);
        setItemCategoryOptions((prev) => [
          ...prev,
          { value: response.data.name, label: response.data.name },
        ]);
        setNewCategoryName("");
        setShowCreateCategoryDialog(false);
        // Refresh categories list
        fetchItemCategories();
        // Set the newly created category as selected
        handleInputChange("itemCategory", response.data.name);
      } else {
        toast.error(response.message || "Failed to create item category");
      }
    } catch {
      toast.error("Failed to create item category");
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleInputChange = (field: keyof ItemFormData, value: string | "Yes" | "No" | "Enable" | "Disable") => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoyaltyFreeConfirm = async () => {
    setShowRoyaltyFreeConfirm(false);
    // Proceed with form submission after confirmation
    await submitForm();
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemCategory.trim()) {
      newErrors.itemCategory = "Item Category cannot be blank.";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code cannot be blank.";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description cannot be blank.";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price cannot be blank.";
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue < 0) {
        newErrors.price = "Price must be a valid number greater than or equal to 0";
      }
    }

    if (!formData.tax.trim()) {
      newErrors.tax = "Tax Status cannot be blank.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitForm = async () => {
    setIsLoading(true);

    try {
      // Resolve selected item category to its backend ID
      const selectedCategory = itemCategories.find(
        (c) => c.name === formData.itemCategory
      );

      if (!selectedCategory) {
        toast.error("Please select a valid Item Category");
        setIsLoading(false);
        return;
      }

      const taxStatusId = TAX_STATUS_ID_MAP[formData.tax];

      if (!taxStatusId) {
        toast.error("Please select a valid Tax Status");
        setIsLoading(false);
        return;
      }

      const priceValue = parseFloat(formData.price);

      const requestBody = {
        itemCategoryId: selectedCategory.id,
        code: formData.code,
        description: formData.description,
        price: priceValue,
        royaltyFree: formData.royaltyFree === "Yes",
        taxStatusId,
        status: formData.status === "Enable",
      };

      const itemData: Partial<ItemRow> = {
        itemCategory: formData.itemCategory,
        code: formData.code,
        description: formData.description,
        price: priceValue,
        royaltyFree: formData.royaltyFree,
        tax: formData.tax,
        status: formData.status,
      };

      if (mode === "edit" && initialData) {
        // Defensive guard: if id is missing, avoid sending /items/undefined
        if (initialData.id == null) {
          toast.error("Item id is missing. Please reload the page and try again.");
          setIsLoading(false);
          return;
        }

        // Update existing item
        const response = await apiClient.put(
          `/admin/v2/${location}/items/${initialData.id}`,
          requestBody
        );

        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to update item");
        }

        const updatedItem: ItemRow = {
          id: initialData.id,
          ...itemData,
        } as ItemRow;

        toast.success(response.data?.message || "Item updated successfully");
        onSuccess?.(updatedItem, initialData.id);
      } else {
        // Create new item
        const response = await apiClient.post(
          `/admin/v2/${location}/items`,
          requestBody
        );

        if (response.data?.success === false) {
          throw new Error(response.data?.message || "Failed to add item");
        }

        const apiId =
          (response.data?.data && (response.data.data.id as number | undefined)) ||
          undefined;

        const newItem: ItemRow = {
          id: apiId ?? Date.now(),
          ...itemData,
        } as ItemRow;

        toast.success(response.data?.message || "Item added successfully");
        onSuccess?.(newItem, newItem.id);
      }

      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${mode === "edit" ? "update" : "add"} item`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show confirmation modal if Royalty Free is "Yes"
    if (formData.royaltyFree === "Yes") {
      setShowRoyaltyFreeConfirm(true);
      return;
    }

    // Otherwise, submit directly
    await submitForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Item" : "Item"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Row 1: Item Category and Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemCategory" className={errors.itemCategory ? "text-red-600 dark:text-red-400" : ""}>
                  Item Category
                </Label>
                <div className="flex gap-2">
                  <SearchableSelect
                    id="itemCategory"
                    options={itemCategoryOptions}
                    value={formData.itemCategory}
                    onValueChange={(value) => handleInputChange("itemCategory", value)}
                    placeholder="Select Category"
                    searchPlaceholder="Search categories..."
                    className={errors.itemCategory ? "border-red-500" : ""}
                    isLoading={itemCategoriesLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowCreateCategoryDialog(true)}
                    className="shrink-0"
                    title="Add new category"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.itemCategory && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.itemCategory}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code" className={errors.code ? "text-red-600 dark:text-red-400" : ""}>
                  Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder=""
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                )}
              </div>
            </div>

            {/* Row 2: Description (full width) */}
            <div className="space-y-2">
              <Label htmlFor="description" className={errors.description ? "text-red-600 dark:text-red-400" : ""}>
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder=""
                rows={3}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Row 3: Price and Royalty Free */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className={errors.price ? "text-red-600 dark:text-red-400" : ""}>
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder=""
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Royalty Free</Label>
                <div className="flex items-center justify-start">
                  <SegmentedControl
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" },
                    ]}
                    value={formData.royaltyFree}
                    onValueChange={(value) => handleInputChange("royaltyFree", value as "Yes" | "No")}
                    variant="default"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Tax Status and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax" className={errors.tax ? "text-red-600 dark:text-red-400" : ""}>
                  Tax Status
                </Label>
                <Select
                  value={formData.tax}
                  onValueChange={(value) => handleInputChange("tax", value)}
                >
                  <SelectTrigger id="tax" className={errors.tax ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select Tax" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxOptions.map((tax) => (
                      <SelectItem key={tax} value={tax}>
                        {tax}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tax && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.tax}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value as "Enable" | "Disable")}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? "Saving..." : "save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Royalty Free Confirmation Modal */}
      <DeleteConfirmationModal
        open={showRoyaltyFreeConfirm}
        onOpenChange={setShowRoyaltyFreeConfirm}
        title="Are you sure you want to save this item as royalty free?"
        onConfirm={handleRoyaltyFreeConfirm}
        confirmLabel="OK"
        cancelLabel="Cancel"
      />

      {/* Create Category Dialog */}
      <Dialog open={showCreateCategoryDialog} onOpenChange={setShowCreateCategoryDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newCategoryName">Category Name</Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateCategoryDialog(false);
                setNewCategoryName("");
              }}
              disabled={isCreatingCategory}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {isCreatingCategory ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

