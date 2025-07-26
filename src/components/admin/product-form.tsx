
"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { categoryData } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Omit<Product, 'id'> | Product) => void;
}

const initialProductState: Omit<Product, 'id' | 'rating' | 'featured'> = {
  name: '',
  description: '',
  price: 0,
  currency: 'KES',
  stock: 0,
  category: 'Laptops',
  brand: '',
  imageUrl: '',
};

export default function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState(product || initialProductState);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product.imageUrl);
    } else {
      setFormData(initialProductState);
      setImagePreview(null);
    }
  }, [product]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumericField = name === 'price' || name === 'stock';
    const newValue = isNumericField ? Number(value) : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (name === 'imageUrl') {
      setImagePreview(value);
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as any }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="brand" className="text-right">Brand</Label>
          <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">Category</Label>
          <Select onValueChange={handleCategoryChange} defaultValue={formData.category}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryData.map(cat => <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">Price (KES)</Label>
          <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} className="col-span-3" required />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="stock" className="text-right">Stock</Label>
          <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} className="col-span-3" required />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Image</Label>
            <div className="col-span-3 space-y-4">
                <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    placeholder="Enter Image URL"
                    value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl} 
                    onChange={handleInputChange} 
                />
                
                <div className="relative flex items-center justify-center w-full">
                    <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted/50 border-primary/30 hover:border-primary/60">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 1MB</p>
                        </div>
                        <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                    </Label>
                </div>
            </div>
        </div>

        {imagePreview && (
            <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Preview</Label>
                <div className="col-span-3">
                    <Image src={imagePreview} alt="Product preview" width={100} height={100} className="rounded-md border p-1" />
                </div>
            </div>
        )}

      </div>
      <DialogFooter>
        <Button type="submit">Save Product</Button>
      </DialogFooter>
    </form>
  );
}
