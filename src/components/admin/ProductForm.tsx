"use client";

import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import {
  API_URL,
  createProduct,
  deleteCarpetImage,
  getCategories,
  setPrimaryImage,
  updateProduct,
  uploadCarpetImage,
} from "@/lib/api";

type Category = { id: number; name: string; name_en?: string };
type CarpetImage = { id: number; image: string; is_primary: boolean };

export type ProductInitial = {
  id: number;
  slug: string;
  sku: string;
  category: { id: number } | number;
  price: number | string;
  width: number | string;
  length: number | string;
  knot_density: string;
  stock_status: string;
  colors: string[];
  title?: string;
  title_ar?: string | null;
  title_fa?: string | null;
  title_en?: string | null;
  description?: string;
  description_ar?: string | null;
  description_fa?: string | null;
  description_en?: string | null;
  origin?: string;
  origin_ar?: string | null;
  origin_fa?: string | null;
  origin_en?: string | null;
  material?: string;
  material_ar?: string | null;
  material_fa?: string | null;
  material_en?: string | null;
  pattern?: string;
  pattern_ar?: string | null;
  pattern_fa?: string | null;
  pattern_en?: string | null;
  images?: CarpetImage[];
};

const LANGS = ["ar", "fa", "en"] as const;
const STOCKS = ["available", "reserved", "sold"] as const;

export default function ProductForm({
  productId,
  initial,
}: {
  productId?: number;
  initial?: ProductInitial;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tab, setTab] = useState<(typeof LANGS)[number]>("ar");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [images, setImages] = useState<CarpetImage[]>(initial?.images ?? []);
  const [pending, setPending] = useState<File[]>([]);

  const catId =
    typeof initial?.category === "object"
      ? initial?.category?.id
      : (initial?.category as number);

  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    category: catId ? String(catId) : "",
    price: initial?.price != null ? String(initial.price) : "",
    width: initial?.width != null ? String(initial.width) : "",
    length: initial?.length != null ? String(initial.length) : "",
    knot_density: initial?.knot_density ?? "",
    stock_status: initial?.stock_status ?? "available",
    colors: initial?.colors ?? ([] as string[]),
    title_ar: initial?.title_ar ?? initial?.title ?? "",
    title_fa: initial?.title_fa ?? "",
    title_en: initial?.title_en ?? "",
    description_ar: initial?.description_ar ?? initial?.description ?? "",
    description_fa: initial?.description_fa ?? "",
    description_en: initial?.description_en ?? "",
    origin_ar: initial?.origin_ar ?? initial?.origin ?? "",
    origin_fa: initial?.origin_fa ?? "",
    origin_en: initial?.origin_en ?? "",
    material_ar: initial?.material_ar ?? initial?.material ?? "",
    material_fa: initial?.material_fa ?? "",
    material_en: initial?.material_en ?? "",
    pattern_ar: initial?.pattern_ar ?? initial?.pattern ?? "",
    pattern_fa: initial?.pattern_fa ?? "",
    pattern_en: initial?.pattern_en ?? "",
  });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const addColor = () => set("colors", [...form.colors, "#E8D6A3"]);
  const setColor = (i: number, value: string) =>
    set(
      "colors",
      form.colors.map((c, idx) => (idx === i ? value : c)),
    );
  const removeColor = (i: number) =>
    set(
      "colors",
      form.colors.filter((_, idx) => idx !== i),
    );

  const buildPayload = () => ({
    title: form.title_ar,
    title_ar: form.title_ar,
    title_fa: form.title_fa,
    title_en: form.title_en,
    slug: form.slug,
    category: Number(form.category),
    price: Number(form.price || 0),
    width: Number(form.width || 0),
    length: Number(form.length || 0),
    knot_density: form.knot_density,
    stock_status: form.stock_status,
    colors: form.colors,
    description: form.description_ar,
    description_ar: form.description_ar,
    description_fa: form.description_fa,
    description_en: form.description_en,
    origin: form.origin_ar,
    origin_ar: form.origin_ar,
    origin_fa: form.origin_fa,
    origin_en: form.origin_en,
    material: form.material_ar,
    material_ar: form.material_ar,
    material_fa: form.material_fa,
    material_en: form.material_en,
    pattern: form.pattern_ar,
    pattern_ar: form.pattern_ar,
    pattern_fa: form.pattern_fa,
    pattern_en: form.pattern_en,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(false);
    try {
      const saved = productId
        ? await updateProduct(productId, buildPayload())
        : await createProduct(buildPayload());

      const id = saved?.id ?? productId;
      for (let i = 0; i < pending.length; i += 1) {
        await uploadCarpetImage(id, pending[i], i === 0 && images.length === 0);
      }

      router.replace("/admin/products");
    } catch {
      setError(true);
      setSaving(false);
    }
  };

  const onUploadNow = async (file: File) => {
    if (!productId) {
      setPending((prev) => [...prev, file]);
      return;
    }
    try {
      const img = await uploadCarpetImage(productId, file, images.length === 0);
      setImages((prev) => [...prev, img]);
    } catch {
      setError(true);
    }
  };

  const makePrimary = async (id: number) => {
    await setPrimaryImage(id);
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_primary: img.id === id })),
    );
  };

  const removeImage = async (id: number) => {
    await deleteCarpetImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <form onSubmit={onSubmit} className="ad-card">
      <div className="ad-card__head">
        <h3 className="ad-card__title ad-display">
          {productId ? t("products.edit") : t("products.new")}
        </h3>
      </div>

      <div
        className="ad-card__body"
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div className="ad-grid-3">
          <div className="ad-field">
            <label className="ad-label">{t("products.category")}</label>
            <select
              className="ad-select"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              required
            >
              <option value="" disabled>
                —
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en || c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.sku")}</label>
            <input
              className="ad-input"
              value={productId ? (initial?.sku ?? "") : ""}
              placeholder="—"
              readOnly
              disabled
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.slug")}</label>
            <input
              className="ad-input"
              placeholder="auto"
              value={form.slug}
              onChange={(e) => set("slug", e.target.value)}
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.price")}</label>
            <input
              type="number"
              className="ad-input"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.width")}</label>
            <input
              type="number"
              className="ad-input"
              value={form.width}
              onChange={(e) => set("width", e.target.value)}
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.length")}</label>
            <input
              type="number"
              className="ad-input"
              value={form.length}
              onChange={(e) => set("length", e.target.value)}
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.knot")}</label>
            <input
              className="ad-input"
              value={form.knot_density}
              onChange={(e) => set("knot_density", e.target.value)}
            />
          </div>
          <div className="ad-field">
            <label className="ad-label">{t("products.stock")}</label>
            <select
              className="ad-select"
              value={form.stock_status}
              onChange={(e) => set("stock_status", e.target.value)}
            >
              {STOCKS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ad-field">
          <label className="ad-label">{t("products.colors")}</label>
          <div className="ad-swatches">
            {form.colors.map((color, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(i, e.target.value)}
                  style={{
                    width: "2.2rem",
                    height: "2rem",
                    background: "none",
                    border: "none",
                  }}
                />
                <button
                  type="button"
                  className="ad-btn ad-btn--ghost ad-btn--sm"
                  onClick={() => removeColor(i)}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="ad-btn ad-btn--ghost ad-btn--sm"
              onClick={addColor}
            >
              + {t("products.addColor")}
            </button>
          </div>
        </div>

        <div>
          <div className="ad-tabs">
            {LANGS.map((lang) => (
              <button
                key={lang}
                type="button"
                className={`ad-tab ${tab === lang ? "is-active" : ""}`}
                onClick={() => setTab(lang)}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="ad-grid-2" style={{ marginTop: "1rem" }}>
            <div className="ad-field">
              <label className="ad-label">{t("products.name")}</label>
              <input
                className="ad-input"
                value={form[`title_${tab}` as keyof typeof form] as string}
                onChange={(e) =>
                  set(`title_${tab}` as keyof typeof form, e.target.value)
                }
              />
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("products.origin")}</label>
              <input
                className="ad-input"
                value={form[`origin_${tab}` as keyof typeof form] as string}
                onChange={(e) =>
                  set(`origin_${tab}` as keyof typeof form, e.target.value)
                }
              />
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("products.material")}</label>
              <input
                className="ad-input"
                value={form[`material_${tab}` as keyof typeof form] as string}
                onChange={(e) =>
                  set(`material_${tab}` as keyof typeof form, e.target.value)
                }
              />
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("products.pattern")}</label>
              <input
                className="ad-input"
                value={form[`pattern_${tab}` as keyof typeof form] as string}
                onChange={(e) =>
                  set(`pattern_${tab}` as keyof typeof form, e.target.value)
                }
              />
            </div>
          </div>
          <div className="ad-field" style={{ marginTop: "1rem" }}>
            <label className="ad-label">{t("products.description")}</label>
            <textarea
              className="ad-textarea"
              value={form[`description_${tab}` as keyof typeof form] as string}
              onChange={(e) =>
                set(`description_${tab}` as keyof typeof form, e.target.value)
              }
            />
          </div>
        </div>

        <div className="ad-field">
          <label className="ad-label">{t("products.images")}</label>
          <div className="ad-swatches">
            {images.map((img) => (
              <div key={img.id} style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    img.image.startsWith("http")
                      ? img.image
                      : `${API_URL.replace("/api", "")}${img.image}`
                  }
                  alt=""
                  className="ad-thumb"
                />
                <div
                  style={{
                    marginTop: "0.3rem",
                    display: "flex",
                    gap: "0.25rem",
                  }}
                >
                  <button
                    type="button"
                    className="ad-btn ad-btn--ghost ad-btn--sm"
                    onClick={() => makePrimary(img.id)}
                    disabled={img.is_primary}
                  >
                    {img.is_primary ? t("products.primary") : "★"}
                  </button>
                  <button
                    type="button"
                    className="ad-btn ad-btn--danger ad-btn--sm"
                    onClick={() => removeImage(img.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label
            className="ad-btn ad-btn--ghost ad-btn--sm"
            style={{ marginTop: "0.6rem", alignSelf: "flex-start" }}
          >
            <Upload size={15} />
            {t("products.uploadImage")}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadNow(file);
                e.target.value = "";
              }}
            />
          </label>
          {pending.length > 0 && (
            <p className="ad-muted" style={{ fontSize: "0.9rem" }}>
              {pending.length} × {t("products.image")}
            </p>
          )}
        </div>

        {error && <p className="ad-error">{t("common.error")}</p>}

        <div className="ad-form-actions">
          <button className="ad-btn" type="submit" disabled={saving}>
            {saving ? t("products.saving") : t("products.save")}
          </button>
          <button
            type="button"
            className="ad-btn ad-btn--ghost"
            onClick={() => router.replace("/admin/products")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </form>
  );
}
