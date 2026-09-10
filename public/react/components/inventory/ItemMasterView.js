import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from 'react';
import { Boxes, Search, Plus, Edit2, Trash2, ArrowUpDown, FileDown, Printer, Sparkles, AlertTriangle, X, MapPin, TrendingUp, History, Eye, } from 'lucide-react';
import { StatusBadge } from '../common/Badge.js';
import { storeService } from '../../services/storeService.js';
import { pdfService } from '../../services/pdfService.js';
export const ItemMasterView = ({ currentUser, initialCategory = 'ALL', initialSearch = '', onToast, }) => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [movements, setMovements] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [adjustingItem, setAdjustingItem] = useState(null);
    const [adjustQty, setAdjustQty] = useState(10);
    const [adjustReason, setAdjustReason] = useState('Routine supplier delivery / stock replenishment');
    const [detailItem, setDetailItem] = useState(null);
    // Form States
    const [formName, setFormName] = useState('');
    const [formCategoryId, setFormCategoryId] = useState(0);
    const [formUnit, setFormUnit] = useState('Pcs');
    const [formDescription, setFormDescription] = useState('');
    const [formLocation, setFormLocation] = useState('Gudang Utama - Rak A1');
    const [formMinStock, setFormMinStock] = useState(10);
    const [formCurrentStock, setFormCurrentStock] = useState(50);
    const isSupervisor = currentUser?.role === 'RECEIVING_SUPERVISOR';
    const loadData = () => {
        setItems(storeService.getItems());
        setCategories(storeService.getCategories());
        setMovements(storeService.getStockMovements());
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, []);
    useEffect(() => {
        if (initialCategory)
            setSelectedCategory(initialCategory);
    }, [initialCategory]);
    useEffect(() => {
        if (initialSearch)
            setSearchQuery(initialSearch);
    }, [initialSearch]);
    // Keyword Recommendations
    const itemKeywords = [
        'Kertas',
        'Paracetamol',
        'Aqua',
        'Beras',
        'Helm',
        'Kabel',
        'Toner',
        'Deterjen',
        'Sabun',
        'Minyak',
        'Baterai',
        'Sarung Tangan',
    ];
    // Filtered & Sorted items
    const filteredItems = useMemo(() => {
        return items
            .filter((item) => {
            if (selectedCategory !== 'ALL' && item.categoryName !== selectedCategory) {
                return false;
            }
            if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
                return false;
            }
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                return (item.itemName.toLowerCase().includes(q) ||
                    item.itemCode.toLowerCase().includes(q) ||
                    (item.categoryName && item.categoryName.toLowerCase().includes(q)) ||
                    (item.description && item.description.toLowerCase().includes(q)) ||
                    (item.location && item.location.toLowerCase().includes(q)));
            }
            return true;
        })
            .sort((a, b) => {
            let comp = 0;
            if (sortBy === 'name')
                comp = a.itemName.localeCompare(b.itemName);
            else if (sortBy === 'code')
                comp = a.itemCode.localeCompare(b.itemCode);
            else if (sortBy === 'stock')
                comp = a.currentStock - b.currentStock;
            else if (sortBy === 'updated') {
                comp = new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime();
            }
            return sortOrder === 'asc' ? comp : -comp;
        });
    }, [items, selectedCategory, selectedStatus, searchQuery, sortBy, sortOrder]);
    // Counts summary
    const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
    const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;
    const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
    const handleOpenCreate = () => {
        setFormName('');
        setFormCategoryId(categories[0]?.id || 1);
        setFormUnit('Pcs');
        setFormDescription('');
        setFormLocation('Gudang Utama - Rak A1');
        setFormMinStock(10);
        setFormCurrentStock(50);
        setIsCreateModalOpen(true);
    };
    const handleOpenEdit = (item) => {
        setEditingItem(item);
        setFormName(item.itemName);
        setFormCategoryId(item.categoryId);
        setFormUnit(item.unit);
        setFormDescription(item.description || '');
        setFormLocation(item.location || 'Gudang Utama');
        setFormMinStock(item.minimumStock);
        setFormCurrentStock(item.currentStock);
    };
    const handleSaveItem = (e) => {
        e.preventDefault();
        if (!formName.trim()) {
            onToast('Nama barang wajib diisi.');
            return;
        }
        if (editingItem) {
            const res = storeService.updateItem(editingItem.id, {
                itemName: formName.trim(),
                categoryId: formCategoryId,
                unit: formUnit.trim(),
                description: formDescription.trim(),
                location: formLocation.trim(),
                minimumStock: Number(formMinStock),
                currentStock: Number(formCurrentStock),
            });
            if (res.success) {
                onToast(res.message);
                setEditingItem(null);
            }
            else {
                onToast(res.message);
            }
        }
        else {
            const res = storeService.createItem({
                itemName: formName.trim(),
                categoryId: formCategoryId,
                unit: formUnit.trim(),
                description: formDescription.trim(),
                minimumStock: Number(formMinStock),
                currentStock: Number(formCurrentStock),
            });
            if (res.success) {
                onToast(res.message);
                setIsCreateModalOpen(false);
            }
            else {
                onToast(res.message);
            }
        }
    };
    const handleDeleteItem = () => {
        if (!deletingItem)
            return;
        const res = storeService.deleteItem(deletingItem.id);
        if (res.success) {
            onToast(res.message);
            setDeletingItem(null);
        }
        else {
            onToast(res.message);
        }
    };
    const handleAdjustStock = (e) => {
        e.preventDefault();
        if (!adjustingItem)
            return;
        const res = storeService.adjustStock(adjustingItem.id, adjustQty, adjustReason);
        if (res.success) {
            onToast(res.message);
            setAdjustingItem(null);
        }
        else {
            onToast(res.message);
        }
    };
    const getItemMovements = (itemId) => {
        return movements.filter((m) => m.itemId === itemId).slice(0, 10);
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs", children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Total Master Barang" }), _jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-1", children: items.length }), _jsxs("p", { className: "text-[11px] text-[#0077B6] dark:text-[#48CAE4] font-medium mt-0.5", children: [categories.length, " Kategori Terhubung"] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs", children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Stok Aman (Available)" }), _jsx("p", { className: "text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1", children: availableCount }), _jsx("p", { className: "text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-0.5", children: "Di atas ambang minimum" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs", children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Stok Menipis (Low Stock)" }), _jsx("p", { className: "text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1", children: lowStockCount }), _jsx("p", { className: "text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-0.5", children: "Perlu pengajuan restock" })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs", children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Habis (Out of Stock)" }), _jsx("p", { className: "text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1", children: outOfStockCount }), _jsx("p", { className: "text-[11px] text-rose-600/80 dark:text-rose-400/80 font-medium mt-0.5", children: "Stok gudang kosong" })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Cari nama barang, kode item (ITM-PST-001), deskripsi, atau lokasi rak...", className: "w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50/50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077B6] transition" }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(''), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0 flex-wrap", children: [_jsxs("button", { onClick: () => pdfService.exportInventoryReportPDF(filteredItems), className: "px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#03045E]/80 text-slate-700 dark:text-[#ADE8F4] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 transition flex items-center gap-1.5 cursor-pointer", title: "Download PDF", children: [_jsx(FileDown, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("span", { children: "Export PDF" })] }), _jsxs("button", { onClick: () => window.print(), className: "px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-[#03045E]/80 text-slate-700 dark:text-[#ADE8F4] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 transition flex items-center gap-1.5 cursor-pointer", title: "Cetak", children: [_jsx(Printer, { className: "w-4 h-4 text-slate-600 dark:text-slate-300" }), _jsx("span", { children: "Cetak" })] }), isSupervisor && (_jsxs("button", { onClick: handleOpenCreate, className: "px-4 py-2 text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Tambah Barang Baru" })] }))] })] }), _jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#0077B6]/20", children: [_jsxs("div", { className: "flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar", children: [_jsx("span", { className: "text-[11px] font-semibold text-slate-400 dark:text-[#ADE8F4]/70 mr-1 shrink-0", children: "Kategori:" }), _jsxs("button", { onClick: () => setSelectedCategory('ALL'), className: `px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${selectedCategory === 'ALL'
                                            ? 'bg-[#0077B6] text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-[#03045E]/60 text-slate-600 dark:text-[#ADE8F4] hover:bg-slate-200 dark:hover:bg-[#0077B6]/40'}`, children: ["Semua (", items.length, ")"] }), categories.map((cat) => {
                                        const count = items.filter((i) => i.categoryId === cat.id).length;
                                        return (_jsxs("button", { onClick: () => setSelectedCategory(cat.name), className: `px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${selectedCategory === cat.name
                                                ? 'bg-[#0077B6] text-white shadow-xs'
                                                : 'bg-slate-100 dark:bg-[#03045E]/60 text-slate-600 dark:text-[#ADE8F4] hover:bg-slate-200 dark:hover:bg-[#0077B6]/40'}`, children: [cat.name, " (", count, ")"] }, cat.id));
                                    })] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsxs("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), "aria-label": "Filter status stok barang", className: "px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-700 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0077B6] focus:outline-none", children: [_jsx("option", { value: "ALL", children: "Semua Status Stok" }), _jsx("option", { value: "AVAILABLE", children: "Tersedia (Available)" }), _jsx("option", { value: "LOW_STOCK", children: "Stok Menipis (Low Stock)" }), _jsx("option", { value: "OUT_OF_STOCK", children: "Habis (Out of Stock)" })] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), "aria-label": "Urutkan data barang", className: "px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-700 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#0077B6] focus:outline-none", children: [_jsx("option", { value: "name", children: "Urut: Nama Barang" }), _jsx("option", { value: "code", children: "Urut: Kode Barang" }), _jsx("option", { value: "stock", children: "Urut: Jumlah Stok" }), _jsx("option", { value: "updated", children: "Urut: Terakhir Diupdate" })] }), _jsx("button", { onClick: () => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc')), className: "p-1.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100", title: `Urutan: ${sortOrder === 'asc' ? 'Menaik (A-Z)' : 'Menurun (Z-A)'}`, children: _jsx(ArrowUpDown, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pt-1", children: [_jsxs("span", { className: "text-[11px] text-slate-400 dark:text-[#ADE8F4]/70 font-medium flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3 text-[#0077B6] dark:text-[#48CAE4]" }), "Kata Kunci Populer:"] }), itemKeywords.map((keyword) => (_jsx("button", { onClick: () => setSearchQuery(keyword), className: "px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#03045E]/60 text-slate-600 dark:text-[#ADE8F4] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 hover:text-[#0077B6] transition border border-slate-200 dark:border-[#0077B6]/30 cursor-pointer", children: keyword }, keyword))), (searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL') && (_jsx("button", { onClick: () => {
                                    setSearchQuery('');
                                    setSelectedCategory('ALL');
                                    setSelectedStatus('ALL');
                                }, className: "text-[11px] text-rose-500 hover:underline ml-2", children: "Reset Semua Filter" }))] })] }), _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/30 shadow-xs overflow-hidden", children: [_jsxs("div", { className: "px-5 py-3.5 bg-slate-50/80 dark:bg-[#03045E]/90 border-b border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Boxes, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" }), _jsxs("span", { className: "text-xs font-bold text-slate-900 dark:text-white", children: ["Daftar Barang (", filteredItems.length, " ditampilkan)"] })] }), selectedCategory !== 'ALL' && (_jsxs("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#CAF0F8] dark:bg-[#0077B6]/50 text-[#0077B6] dark:text-[#ADE8F4]", children: ["Kategori: ", selectedCategory] }))] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 dark:bg-[#03045E]/80 text-slate-500 dark:text-[#ADE8F4] font-semibold border-b border-slate-200 dark:border-[#0077B6]/30", children: _jsxs("tr", { children: [_jsx("th", { className: "px-5 py-3.5", children: "Kode Barang" }), _jsx("th", { className: "px-5 py-3.5", children: "Nama Barang & Spesifikasi" }), _jsx("th", { className: "px-5 py-3.5", children: "Kategori" }), _jsx("th", { className: "px-5 py-3.5 text-center", children: "Stok Saat Ini" }), _jsx("th", { className: "px-5 py-3.5 text-center", children: "Min. Stok" }), _jsx("th", { className: "px-5 py-3.5", children: "Status" }), _jsx("th", { className: "px-5 py-3.5", children: "Lokasi Rak" }), _jsx("th", { className: "px-5 py-3.5 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-[#0077B6]/20", children: filteredItems.map((item) => {
                                        const stockPercent = Math.min(100, Math.round((item.currentStock / (item.minimumStock * 2 || 100)) * 100));
                                        return (_jsxs("tr", { className: "hover:bg-slate-50/80 dark:hover:bg-[#03045E]/40 transition group", children: [_jsx("td", { className: "px-5 py-3.5 whitespace-nowrap", children: _jsx("span", { className: "font-mono font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-[#03045E]/60 px-2 py-1 rounded-md border border-slate-200 dark:border-[#0077B6]/30", children: item.itemCode }) }), _jsx("td", { className: "px-5 py-3.5", children: _jsxs("div", { children: [_jsx("span", { className: "font-bold text-slate-900 dark:text-white block group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4] transition", children: item.itemName }), item.description && (_jsx("span", { className: "text-[11px] text-slate-500 dark:text-slate-300 line-clamp-1 mt-0.5", children: item.description }))] }) }), _jsx("td", { className: "px-5 py-3.5 whitespace-nowrap", children: _jsx("span", { className: "px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#CAF0F8]/60 dark:bg-[#0077B6]/30 text-[#0077B6] dark:text-[#ADE8F4] border border-[#0077B6]/20", children: item.categoryName }) }), _jsx("td", { className: "px-5 py-3.5 text-center whitespace-nowrap", children: _jsxs("div", { className: "flex flex-col items-center", children: [_jsxs("span", { className: "text-sm font-extrabold text-slate-900 dark:text-white", children: [item.currentStock, ' ', _jsx("span", { className: "text-[11px] font-normal text-slate-500 dark:text-slate-300", children: item.unit })] }), _jsx("div", { className: "w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all ${item.currentStock === 0
                                                                        ? 'bg-rose-500'
                                                                        : item.currentStock <= item.minimumStock
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-emerald-500'}`, style: { width: `${Math.max(5, stockPercent)}%` } }) })] }) }), _jsxs("td", { className: "px-5 py-3.5 text-center whitespace-nowrap text-slate-500 dark:text-slate-300 font-medium", children: [item.minimumStock, " ", item.unit] }), _jsx("td", { className: "px-5 py-3.5 whitespace-nowrap", children: _jsx(StatusBadge, { status: item.status }) }), _jsx("td", { className: "px-5 py-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4] shrink-0" }), _jsx("span", { className: "text-[11px]", children: item.location || 'Gudang Utama' })] }) }), _jsx("td", { className: "px-5 py-3.5 text-right whitespace-nowrap", children: _jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [_jsx("button", { onClick: () => setDetailItem(item), className: "p-1.5 rounded-lg text-slate-400 hover:text-[#0077B6] dark:hover:text-[#48CAE4] hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", title: "Detail & Mutasi Stok", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }), _jsxs("button", { onClick: () => {
                                                                    setAdjustingItem(item);
                                                                    setAdjustQty(10);
                                                                }, className: "px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#CAF0F8] dark:bg-[#0077B6]/40 text-[#0077B6] dark:text-[#ADE8F4] hover:bg-[#0077B6] hover:text-white transition flex items-center gap-1", title: "Penyesuaian Stok Cepat", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), _jsx("span", { children: "Adjust" })] }), isSupervisor && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleOpenEdit(item), className: "p-1.5 rounded-lg text-slate-400 hover:text-[#0077B6] dark:hover:text-[#48CAE4] hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", title: "Edit Master Barang", children: _jsx(Edit2, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => setDeletingItem(item), className: "p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition", title: "Hapus Barang", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }))] }) })] }, item.id));
                                    }) })] }) }), filteredItems.length === 0 && (_jsxs("div", { className: "p-12 text-center", children: [_jsx(Boxes, { className: "w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" }), _jsx("h4", { className: "text-sm font-bold text-slate-900 dark:text-white", children: "Tidak ada barang yang cocok" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1", children: "Coba sesuaikan pencarian atau pilih kategori lain." }), _jsx("button", { onClick: () => {
                                    setSearchQuery('');
                                    setSelectedCategory('ALL');
                                    setSelectedStatus('ALL');
                                }, className: "mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0077B6] rounded-xl hover:bg-[#0096C7] transition", children: "Tampilkan Semua Barang" })] }))] }), detailItem && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/40 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Boxes, { className: "w-5 h-5 text-[#0077B6] dark:text-[#48CAE4]" }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: detailItem.itemName }), _jsxs("p", { className: "text-[11px] font-mono text-[#0077B6] dark:text-[#ADE8F4]", children: [detailItem.itemCode, " \u2022 ", detailItem.categoryName] })] })] }), _jsx("button", { onClick: () => setDetailItem(null), className: "text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto", children: [_jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [_jsxs("div", { className: "p-3 rounded-xl bg-slate-50 dark:bg-[#03045E]/60 border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx("p", { className: "text-[11px] text-slate-400", children: "Stok Saat Ini" }), _jsxs("p", { className: "text-lg font-bold text-slate-900 dark:text-white mt-0.5", children: [detailItem.currentStock, " ", detailItem.unit] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-50 dark:bg-[#03045E]/60 border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx("p", { className: "text-[11px] text-slate-400", children: "Ambang Min. Stok" }), _jsxs("p", { className: "text-lg font-bold text-slate-900 dark:text-white mt-0.5", children: [detailItem.minimumStock, " ", detailItem.unit] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-50 dark:bg-[#03045E]/60 border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx("p", { className: "text-[11px] text-slate-400", children: "Status Stok" }), _jsx("div", { className: "mt-1", children: _jsx(StatusBadge, { status: detailItem.status }) })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-50 dark:bg-[#03045E]/60 border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx("p", { className: "text-[11px] text-slate-400", children: "Lokasi Penyimpanan" }), _jsx("p", { className: "text-xs font-bold text-slate-900 dark:text-white mt-1", children: detailItem.location || 'Gudang Utama' })] })] }), detailItem.description && (_jsxs("div", { className: "p-3.5 rounded-xl bg-slate-50/80 dark:bg-[#03045E]/40 border border-slate-200 dark:border-[#0077B6]/20", children: [_jsx("p", { className: "text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1", children: "Deskripsi / Spesifikasi Teknis:" }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-300 leading-relaxed", children: detailItem.description })] })), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2.5", children: [_jsxs("h4", { className: "text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5", children: [_jsx(History, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("span", { children: "Riwayat Mutasi Stok Terakhir" })] }), _jsxs("span", { className: "text-[11px] text-slate-400", children: [getItemMovements(detailItem.id).length, " catatan"] })] }), getItemMovements(detailItem.id).length > 0 ? (_jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: getItemMovements(detailItem.id).map((m) => (_jsxs("div", { className: "p-2.5 rounded-xl bg-slate-50 dark:bg-[#03045E]/50 border border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-2 py-0.5 rounded-md font-bold text-[10px] ${m.type === 'IN'
                                                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                                    : m.type === 'OUT'
                                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                                                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'}`, children: m.type }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-slate-900 dark:text-white", children: [m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : '', m.quantity, " ", detailItem.unit, " \u2022 Ref: ", m.referenceId || m.referenceType] }), _jsxs("p", { className: "text-[10px] text-slate-400", children: [m.date || m.createdAt, " \u2022 Oleh: ", m.userName || m.performedByName || 'System'] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-[11px] text-slate-400 block", children: "Saldo" }), _jsxs("span", { className: "font-bold text-slate-900 dark:text-white", children: [m.newStock, " ", detailItem.unit] })] })] }, m.id))) })) : (_jsx("p", { className: "text-xs text-slate-400 italic py-4 text-center", children: "Belum ada riwayat mutasi stok untuk barang ini." }))] })] }), _jsxs("div", { className: "px-6 py-4 border-t border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between bg-slate-50/50 dark:bg-[#03045E]/40", children: [_jsxs("button", { onClick: () => {
                                        setDetailItem(null);
                                        setAdjustingItem(detailItem);
                                        setAdjustQty(10);
                                    }, className: "px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0077B6] dark:text-[#ADE8F4] bg-[#CAF0F8] dark:bg-[#0077B6]/40 hover:bg-[#0077B6] hover:text-white transition flex items-center gap-1.5", children: [_jsx(TrendingUp, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Adjust Stok Barang Ini" })] }), _jsx("button", { onClick: () => setDetailItem(null), className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#03045E]/60 transition", children: "Tutup" })] })] }) })), adjustingItem && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/40 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: "Penyesuaian Stok Gudang" })] }), _jsx("button", { onClick: () => setAdjustingItem(null), className: "text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleAdjustStock, className: "p-6 space-y-4", children: [_jsxs("div", { className: "p-3 rounded-xl bg-slate-50 dark:bg-[#03045E]/60 border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx("p", { className: "text-xs font-bold text-slate-900 dark:text-white", children: adjustingItem.itemName }), _jsxs("p", { className: "text-[11px] font-mono text-[#0077B6] dark:text-[#ADE8F4] mt-0.5", children: [adjustingItem.itemCode, " \u2022 Stok saat ini: ", adjustingItem.currentStock, " ", adjustingItem.unit] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: "Jumlah Perubahan Stok (+ untuk Menambah, - untuk Mengurangi)" }), _jsx("input", { type: "number", required: true, value: adjustQty, onChange: (e) => setAdjustQty(parseInt(e.target.value) || 0), className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#0077B6] focus:outline-none" }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-1", children: ["Stok baru setelah penyesuaian:", ' ', _jsxs("strong", { className: "text-slate-900 dark:text-white", children: [Math.max(0, adjustingItem.currentStock + adjustQty), " ", adjustingItem.unit] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: "Alasan / Referensi Penyesuaian" }), _jsx("textarea", { rows: 3, required: true, value: adjustReason, onChange: (e) => setAdjustReason(e.target.value), placeholder: "Contoh: Penerimaan supplier tambahan, koreksi stok fisik opname, barang rusak...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { className: "pt-3 border-t border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setAdjustingItem(null), className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", children: "Batal" }), _jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] shadow-xs transition", children: "Simpan Mutasi Stok" })] })] })] }) })), (isCreateModalOpen || editingItem) && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/40 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Boxes, { className: "w-5 h-5 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: editingItem ? 'Edit Master Barang' : 'Tambah Master Barang Baru' })] }), _jsx("button", { onClick: () => {
                                        setIsCreateModalOpen(false);
                                        setEditingItem(null);
                                    }, className: "text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSaveItem, className: "p-6 space-y-4 max-h-[80vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Nama Barang ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formName, onChange: (e) => setFormName(e.target.value), placeholder: "Contoh: Kertas HVS A4 80gsm, Paracetamol 500mg...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Kategori ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("select", { value: formCategoryId, onChange: (e) => setFormCategoryId(Number(e.target.value)), className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none", children: categories.map((cat) => (_jsxs("option", { value: cat.id, children: [cat.name, " (", cat.code, ")"] }, cat.id))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Satuan Unit (Pcs, Box, Dus, dll) ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formUnit, onChange: (e) => setFormUnit(e.target.value), placeholder: "Pcs / Rim / Box / Dus / Unit", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Stok Awal Saat Ini ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "number", min: 0, required: true, value: formCurrentStock, onChange: (e) => setFormCurrentStock(Number(e.target.value)), className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Ambang Minimum Stok ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "number", min: 0, required: true, value: formMinStock, onChange: (e) => setFormMinStock(Number(e.target.value)), className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: "Lokasi Penyimpanan Rak" }), _jsx("input", { type: "text", value: formLocation, onChange: (e) => setFormLocation(e.target.value), placeholder: "Contoh: Gudang Utama - Rak B2", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: "Deskripsi / Spesifikasi Teknis" }), _jsx("textarea", { rows: 2, value: formDescription, onChange: (e) => setFormDescription(e.target.value), placeholder: "Rincian merek, ukuran, tipe, nomor seri, dll...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { className: "pt-3 border-t border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                setIsCreateModalOpen(false);
                                                setEditingItem(null);
                                            }, className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", children: "Batal" }), _jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] shadow-xs transition", children: editingItem ? 'Simpan Perubahan' : 'Tambah Master Barang' })] })] })] }) })), deletingItem && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-sm p-6 space-y-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto", children: _jsx(AlertTriangle, { className: "w-6 h-6" }) }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: "Hapus Master Barang?" }), _jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-300 mt-1", children: ["Apakah Anda yakin ingin menghapus", ' ', _jsxs("strong", { className: "text-slate-900 dark:text-white", children: [deletingItem.itemCode, " - ", deletingItem.itemName] }), "? Tindakan ini akan dicatat dalam audit log."] })] }), _jsxs("div", { className: "flex items-center justify-center gap-2 pt-2", children: [_jsx("button", { onClick: () => setDeletingItem(null), className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", children: "Batal" }), _jsx("button", { onClick: handleDeleteItem, className: "px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition", children: "Ya, Hapus" })] })] }) }))] }));
};
