import { useState } from 'react';
import { Plus, Pencil, Trash2, Package, Eye, EyeOff, Check, X, Palette } from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import { Badge, Button, Input } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface ProductManagerProps {
  products: Product[];
}

const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', 'Adjustable', '11oz'];

export function ProductManager({ products }: ProductManagerProps) {
  const toast = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-cranberry" />
          <h2 className="text-base font-bold text-navy-800">Products & Variants</h2>
        </div>
        <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowAdd(true)}>
          Add Product
        </Button>
      </div>

      {/* Product list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden">
            <div className="flex gap-4 p-4">
              <img src={product.image} alt={product.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-800 text-sm truncate">{product.title}</h3>
                    <p className="text-xs text-navy-400">{product.category} · {product.price.toLocaleString()} ETB</p>
                  </div>
                  <Badge color={product.active ? 'emerald' : 'gray'}>
                    {product.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  {product.variants.slice(0, 5).map((v) => (
                    <div
                      key={v.id}
                      className={`w-4 h-4 rounded-full border border-navy-200 ${!v.active ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: v.hex }}
                      title={v.color}
                    />
                  ))}
                  <span className="text-xs text-navy-400 ml-1">{product.variants.length} variants</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <Button variant="outline" size="sm" fullWidth onClick={() => setEditing(product)} icon={<Pencil className="w-4 h-4" />}>
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <ProductEditModal product={editing} onClose={() => setEditing(null)} onSave={() => { toast.show('Product updated successfully', 'success'); setEditing(null); }} />
      )}

      {/* Add modal */}
      {showAdd && (
        <ProductEditModal product={null} onClose={() => setShowAdd(false)} onSave={() => { toast.show('Product added successfully', 'success'); setShowAdd(false); }} />
      )}
    </div>
  );
}

interface ProductEditModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

function ProductEditModal({ product, onClose, onSave }: ProductEditModalProps) {
  const [title, setTitle] = useState(product?.title || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [target, setTarget] = useState(product?.target.toString() || '');
  const [active, setActive] = useState(product?.active ?? true);
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || [{ id: 'new1', color: 'White', hex: '#FFFFFF', sizes: ['S', 'M', 'L'], active: true }]

  );
  const addVariant = () => {
  setVariants((prev) => [
    ...prev,
    {
      id: `new-${Date.now()}`,
      color: 'New Color',
      hex: '#000000',
      sizes: [],
      active: true,
    },
  ]);
  };
  const removeVariant = (id: string) => {
  setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const toggleVariant = (id: string) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, active: !v.active } : v)));
  };

  const toggleSize = (id: string, size: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const has = v.sizes.includes(size);
        return { ...v, sizes: has ? v.sizes.filter((s) => s !== size) : [...v.sizes, size] };
      })
    );
  };

  return (
    <Modal open={true} onClose={onClose} title={product ? 'Edit Product' : 'Add New Product'} size="lg">
      <div className="p-6 space-y-5">
        {/* Basic info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Product Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Classic Logo T-Shirt" />
          <Input label="Price (ETB)" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="650" type="number" />
        </div>
        <Input label="Pre-order Target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="100" type="number" />

        {/* Active toggle */}
        <div className="flex items-center justify-between bg-navy-50 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-navy-700">Product Availability</span>
          <button
            onClick={() => setActive(!active)}
            className={`relative w-12 h-7 rounded-full transition-all ${active ? 'bg-emerald-500' : 'bg-navy-200'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-navy-500" />
            <h3 className="text-sm font-bold text-navy-700">Color Variants</h3>
          </div>
          <div className="space-y-3">
            {variants.map((v) => (
              <div key={v.id} className="border border-navy-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Color picker */}
                    <input
                      type="color"
                      value={v.hex}
                      onChange={(e) =>
                        setVariants((prev) =>
                          prev.map((variant) =>
                            variant.id === v.id
                              ? { ...variant, hex: e.target.value }
                              : variant
                          )
                        )
                      }
                      className="w-10 h-10 rounded-lg border-2 border-navy-200 cursor-pointer p-1"
                      title="Choose color"
                    />

                    {/* Color name */}
                    <div>
                      <Input
                        value={v.color}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((variant) =>
                              variant.id === v.id
                                ? { ...variant, color: e.target.value }
                                : variant
                            )
                          )
                        }
                        placeholder="Color name"
                      />

                      <p className="text-xs text-navy-400 mt-1">
                        {v.hex}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={addVariant}
                  >
                    Add Color
                  </Button>

                  <button
                    onClick={() => toggleVariant(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      v.active ? 'bg-emerald-100 text-emerald-700' : 'bg-navy-100 text-navy-400'
                    }`}
                  >
                    {v.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {v.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => removeVariant(v.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                </div>
                <div>
                  <p className="text-xs text-navy-400 font-semibold mb-2">Available Sizes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {allSizes.map((size) => {
                      const has = v.sizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSize(v.id, size)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${
                            has
                              ? 'border-brand-cranberry bg-brand-50 text-brand-700'
                              : 'border-navy-200 text-navy-400'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-2 border-t border-navy-100">
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth onClick={onSave} icon={<Check className="w-5 h-5" />}>Save Product</Button>
        </div>
      </div>
    </Modal>
  );
}
