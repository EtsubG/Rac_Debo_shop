import { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Phone,
  User,
  MessageSquare,
  FileImage,
  Upload,
  Minus,
  Plus,
  Landmark,
} from 'lucide-react';

import type { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button, Input, Textarea } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { createOrder } from '@/api';
import { paymentInstructions } from '@/data/mockData';

interface OrderModalProps {
  product: Product;
  onClose: () => void;
}

const steps = ['Variant', 'Quantity', 'Details', 'Summary'] as const;
type StepName = (typeof steps)[number];

export function OrderModal({ product, onClose }: OrderModalProps) {
  const toast = useToast();

  const [step, setStep] = useState<StepName>('Variant');

  const [selectedVariant, setSelectedVariant] =
    useState<string | null>(null);

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [notes, setNotes] = useState('');

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] =
    useState<string | null>(null);

  const activeVariants = product.variants.filter(
    (v) => v.active
  );

  const variant = activeVariants.find(
    (v) => v.id === selectedVariant
  );

  const total = product.price * quantity;

  const stepIndex = steps.indexOf(step);

  const canProceed = () => {
    if (step === 'Variant') {
      return Boolean(selectedVariant && selectedSize);
    }

    if (step === 'Quantity') {
      return quantity > 0;
    }

    if (step === 'Details') {
      return Boolean(
        name.trim() &&
        phone.trim() &&
        telegram.trim()
      );
    }

    return true;
  };

  const handleNext = () => {
    const index = steps.indexOf(step);

    if (index < steps.length - 1) {
      setStep(steps[index + 1]);
    }
  };

  const handleBack = () => {
    const index = steps.indexOf(step);

    if (index > 0) {
      setStep(steps[index - 1]);
    }
  };

  const handleFile = (file: File) => {
    if (
      !file.type.match(
        /^image\/(jpeg|jpg|png)$/
      )
    ) {
      toast.show(
        'Please upload a JPG or PNG image',
        'error'
      );
      return;
    }

    setUploadedFile(file);

    toast.show(
      'Payment proof uploaded successfully',
      'success'
    );
  };

  const handleSubmit = async () => {
    if (!variant || !selectedSize) {
      toast.show(
        'Please complete your order first',
        'warning'
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        'customerName',
        name.trim()
      );

      formData.append(
        'phone',
        phone.trim()
      );

      formData.append(
        'telegram',
        telegram.trim()
      );

      if (notes.trim()) {
        formData.append(
          'notes',
          notes.trim()
        );
      }

      formData.append(
        'items',
        JSON.stringify([
          {
            productId: product.id,
            color: variant.color,
            size: selectedSize,
            quantity,
          },
        ])
      );

      /*
       * Payment proof is OPTIONAL.
       *
       * If the customer uploaded a proof,
       * send it to the backend.
       *
       * If they did not upload one,
       * the backend will create the order
       * with "Awaiting Payment".
       */
      if (uploadedFile) {
        formData.append(
          'proof',
          uploadedFile
        );
      }

      const response = await createOrder(formData);

      setOrderNumber(
        response.order.orderNumber
      );

      setSubmitted(true);

      toast.show(
        'Order placed successfully!',
        'success'
      );
    } catch (error) {
      console.error(
        'Order creation failed:',
        error
      );

      toast.show(
        error instanceof Error
          ? error.message
          : 'Failed to place order',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);

    toast.show(
      'Copied to clipboard',
      'info'
    );
  };

  if (submitted) {
    return (
      <Modal
        open={true}
        onClose={onClose}
        size="md"
      >
        <div className="p-6 lg:p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-5">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>

          <h2 className="text-2xl font-extrabold text-navy-800 mb-2">
            Order Placed!
          </h2>

          <p className="text-navy-400 mb-6">
            Save your order number to track your order later.
          </p>

          <div className="bg-navy-50 rounded-2xl p-5 mb-4">
            <p className="text-xs text-navy-400 font-semibold uppercase tracking-wide mb-1">
              Your Order Number
            </p>

            <p className="text-3xl font-extrabold text-brand-cranberry tracking-tight">
              {orderNumber}
            </p>
          </div>

          <p className="text-sm text-navy-500 mb-6">
            {uploadedFile
              ? 'Your payment proof has been submitted and will be reviewed by an admin.'
              : 'Your order was placed without payment proof. You can pay later and provide your payment proof.'}
          </p>

          <Button
            fullWidth
            size="lg"
            onClick={onClose}
          >
            <Check className="w-5 h-5" />
            Got It
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      size="lg"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-navy-100">
        <div className="flex items-start gap-4">
          <img
            src={product.image}
            alt={product.title}
            className="w-16 h-16 rounded-xl object-cover"
          />

          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-navy-800">
              {product.title}
            </h2>

            <p className="text-sm text-navy-400">
              {product.price.toLocaleString()} ETB
            </p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mt-5">
          {steps.map((s, i) => (
            <div
              key={s}
              className="flex items-center flex-1 last:flex-none"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i < stepIndex
                    ? 'bg-emerald-500 text-white'
                    : i === stepIndex
                    ? 'bg-brand-cranberry text-white'
                    : 'bg-navy-100 text-navy-400'
                }`}
              >
                {i < stepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>

              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full ${
                    i < stepIndex
                      ? 'bg-emerald-400'
                      : 'bg-navy-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2">
          {steps.map((s) => (
            <span
              key={s}
              className={`text-[11px] font-semibold ${
                s === step
                  ? 'text-brand-cranberry'
                  : 'text-navy-400'
              }`}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">

        {/* Step 1 */}
        {step === 'Variant' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="text-sm font-bold text-navy-700 mb-3 block">
                Select Color
              </label>

              <div className="flex flex-wrap gap-2">
                {activeVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVariant(v.id);
                      setSelectedSize(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                      selectedVariant === v.id
                        ? 'border-brand-cranberry bg-brand-50'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-navy-200"
                      style={{
                        backgroundColor: v.hex,
                      }}
                    />

                    <span className="text-sm font-semibold text-navy-700">
                      {v.color}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {variant && (
              <div>
                <label className="text-sm font-bold text-navy-700 mb-3 block">
                  Select Size
                </label>

                <div className="flex flex-wrap gap-2">
                  {variant.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(size)
                      }
                      className={`min-w-[48px] px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                        selectedSize === size
                          ? 'border-brand-cranberry bg-brand-50 text-brand-700'
                          : 'border-navy-200 text-navy-600 hover:border-navy-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 */}
        {step === 'Quantity' && (
          <div className="flex flex-col items-center justify-center py-8">
            <label className="text-sm font-bold text-navy-700 mb-5">
              Select Quantity
            </label>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.max(1, q - 1)
                  )
                }
                className="w-12 h-12 rounded-xl border-2 border-navy-200 flex items-center justify-center hover:border-brand-cranberry hover:bg-brand-50 transition"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div className="w-20 text-center">
                <span className="text-4xl font-extrabold text-navy-800">
                  {quantity}
                </span>
              </div>

              <button
                onClick={() =>
                  setQuantity((q) =>
                    Math.min(99, q + 1)
                  )
                }
                className="w-12 h-12 rounded-xl border-2 border-navy-200 flex items-center justify-center hover:border-brand-cranberry hover:bg-brand-50 transition"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6 text-sm text-navy-400">
              {variant?.color} · {selectedSize}
            </div>

            <div className="mt-4 text-3xl font-extrabold text-brand-cranberry">
              {total.toLocaleString()}{' '}
              <span className="text-base text-navy-400 font-semibold">
                ETB
              </span>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 'Details' && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label="Full Name"
              placeholder="e.g. Hanna Tesfaye"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

            <Input
              label="Phone Number"
              placeholder="e.g. 0912345678"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />

            <Input
              label="Telegram Username"
              placeholder="@username"
              value={telegram}
              onChange={(e) =>
                setTelegram(e.target.value)
              }
              hint="We'll contact you via Telegram with order updates."
            />

            <Textarea
              label="Notes (Optional)"
              placeholder="Delivery preferences, special requests..."
              rows={3}
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
            />
          </div>
        )}

        {/* Step 4 */}
        {step === 'Summary' && (
          <div className="space-y-5 animate-fade-in">

            {/* Summary */}
            <div className="bg-navy-50 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-navy-500">
                  Product
                </span>

                <span className="font-semibold text-navy-800">
                  {product.title}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-navy-500">
                  Color
                </span>

                <span className="font-semibold text-navy-800">
                  {variant?.color}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-navy-500">
                  Size
                </span>

                <span className="font-semibold text-navy-800">
                  {selectedSize}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-navy-500">
                  Quantity
                </span>

                <span className="font-semibold text-navy-800">
                  {quantity}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-navy-500">
                  Customer
                </span>

                <span className="font-semibold text-navy-800">
                  {name}
                </span>
              </div>

              <div className="border-t border-navy-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-navy-700">
                  Total
                </span>

                <span className="text-2xl font-extrabold text-brand-cranberry">
                  {total.toLocaleString()} ETB
                </span>
              </div>
            </div>

            {/* Payment */}
            <div>
              <h3 className="text-sm font-bold text-navy-700 mb-3">
                Payment
              </h3>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
                <div className="flex gap-3">
                  <Landmark className="w-5 h-5 text-blue-500 shrink-0" />

                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      Payment is optional
                    </p>

                    <p className="text-xs text-blue-600 mt-1">
                      You can pay now and upload your proof,
                      or place the order and pay later.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {paymentInstructions.map(
                  (pi) => (
                    <div
                      key={pi.label}
                      className="flex items-center justify-between bg-white border border-navy-100 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-xs text-navy-400 font-semibold">
                          {pi.label}
                        </p>

                        <p className="text-sm font-bold text-navy-800">
                          {pi.value}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            pi.value
                          )
                        }
                        className="text-navy-300 hover:text-brand-cranberry transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Payment proof */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-navy-700">
                  Payment Proof
                </h3>

                <span className="text-xs font-semibold text-navy-400">
                  Optional
                </span>
              </div>

              {uploadedFile ? (
                <div className="flex items-center gap-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                  <FileImage className="w-8 h-8 text-emerald-500" />

                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-700">
                      {uploadedFile.name}
                    </p>

                    <p className="text-xs text-emerald-500">
                      Ready to submit
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setUploadedFile(null)
                    }
                    className="p-2 text-emerald-400 hover:text-emerald-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() =>
                    setDragOver(false)
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);

                    const file =
                      e.dataTransfer.files[0];

                    if (file) {
                      handleFile(file);
                    }
                  }}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all ${
                    dragOver
                      ? 'border-brand-cranberry bg-brand-50'
                      : 'border-navy-200 hover:border-brand-cranberry hover:bg-brand-50/50'
                  }`}
                >
                  <Upload className="w-10 h-10 text-navy-300 mb-2" />

                  <p className="text-sm font-semibold text-navy-700">
                    Upload payment proof
                  </p>

                  <p className="text-xs text-navy-400 mt-1">
                    Optional · JPG or PNG
                  </p>

                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (file) {
                        handleFile(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {!uploadedFile && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-700">
                  Paying later?
                </p>

                <p className="text-xs text-amber-600 mt-1">
                  That's okay. Your order will be created
                  as "Awaiting Payment".
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between bg-navy-50/50">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={stepIndex === 0}
          icon={
            <ArrowLeft className="w-4 h-4" />
          }
        >
          Back
        </Button>

        {step === 'Summary' ? (
          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !variant ||
              !selectedSize
            }
            icon={
              <CheckCircle2 className="w-5 h-5" />
            }
          >
            {submitting
              ? 'Submitting...'
              : 'Complete Order'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Modal>
  );
}