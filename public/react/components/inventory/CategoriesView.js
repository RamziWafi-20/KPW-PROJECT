import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Tags, Search, Plus, Edit2, Trash2, Boxes, ArrowRight, Sparkles, Layers, AlertCircle, X, Eye, } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const CategoriesView = ({ currentUser, onNavigateToItems, onToast, }) => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('CARDS');
    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    // Form states
    const [formName, setFormName] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const loadData = () => {
        setCategories(storeService.getCategories());
        setItems(storeService.getItems());
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, []);
    const isSupervisor = currentUser?.role === 'RECEIVING_SUPERVISOR';
    // Recommendations for search
    const searchRecommendations = [
        'Printing',
        'Medic',
        'Food',
        'Beverage',
        'Engineering',
        'Technology',
        'Housekeeping',
        'Uniform',
        'Kitchen',
        'Safety',
    ];
    const filteredCategories = categories.filter((cat) => {
        if (!searchQuery.trim())
            return true;
        const q = searchQuery.toLowerCase();
        return (cat.name.toLowerCase().includes(q) ||
            cat.code.toLowerCase().includes(q) ||
            cat.description.toLowerCase().includes(q));
    });
    const getItemCount = (catId) => {
        return items.filter((item) => item.categoryId === catId).length;
    };
    const getCategoryItems = (catId) => {
        return items.filter((item) => item.categoryId === catId);
    };
    const handleOpenCreate = () => {
        setFormName('');
        setFormCode('');
        setFormDescription('');
        setIsCreateModalOpen(true);
    };
    const handleOpenEdit = (cat) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormCode(cat.code);
        setFormDescription(cat.description);
    };
    const handleSaveCategory = (e) => {
        e.preventDefault();
        if (!formName.trim() || !formCode.trim()) {
            onToast('Nama kategori dan kode kategori wajib diisi.');
            return;
        }
        if (editingCategory) {
            const res = storeService.updateCategory(editingCategory.id, {
                name: formName.trim(),
                code: formCode.trim().toUpperCase(),
                description: formDescription.trim(),
            });
            if (res.success) {
                onToast(res.message);
                setEditingCategory(null);
            }
            else {
                onToast(res.message);
            }
        }
        else {
            const res = storeService.createCategory({
                name: formName.trim(),
                code: formCode.trim().toUpperCase(),
                description: formDescription.trim(),
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
    const handleDeleteConfirm = () => {
        if (!deletingCategory)
            return;
        const res = storeService.deleteCategory(deletingCategory.id);
        if (res.success) {
            onToast(res.message);
            setDeletingCategory(null);
        }
        else {
            onToast(res.message);
        }
    };
    // Color mapper for badges
    const getCategoryColor = (code) => {
        switch (code) {
            case 'PST':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'MED':
                return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800';
            case 'FOD':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800';
            case 'BEV':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            case 'ENG':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case 'ITE':
                return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
            case 'CLN':
                return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
            case 'UNF':
                return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800';
            case 'KTC':
                return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'GST':
                return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800';
            case 'SAF':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'OEQ':
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
            default:
                return 'bg-[#0077B6]/10 text-[#0077B6] dark:text-[#48CAE4] border-[#0077B6]/20';
        }
    };
    const totalItemCount = items.length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Total Kategori Master" }), _jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-1", children: categories.length }), _jsx("p", { className: "text-[11px] text-[#0077B6] dark:text-[#48CAE4] font-medium mt-0.5", children: "Klasifikasi Terorganisir" })] }), _jsx("div", { className: "w-12 h-12 rounded-xl bg-[#CAF0F8] dark:bg-[#0077B6]/40 flex items-center justify-center text-[#0077B6] dark:text-[#ADE8F4]", children: _jsx(Tags, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Total Barang Terdaftar" }), _jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-1", children: totalItemCount }), _jsxs("p", { className: "text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5", children: ["Rata-rata ", categories.length ? Math.round(totalItemCount / categories.length) : 0, " barang / kategori"] })] }), _jsx("div", { className: "w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400", children: _jsx(Boxes, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-slate-500 dark:text-[#ADE8F4]/80", children: "Status Otorisasi" }), _jsx("p", { className: "text-base font-bold text-slate-900 dark:text-white mt-1", children: isSupervisor ? 'Supervisor Master Access' : 'Read-Only Department View' }), _jsx("p", { className: "text-[11px] text-slate-400 dark:text-slate-300 mt-0.5", children: isSupervisor ? 'Bisa tambah, edit & kelola' : 'Melihat katalog kategori' })] }), _jsx("div", { className: "w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400", children: _jsx(Layers, { className: "w-6 h-6" }) })] })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Cari kategori (contoh: Printing, Medic, Food, Engineering, ITE)...", className: "w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50/50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-[#0077B6] transition" }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(''), className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-4 h-4" }) }))] }), _jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [_jsxs("div", { className: "flex items-center bg-slate-100 dark:bg-[#03045E]/80 p-1 rounded-xl border border-slate-200 dark:border-[#0077B6]/40", children: [_jsx("button", { onClick: () => setViewMode('CARDS'), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'CARDS'
                                                    ? 'bg-white dark:bg-[#0077B6] text-slate-900 dark:text-white shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-900 dark:text-[#ADE8F4]/70 dark:hover:text-white'}`, children: "Card Grid" }), _jsx("button", { onClick: () => setViewMode('TABLE'), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${viewMode === 'TABLE'
                                                    ? 'bg-white dark:bg-[#0077B6] text-slate-900 dark:text-white shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-900 dark:text-[#ADE8F4]/70 dark:hover:text-white'}`, children: "Table View" })] }), isSupervisor && (_jsxs("button", { onClick: handleOpenCreate, className: "px-4 py-2 text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Tambah Kategori" })] }))] })] }), _jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pt-1", children: [_jsxs("span", { className: "text-[11px] text-slate-400 dark:text-[#ADE8F4]/70 font-medium flex items-center gap-1", children: [_jsx(Sparkles, { className: "w-3 h-3 text-[#0077B6] dark:text-[#48CAE4]" }), "Rekomendasi Cepat:"] }), searchRecommendations.map((keyword) => (_jsx("button", { onClick: () => setSearchQuery(keyword), className: "px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-[#03045E]/60 text-slate-600 dark:text-[#ADE8F4] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 hover:text-[#0077B6] transition border border-slate-200 dark:border-[#0077B6]/30 cursor-pointer", children: keyword }, keyword))), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(''), className: "text-[11px] text-rose-500 hover:underline ml-1", children: "Reset Filter" }))] })] }), viewMode === 'CARDS' && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredCategories.map((category) => {
                    const count = getItemCount(category.id);
                    const categoryItems = getCategoryItems(category.id);
                    const badgeColor = getCategoryColor(category.code);
                    return (_jsxs("div", { className: "p-5 rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30 shadow-xs hover:border-[#0077B6]/60 dark:hover:border-[#48CAE4]/60 transition-all flex flex-col justify-between group", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: `px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${badgeColor}`, children: category.code }), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4] transition", children: category.name })] }), isSupervisor && (_jsxs("div", { className: "flex items-center gap-1 opacity-80 group-hover:opacity-100 transition", children: [_jsx("button", { onClick: () => handleOpenEdit(category), className: "p-1.5 rounded-lg text-slate-400 hover:text-[#0077B6] dark:hover:text-[#48CAE4] hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", title: "Edit Kategori", children: _jsx(Edit2, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => setDeletingCategory(category), className: "p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition", title: "Hapus Kategori", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }))] }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed", children: category.description || 'Tidak ada deskripsi rinci untuk kategori ini.' }), _jsxs("div", { className: "mt-3.5 pt-3 border-t border-slate-100 dark:border-[#0077B6]/20", children: [_jsxs("p", { className: "text-[11px] font-semibold text-slate-400 dark:text-[#ADE8F4]/70 mb-1.5", children: ["Contoh Barang (", count, " total):"] }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [categoryItems.slice(0, 3).map((it) => (_jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#03045E]/40 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-[#0077B6]/30 truncate max-w-[180px]", title: it.itemName, children: it.itemName }, it.id))), count > 3 && (_jsxs("span", { className: "text-[10px] px-1.5 py-0.5 text-slate-400 dark:text-[#ADE8F4]", children: ["+", count - 3, " lainnya"] }))] })] })] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-slate-100 dark:border-[#0077B6]/20 flex items-center justify-between", children: [_jsxs("span", { className: "text-xs font-semibold text-slate-700 dark:text-slate-200", children: [count, " Barang Terdaftar"] }), _jsxs("button", { onClick: () => onNavigateToItems(category.name), className: "text-xs font-semibold text-[#0077B6] dark:text-[#48CAE4] hover:underline flex items-center gap-1 group/btn cursor-pointer", children: [_jsx("span", { children: "Buka Item Master" }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" })] })] })] }, category.id));
                }) })), viewMode === 'TABLE' && (_jsx("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/30 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-slate-50 dark:bg-[#03045E]/80 text-slate-500 dark:text-[#ADE8F4] font-semibold border-b border-slate-200 dark:border-[#0077B6]/30", children: _jsxs("tr", { children: [_jsx("th", { className: "px-5 py-3.5", children: "Kode" }), _jsx("th", { className: "px-5 py-3.5", children: "Nama Kategori" }), _jsx("th", { className: "px-5 py-3.5", children: "Deskripsi" }), _jsx("th", { className: "px-5 py-3.5 text-center", children: "Jumlah Barang" }), _jsx("th", { className: "px-5 py-3.5 text-right", children: "Aksi" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-[#0077B6]/20", children: filteredCategories.map((category) => {
                                    const count = getItemCount(category.id);
                                    const badgeColor = getCategoryColor(category.code);
                                    return (_jsxs("tr", { className: "hover:bg-slate-50/70 dark:hover:bg-[#03045E]/40 transition", children: [_jsx("td", { className: "px-5 py-3.5", children: _jsx("span", { className: `px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${badgeColor}`, children: category.code }) }), _jsx("td", { className: "px-5 py-3.5 font-bold text-slate-900 dark:text-white", children: category.name }), _jsx("td", { className: "px-5 py-3.5 text-slate-500 dark:text-slate-300 max-w-md truncate", children: category.description || '-' }), _jsx("td", { className: "px-5 py-3.5 text-center", children: _jsxs("span", { className: "px-2.5 py-1 rounded-full text-xs font-bold bg-[#CAF0F8] dark:bg-[#0077B6]/40 text-[#0077B6] dark:text-[#ADE8F4]", children: [count, " Items"] }) }), _jsx("td", { className: "px-5 py-3.5 text-right", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsxs("button", { onClick: () => onNavigateToItems(category.name), className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#CAF0F8] dark:bg-[#0077B6]/40 text-[#0077B6] dark:text-[#ADE8F4] hover:bg-[#0077B6] hover:text-white transition flex items-center gap-1.5", children: [_jsx(Eye, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Lihat Barang" })] }), isSupervisor && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleOpenEdit(category), className: "p-1.5 rounded-lg text-slate-400 hover:text-[#0077B6] dark:hover:text-[#48CAE4] hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", title: "Edit", children: _jsx(Edit2, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => setDeletingCategory(category), className: "p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition", title: "Hapus", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] }))] }) })] }, category.id));
                                }) })] }) }) })), filteredCategories.length === 0 && (_jsxs("div", { className: "p-12 text-center rounded-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/30", children: [_jsx(Tags, { className: "w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" }), _jsx("h4", { className: "text-sm font-bold text-slate-900 dark:text-white", children: "Tidak ada kategori yang cocok" }), _jsx("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1", children: "Coba gunakan kata kunci lain seperti \"Printing\", \"Medic\", \"Food\", atau bersihkan filter pencarian." }), _jsx("button", { onClick: () => setSearchQuery(''), className: "mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#0077B6] rounded-xl hover:bg-[#0096C7] transition", children: "Tampilkan Semua Kategori" })] })), (isCreateModalOpen || editingCategory) && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-slate-200 dark:border-[#0077B6]/40 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "px-6 py-4 border-b border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Tags, { className: "w-5 h-5 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: editingCategory ? 'Edit Kategori Master' : 'Tambah Kategori Master Baru' })] }), _jsx("button", { onClick: () => {
                                        setIsCreateModalOpen(false);
                                        setEditingCategory(null);
                                    }, className: "text-slate-400 hover:text-slate-600 dark:hover:text-white", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("form", { onSubmit: handleSaveCategory, className: "p-6 space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Nama Kategori ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "text", required: true, value: formName, onChange: (e) => setFormName(e.target.value), placeholder: "Contoh: Printing & Stationery, Medic, Food...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: ["Kode Kategori (3-4 Huruf Kapital) ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "text", required: true, maxLength: 5, value: formCode, onChange: (e) => setFormCode(e.target.value.toUpperCase()), placeholder: "Contoh: PST, MED, FOD, ENG...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1", children: "Deskripsi & Cakupan Barang" }), _jsx("textarea", { rows: 3, value: formDescription, onChange: (e) => setFormDescription(e.target.value), placeholder: "Deskripsikan jenis-jenis barang dalam kategori ini...", className: "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#0077B6]/40 bg-slate-50 dark:bg-[#03045E]/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#0077B6] focus:outline-none" })] }), _jsxs("div", { className: "pt-3 border-t border-slate-200 dark:border-[#0077B6]/30 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                setIsCreateModalOpen(false);
                                                setEditingCategory(null);
                                            }, className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", children: "Batal" }), _jsx("button", { type: "submit", className: "px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] shadow-xs transition", children: editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori' })] })] })] }) })), deletingCategory && (_jsx("div", { className: "fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white dark:bg-[#023E8A] rounded-2xl border border-rose-200 dark:border-rose-900 shadow-2xl w-full max-w-sm p-6 space-y-4", children: [_jsx("div", { className: "w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto", children: _jsx(AlertCircle, { className: "w-6 h-6" }) }), _jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "font-bold text-slate-900 dark:text-white text-sm", children: "Hapus Kategori?" }), _jsxs("p", { className: "text-xs text-slate-500 dark:text-slate-300 mt-1", children: ["Apakah Anda yakin ingin menghapus kategori", ' ', _jsx("strong", { className: "text-slate-900 dark:text-white", children: deletingCategory.name }), "?"] }), getItemCount(deletingCategory.id) > 0 && (_jsxs("div", { className: "mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] text-left", children: ["\u26A0\uFE0F Peringatan: Kategori ini masih memiliki ", getItemCount(deletingCategory.id), " barang aktif. Hapus atau pindahkan barang terlebih dahulu."] }))] }), _jsxs("div", { className: "flex items-center justify-center gap-2 pt-2", children: [_jsx("button", { onClick: () => setDeletingCategory(null), className: "px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#03045E]/60 transition", children: "Batal" }), _jsx("button", { disabled: getItemCount(deletingCategory.id) > 0, onClick: handleDeleteConfirm, className: "px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition", children: "Ya, Hapus" })] })] }) }))] }));
};
