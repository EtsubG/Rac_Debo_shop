import { useEffect, useState } from 'react';
import { Sparkles, Tag, ShoppingBag, Search, X } from 'lucide-react';
import type { Campaign, Product } from '@/types';
import { getActiveCampaign, getProducts } from '@/api';
import { Badge, ProgressBar } from '@/components/ui/Button';
import { OrderModal } from '@/components/OrderModal';

const categories = ['All', 'T-Shirt', 'Hoodie', 'Tote Bag', 'Cap', 'Mug'];

export function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadShop() {
      try {
        setLoading(true);
        setError('');

        const [loadedProducts, campaignResponse] = await Promise.all([
          getProducts(),
          getActiveCampaign(),
        ]);

        if (cancelled) return;

        setProducts(loadedProducts.products);
        setActiveCampaign(campaignResponse?.campaign ?? null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Unable to load the shop.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadShop();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = products.filter((p) => {
    const normalizedProductCategory = p.category.trim().toLowerCase();
    const normalizedActiveCategory = activeCategory.trim().toLowerCase();

    const catMatch =
      activeCategory === 'All' ||
      normalizedProductCategory === normalizedActiveCategory;

    const searchMatch = p.title
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    return catMatch && searchMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Hero / Fundraising Announcement */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-cranberry via-brand-600 to-brand-700 text-white shadow-float mb-6 lg:mb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-16 -translate-x-10" />
        <div className="relative p-6 lg:p-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider opacity-90">
              Fundraising Pre-Order Campaign
            </span>
          </div>
          <h2 className="text-2xl lg:text-4xl font-extrabold leading-tight mb-3 max-w-2xl">
            Welcome to the Rotaract Club of Debo Merchandise Store
          </h2>
          <p className="text-base lg:text-lg opacity-90 max-w-2xl leading-relaxed">
            This pre-order campaign raises funds for our community projects. Select your items,
            place an order, and upload your payment proof to complete your order. Every purchase
            makes a difference.
          </p>

          {activeCampaign && (
            <div className="mt-5 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-sm font-bold">Active Campaign: {activeCampaign.name}</span>
              <span className="text-sm opacity-80">· Ends {activeCampaign.endDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-navy-200 focus:border-brand-cranberry outline-none text-navy-800 placeholder:text-navy-300 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-navy-800 text-white shadow-soft'
                  : 'bg-white border-2 border-navy-200 text-navy-500 hover:border-navy-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 rounded-full border-4 border-navy-100 border-t-brand-cranberry animate-spin mb-4" />
          <p className="text-sm font-medium text-navy-500">Loading products...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 rounded-2xl border border-red-100">
          <p className="text-lg font-bold text-red-700">Could not load the shop</p>
          <p className="text-sm text-red-500 mt-1">{error}</p>
          <p className="text-xs text-red-400 mt-2">
            Make sure the backend is running and VITE_API_URL points to its /api endpoint.
          </p>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-navy-50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-navy-300" />
            </div>
            <h3 className="text-lg font-bold text-navy-700">No products found</h3>
            <p className="text-sm text-navy-400 mt-1">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOrder={() => setOrderProduct(product)}
              />
            ))}
          </div>
        )
      )}

      {/* Order Modal */}
      {orderProduct && (
        <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onOrder: () => void;
}

function ProductCard({ product, onOrder }: ProductCardProps) {
  const availableVariants = product.variants.filter((v) => v.active);
  const activeColors = availableVariants.slice(0, 4);
  const [showImagePreview, setShowImagePreview] = useState(false);

  return (
    <div
      className="group bg-white rounded-2xl border border-navy-100 overflow-hidden shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col cursor-pointer"
      onClick={onOrder}
    >
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-navy-50"
        onClick={(e) => {
          e.stopPropagation();
          setShowImagePreview(true);
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge color="navy" variant="solid">
            <Tag className="w-3 h-3" />
            {product.category}
          </Badge>
        </div>
        {!product.active && (
          <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
            <Badge color="gray" variant="solid" className="text-sm">
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-navy-800 text-base leading-snug mb-1">{product.title}</h3>
        <p className="text-sm text-navy-400 leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Real color variants */}
        <div className="flex items-center gap-1.5 mb-3">
          {activeColors.map((v) => (
            <div
              key={v.id}
              className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-navy-200"
              style={{ backgroundColor: v.hex }}
              title={v.color}
            />
          ))}
          {availableVariants.length > 4 && (
            <span className="text-xs text-navy-400 font-medium ml-1">
              +{availableVariants.length - 4}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-extrabold text-navy-800">
              {product.price.toLocaleString()}
              <span className="text-sm font-semibold text-navy-400 ml-1">ETB</span>
            </span>
          </div>

          <ProgressBar value={product.currentOrders} max={product.target} label="Pre-orders" />

          <button
            onClick={(event) => {
              event.stopPropagation();
              onOrder();
            }}
            disabled={!product.active || availableVariants.length === 0}
            className="mt-4 w-full py-3 rounded-xl font-bold text-sm bg-brand-cranberry text-white hover:bg-brand-600 active:bg-brand-700 transition-all shadow-soft hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            {product.active ? 'Order Now' : 'Unavailable'}
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowImagePreview(false);
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowImagePreview(false);
            }}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/90 text-navy-800 flex items-center justify-center hover:bg-white transition"
            aria-label="Close image preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl max-h-[90vh] flex items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}