"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Percent,
  Package,
  Layers,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Search,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Category, SubCategory } from "@/lib/types";

interface ExtendedCategory {
  id: any;
  name: string;
  slug: string;
  description?: string;
  commission_rate: number;
  is_active?: boolean;
  status?: string;
  product_count?: number;
  subcategories?: any[];
  sub_categories?: any[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExtendedCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    commission_rate: 10,
    is_active: true,
    subcategoriesText: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      commission_rate: 10,
      is_active: true,
      subcategoriesText: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (cat: ExtendedCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      commission_rate: cat.commission_rate,
      is_active: cat.is_active ?? true,
      subcategoriesText: (cat.subcategories || []).map((s) => s.name).join(", "),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSaving(true);
      const subcats: any[] = formData.subcategoriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, i) => ({
          id: `sub_${Date.now()}_${i}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          commission_rate: formData.commission_rate,
        }));

      if (editingCategory) {
        // update
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            id: editingCategory.id,
            updates: {
              name: formData.name,
              slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              description: formData.description,
              commission_rate: Number(formData.commission_rate),
              is_active: formData.is_active,
              subcategories: subcats,
            },
          }),
        });
      } else {
        // create
        await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create",
            category: {
              name: formData.name,
              slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              description: formData.description,
              commission_rate: Number(formData.commission_rate),
              is_active: formData.is_active,
              subcategories: subcats,
            },
          }),
        });
      }

      setModalOpen(false);
      await fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: any, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (cat: ExtendedCategory) => {
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: cat.id,
          updates: { is_active: !cat.is_active },
        }),
      });
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderTree className="w-7 h-7 text-emerald-600" />
            Category & Commission Hierarchy
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize catalog taxonomies, assign subcategories, and establish category-level marketplace commission rates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Search and Summary Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories or slugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {categories.length} Taxonomies • {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} Subcategories
        </div>
      </div>

      {/* Category List Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Loading category catalog...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <FolderTree className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No categories found matching "{search}".
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isExpanded = expandedCats[cat.id] ?? true;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 mt-0.5 sm:mt-0"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>

                    <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{cat.name}</span>
                        <code className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          /{cat.slug}
                        </code>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            cat.is_active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.description || "No description provided."}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    {/* Live stats */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-slate-400 block font-medium">Assigned Products</span>
                        <span className="font-bold text-slate-900">{cat.product_count || 0} items</span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block font-medium">Commission Rate</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {cat.commission_rate}%
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        title={cat.is_active ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        {cat.is_active ? <X className="w-4 h-4 text-amber-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                      <button
                        onClick={() => openEditModal(cat)}
                        title="Edit Category"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        title="Delete Category"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories Expandable Drawer */}
                {isExpanded && (cat.subcategories || cat.sub_categories) && ((cat.subcategories || cat.sub_categories)!.length > 0) && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Subcategories ({(cat.subcategories || cat.sub_categories)!.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(cat.subcategories || cat.sub_categories)!.map((sub: any) => (
                        <span
                          key={sub.id}
                          className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {sub.name}
                          <span className="text-slate-400 font-mono text-[10px]">/{sub.slug}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCategory ? "Edit Category & Commission" : "Create New Marketplace Category"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Configure catalog routing taxonomy, parent attributes, and default marketplace commission cut.
            </p>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Electronics, Footwear, Home & Kitchen"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="auto-generated from name"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Commission Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.commission_rate}
                      onChange={(e) =>
                        setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2.5 pr-8 text-sm font-bold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description for category banner and AI Copilot classification..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wireless Audio, Smartwatches, Cables"
                  value={formData.subcategoriesText}
                  onChange={(e) => setFormData({ ...formData, subcategoriesText: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="cat_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Category is active and visible in marketplace navigation
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
