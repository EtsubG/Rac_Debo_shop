import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  Eye,
  EyeOff,
  Check,
  Palette,
  ImagePlus,
} from 'lucide-react';

import type {
  Product,
  ProductVariant,
  ProductVariantInput,
  ProductCategory,
} from '@/types';

import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '@/api';

import { Badge, Button, Input } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

interface ProductManagerProps {
  products: Product[];
}

const allSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'One Size',
  'Adjustable',
  '11oz',
];

const categories: ProductCategory[] = [
  'T-Shirt',
  'Hoodie',
  'Tote Bag',
  'Cap',
  'Mug',
];

const oneSizeCategories: ProductCategory[] = [
  'Tote Bag',
  'Cap',
  'Mug',
];

export function ProductManager({ products }: ProductManagerProps) {
  const toast = useToast();

  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep this screen synchronized with AdminPortal.
  if (
    localProducts.length !== products.length ||
    localProducts.some((p, i) => p.id !== products[i]?.id)
  ) {
    setLocalProducts(products);
  }

  const handleCreate = async (input: ProductFormData) => {
    try {
      setLoading(true);

      const result = await createProduct({
        title: input.title.trim(),
        description: input.description.trim(),
        price: Number(input.price),
        category: input.category,
        image: input.image,
        target: Number(input.target),
        active: input.active,
        variants: input.variants,
      });

      setLocalProducts((current) => [...current, result.product]);
      setShowAdd(false);

      toast.show('Product added successfully', 'success');
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to add product',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    productId: string,
    input: ProductFormData
  ) => {
    try {
      setLoading(true);

      const result = await updateProduct(productId, {
        title: input.title.trim(),
        description: input.description.trim(),
        price: Number(input.price),
        category: input.category,
        image: input.image,
        target: Number(input.target),
        active: input.active,
        variants: input.variants,
      });

      setLocalProducts((current) =>
        current.map((product) =>
          product.id === productId ? result.product : product
        )
      );

      setEditing(null);

      toast.show('Product updated successfully', 'success');
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to update product',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteProduct(product.id);

      setLocalProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      toast.show('Product deleted successfully', 'success');
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to delete product',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-cranberry" />
          <h2 className="text-base font-bold text-navy-800">
            Products & Variants
          </h2>
        </div>

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowAdd(true)}
          disabled={loading}
        >
          Add Product
        </Button>
      </div>

      {/* Product list */}
      {localProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-navy-100 p-12 text-center">
          <Package className="w-12 h-12 text-navy-200 mx-auto mb-3" />
          <p className="font-semibold text-navy-500">
            No products found.
          </p>
          <p className="text-sm text-navy-400 mt-1">
            Add your first fundraising product.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {localProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-navy-100 shadow-soft overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {/* Product image */}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                    <ImagePlus className="w-7 h-7 text-navy-300" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-800 text-sm truncate">
                        {product.title}
                      </h3>

                      <p className="text-xs text-navy-400">
                        {product.category} ·{' '}
                        {product.price.toLocaleString()} ETB
                      </p>
                    </div>

                    <Badge color={product.active ? 'emerald' : 'gray'}>
                      {product.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    {product.variants.slice(0, 5).map((variant) => (
                      <div
                        key={variant.id}
                        className={`w-4 h-4 rounded-full border border-navy-200 ${
                          !variant.active ? 'opacity-30' : ''
                        }`}
                        style={{ backgroundColor: variant.hex }}
                        title={variant.color}
                      />
                    ))}

                    <span className="text-xs text-navy-400 ml-1">
                      {product.variants.length} variants
                    </span>
                  </div>

                  <p className="text-xs text-navy-400 mt-2">
                    Target: {product.target.toLocaleString()} units
                  </p>
                </div>
              </div>

              <div className="flex gap-2 px-4 pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => setEditing(product)}
                  disabled={loading}
                  icon={<Pencil className="w-4 h-4" />}
                >
                  Edit
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(product)}
                  disabled={loading}
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit */}
      {editing && (
        <ProductEditModal
          product={editing}
          loading={loading}
          onClose={() => setEditing(null)}
          onSave={(input) => handleUpdate(editing.id, input)}
        />
      )}

      {/* Add */}
      {showAdd && (
        <ProductEditModal
          product={null}
          loading={loading}
          onClose={() => setShowAdd(false)}
          onSave={handleCreate}
        />
      )}
    </div>
  );
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category: ProductCategory;
  image: string;
  target: string;
  active: boolean;
  variants: ProductVariantInput[];
}

interface ProductEditModalProps {
  product: Product | null;
  loading: boolean;
  onClose: () => void;
  onSave: (input: ProductFormData) => void;
}

function ProductEditModal({
  product,
  loading,
  onClose,
  onSave,
}: ProductEditModalProps) {
  const toast = useToast();

  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(
    product?.description || ''
  );
  const [price, setPrice] = useState(
    product ? product.price.toString() : ''
  );
  const [category, setCategory] = useState<ProductCategory>(
    product?.category || 'T-Shirt'
  );
  const [image, setImage] = useState(product?.image || '');
  const [target, setTarget] = useState(
    product ? product.target.toString() : ''
  );
  const [active, setActive] = useState(product?.active ?? true);

  const [variants, setVariants] = useState<ProductVariantInput[]>(
    product?.variants.map((variant) => ({
      color: variant.color,
      hex: variant.hex,
      sizes: variant.sizes,
      active: variant.active,
    })) || [
      {
        color: 'White',
        hex: '#FFFFFF',
        sizes: ['S', 'M', 'L'],
        active: true,
      },
    ]
  );

  const [uploadingImage, setUploadingImage] = useState(false);

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      {
        color: 'New Color',
        hex: '#000000',
        sizes: [],
        active: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const toggleVariant = (index: number) => {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index
          ? { ...variant, active: !variant.active }
          : variant
      )
    );
  };

  const updateVariant = (
    index: number,
    changes: Partial<ProductVariantInput>
  ) => {
    setVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, ...changes } : variant
      )
    );
  };

  const toggleSize = (index: number, size: string) => {
    setVariants((current) =>
      current.map((variant, i) => {
        if (i !== index) return variant;

        const exists = variant.sizes.includes(size);

        return {
          ...variant,
          sizes: exists
            ? variant.sizes.filter((item) => item !== size)
            : [...variant.sizes, size],
        };
      })
    );
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.show(
        'Only JPG, JPEG, and PNG images are allowed',
        'warning'
      );
      return;
    }

    try {
      setUploadingImage(true);

      const result = await uploadProductImage(file);

      setImage(result.url);

      toast.show('Product image uploaded successfully', 'success');
    } catch (error) {
      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to upload product image',
        'error'
      );
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.show('Product title is required', 'warning');
      return;
    }

    if (!price || Number(price) < 0) {
      toast.show('Please enter a valid price', 'warning');
      return;
    }

    if (!target || Number(target) < 0) {
      toast.show('Please enter a valid target', 'warning');
      return;
    }

    if (!category) {
      toast.show('Please select a category', 'warning');
      return;
    }

    const normalizedVariants =
      variants.length === 0 && oneSizeCategories.includes(category)
        ? [
            {
              color: 'Default',
              hex: '#000000',
              sizes: ['One Size'],
              active: true,
            },
          ]
        : variants.map((variant) =>
            oneSizeCategories.includes(category) &&
            variant.sizes.length === 0
              ? { ...variant, sizes: ['One Size'] }
              : variant
          );

    const invalidVariant = normalizedVariants.find(
      (variant) =>
        !variant.color.trim() ||
        !/^#[0-9a-fA-F]{6}$/.test(variant.hex) ||
        (variant.active && variant.sizes.length === 0)
    );

    if (invalidVariant) {
      toast.show(
        'Every active color variant needs a valid color, hex color, and size',
        'warning'
      );
      return;
    }

    if (!normalizedVariants.some((variant) => variant.active)) {
      toast.show('Add at least one active color variant before saving', 'warning');
      return;
    }

    onSave({
      title,
      description,
      price,
      category,
      image,
      target,
      active,
      variants: normalizedVariants,
    });
  };

  return (
    <Modal
      open={true}
      onClose={loading ? () => {} : onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <div className="p-6 space-y-5">
        {/* Basic information */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Rotaract Logo T-Shirt"
          />

          <Input
            label="Price (ETB)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="650"
            type="number"
            min="0"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as ProductCategory)
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-white text-navy-800 outline-none focus:border-brand-cranberry"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-navy-700 mb-1.5">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-navy-200 bg-white text-navy-800 outline-none focus:border-brand-cranberry resize-none"
          />
        </div>

        {/* Target */}
        <Input
          label="Pre-order Target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="100"
          type="number"
          min="0"
        />

        {/* Product image */}
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-navy-700">
              Product Image
            </p>
            <p className="text-xs text-navy-400 mt-1">
              Upload a JPG, JPEG, or PNG image. It will be stored
              centrally so other computers can see it.
            </p>
          </div>

          {image && (
            <div className="relative w-full max-w-xs">
              <img
                src={image}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-xl border border-navy-100"
              />
            </div>
          )}

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-navy-200 text-sm font-semibold text-navy-700 hover:bg-navy-50 cursor-pointer transition">
            <ImagePlus className="w-4 h-4" />

            {uploadingImage
              ? 'Uploading...'
              : image
                ? 'Change Image'
                : 'Upload Image'}

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage || loading}
            />
          </label>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between bg-navy-50 rounded-xl px-4 py-3">
          <div>
            <span className="text-sm font-semibold text-navy-700">
              Product Availability
            </span>

            <p className="text-xs text-navy-400 mt-0.5">
              {active
                ? 'Customers can order this product'
                : 'Product is hidden from customers'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`relative w-12 h-7 rounded-full transition-all ${
              active ? 'bg-emerald-500' : 'bg-navy-200'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                active ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-navy-500" />
              <h3 className="text-sm font-bold text-navy-700">
                Color Variants
              </h3>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={addVariant}
              disabled={loading}
            >
              Add Color
            </Button>
          </div>

          <div className="space-y-3">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="border border-navy-100 rounded-xl p-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="color"
                        value={variant.hex}
                        onChange={(e) =>
                          updateVariant(index, {
                            hex: e.target.value,
                          })
                        }
                        className="w-10 h-10 rounded-lg border-2 border-navy-200 cursor-pointer p-1 shrink-0"
                        title="Choose color"
                      />

                      <div className="flex-1">
                        <Input
                          value={variant.color}
                          onChange={(e) =>
                            updateVariant(index, {
                              color: e.target.value,
                            })
                          }
                          placeholder="Color name"
                        />

                        <p className="text-xs text-navy-400 mt-1">
                          {variant.hex}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleVariant(index)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          variant.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-navy-100 text-navy-400'
                        }`}
                      >
                        {variant.active ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}

                        {variant.active ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-600 hover:bg-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-navy-400 font-semibold mb-2">
                      Available Sizes
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {allSizes.map((size) => {
                        const selected =
                          variant.sizes.includes(size);

                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() =>
                              toggleSize(index, size)
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition ${
                              selected
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
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 pt-2 border-t border-navy-100">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            onClick={handleSubmit}
            disabled={loading || uploadingImage}
            icon={<Check className="w-5 h-5" />}
          >
            {loading
              ? 'Saving...'
              : product
                ? 'Save Changes'
                : 'Save Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}