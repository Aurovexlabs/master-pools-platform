import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { useUploadSingle } from "../../hooks/useApi";
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useToggleProductFeatured,
  useToggleProductPublish,
  useUpdateProduct,
} from "../../hooks/useMarket";
import type { Product, ProductCategory } from "../../types";
import { CATEGORY_LABELS, formatUSD } from "../../utils/format";

type FormState = {
  title: string;
  sku: string;
  brand: string;
  category: ProductCategory;
  price: number;
  unit: string;
  stock: number;
  shortDescription: string;
  description: string;
  imageUrl: string;
  isPublished: boolean;
  isFeatured: boolean;
};

const emptyForm: FormState = {
  title: "",
  sku: "",
  brand: "",
  category: "pumps",
  price: 0,
  unit: "each",
  stock: 0,
  shortDescription: "",
  description: "",
  imageUrl: "",
  isPublished: true,
  isFeatured: false,
};

const toForm = (product: Product): FormState => ({
  title: product.title,
  sku: product.sku,
  brand: product.brand ?? "",
  category: product.category,
  price: product.price.amount,
  unit: product.unit,
  stock: product.stock,
  shortDescription: product.shortDescription ?? "",
  description: product.description ?? "",
  imageUrl: product.images?.[0]?.url ?? "",
  isPublished: product.isPublished,
  isFeatured: product.isFeatured,
});

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useAdminProducts({
    search: search || undefined,
    category: category || undefined,
    limit: 50,
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const togglePublish = useToggleProductPublish();
  const toggleFeatured = useToggleProductFeatured();
  const upload = useUploadSingle();

  const products = data?.products ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toForm(product));
    setFormOpen(true);
  };

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("folder", "masterpools/products");
    try {
      const result: any = await upload.mutateAsync(fd);
      patch("imageUrl", result.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed. Paste an image URL instead.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.sku.trim() || !form.description.trim()) {
      toast.error("Title, SKU and description are required");
      return;
    }

    const payload = {
      title: form.title.trim(),
      sku: form.sku.trim().toUpperCase(),
      brand: form.brand.trim() || undefined,
      category: form.category,
      price: { amount: Number(form.price) || 0, currency: "USD" },
      unit: form.unit.trim() || "each",
      stock: Number(form.stock) || 0,
      shortDescription: form.shortDescription.trim() || undefined,
      description: form.description.trim(),
      images: form.imageUrl
        ? [{ url: form.imageUrl, alt: `${form.brand} ${form.title}`.trim() }]
        : [],
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
    };

    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing._id, ...payload });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(payload as Partial<Product>);
        toast.success("Product created");
      }
      setFormOpen(false);
    } catch {
      toast.error("Could not save the product. Check the SKU is unique.");
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="heading-md">Products</h1>
          <p className="mt-1 text-[13.5px] text-ink-600">
            {data?.pagination.total ?? 0} records in the marketplace catalogue
          </p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary btn-md">
          <Plus size={15} /> New product
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="relative flex-1 sm:max-w-xs">
          <span className="sr-only">Search products</span>
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or SKU"
            className="input h-10 pl-9"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select h-10 w-auto min-w-[170px] py-0"
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              <th className="table-head">Product</th>
              <th className="table-head">Category</th>
              <th className="table-head text-right">Price</th>
              <th className="table-head text-right">Stock</th>
              <th className="table-head">Status</th>
              <th className="table-head text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td className="table-cell text-ink-500" colSpan={6}>
                  Loading products…
                </td>
              </tr>
            )}

            {!isLoading && products.length === 0 && (
              <tr>
                <td className="table-cell text-ink-500" colSpan={6}>
                  No products yet. Create the first record.
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product._id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold text-ink-900">
                        {product.title}
                      </p>
                      <p className="font-mono text-[11.5px] text-ink-400">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell text-ink-600">
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {formatUSD(product.price.amount)}
                  <span className="block text-[11.5px] text-ink-400">/ {product.unit}</span>
                </td>
                <td className="table-cell text-right tabular-nums">{product.stock}</td>
                <td className="table-cell">
                  <span className={`badge ${product.isPublished ? "badge-green" : "badge-gray"}`}>
                    {product.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => toggleFeatured.mutate(product._id)}
                      aria-label={product.isFeatured ? "Unfeature product" : "Feature product"}
                      aria-pressed={product.isFeatured}
                      className={`grid h-8 w-8 place-items-center rounded-md hover:bg-ink-50 ${
                        product.isFeatured ? "text-amber-500" : "text-ink-400"
                      }`}
                    >
                      <Star size={15} fill={product.isFeatured ? "currentColor" : "none"} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      aria-label={`Edit ${product.title}`}
                      className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-50"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublish.mutate(product._id)}
                      aria-label={
                        product.isPublished
                          ? `Unpublish ${product.title}`
                          : `Publish ${product.title}`
                      }
                      className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-50"
                    >
                      {product.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${product.title}?`)) {
                          deleteProduct.mutate(product._id);
                        }
                      }}
                      aria-label={`Delete ${product.title}`}
                      className="grid h-8 w-8 place-items-center rounded-md text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {formOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFormOpen(false)}
              className="fixed inset-0 z-50 bg-ink-900/40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? "Edit product" : "New product"}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-[520px] overflow-y-auto bg-white p-6 shadow-xl"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="heading-sm">{editing ? "Edit product" : "New product"}</h2>
                  <p className="mt-1 text-[13px] text-ink-500">
                    Prices are in USD and shown on the storefront as-is.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Close"
                  className="grid h-8 w-8 place-items-center rounded-md text-ink-500 hover:bg-ink-50"
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label htmlFor="p-title" className="label">
                    Title
                  </label>
                  <input
                    id="p-title"
                    className="input"
                    value={form.title}
                    onChange={(e) => patch("title", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="p-sku" className="label">
                      SKU
                    </label>
                    <input
                      id="p-sku"
                      className="input font-mono text-[13px]"
                      value={form.sku}
                      onChange={(e) => patch("sku", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="p-brand" className="label">
                      Brand
                    </label>
                    <input
                      id="p-brand"
                      className="input"
                      value={form.brand}
                      onChange={(e) => patch("brand", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="p-category" className="label">
                      Category
                    </label>
                    <select
                      id="p-category"
                      className="select"
                      value={form.category}
                      onChange={(e) => patch("category", e.target.value as ProductCategory)}
                    >
                      {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="p-unit" className="label">
                      Selling unit
                    </label>
                    <input
                      id="p-unit"
                      className="input"
                      value={form.unit}
                      onChange={(e) => patch("unit", e.target.value)}
                      placeholder="each / set / 25 kg drum"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="p-price" className="label">
                      Price (USD)
                    </label>
                    <input
                      id="p-price"
                      type="number"
                      min={0}
                      step="0.01"
                      className="input tabular-nums"
                      value={form.price}
                      onChange={(e) => patch("price", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label htmlFor="p-stock" className="label">
                      Stock quantity
                    </label>
                    <input
                      id="p-stock"
                      type="number"
                      min={0}
                      className="input tabular-nums"
                      value={form.stock}
                      onChange={(e) => patch("stock", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="p-short" className="label">
                    Short description
                  </label>
                  <input
                    id="p-short"
                    className="input"
                    value={form.shortDescription}
                    onChange={(e) => patch("shortDescription", e.target.value)}
                    maxLength={220}
                  />
                </div>

                <div>
                  <label htmlFor="p-desc" className="label">
                    Description
                  </label>
                  <textarea
                    id="p-desc"
                    className="textarea"
                    rows={5}
                    value={form.description}
                    onChange={(e) => patch("description", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <span className="label">Product image</span>
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-50">
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-ink-400">
                          <ImagePlus size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        className="input h-9 text-[13px]"
                        value={form.imageUrl}
                        onChange={(e) => patch("imageUrl", e.target.value)}
                        placeholder="https://…"
                        aria-label="Image URL"
                      />
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="btn btn-secondary btn-sm"
                        disabled={upload.isPending}
                      >
                        {upload.isPending ? "Uploading…" : "Upload image"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-5 border-t border-ink-200 pt-4">
                  <label className="flex items-center gap-2 text-[13.5px] text-ink-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-600"
                      checked={form.isPublished}
                      onChange={(e) => patch("isPublished", e.target.checked)}
                    />
                    Published
                  </label>
                  <label className="flex items-center gap-2 text-[13.5px] text-ink-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-sky-600"
                      checked={form.isFeatured}
                      onChange={(e) => patch("isFeatured", e.target.checked)}
                    />
                    Featured
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createProduct.isPending || updateProduct.isPending}
                    className="btn btn-primary btn-md flex-1"
                  >
                    {editing ? "Save changes" : "Create product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
