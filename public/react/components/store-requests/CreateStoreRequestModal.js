import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Plus, Trash2, FileText, Send, Save, AlertCircle, Sparkles } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const CreateStoreRequestModal = ({ isOpen, onClose, currentUser, onSuccess, }) => {
    const categories = storeService.getCategories();
    const allItems = storeService.getItems();
    const [purpose, setPurpose] = useState('');
    const [requiredDate, setRequiredDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        return d.toISOString().split('T')[0];
    });
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([
        { categoryId: categories[0]?.id || 1, itemId: 0, quantityRequested: 1, unit: '', notes: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    if (!isOpen)
        return null;
    const handleAddItemRow = () => {
        setItems([
            ...items,
            { categoryId: categories[0]?.id || 1, itemId: 0, quantityRequested: 1, unit: '', notes: '' },
        ]);
    };
    const handleRemoveItemRow = (index) => {
        if (items.length <= 1)
            return;
        setItems(items.filter((_, idx) => idx !== index));
    };
    const handleCategoryChange = (index, catId) => {
        const newItems = [...items];
        newItems[index].categoryId = catId;
        newItems[index].itemId = 0;
        newItems[index].unit = '';
        setItems(newItems);
    };
    const handleItemSelect = (index, itemId) => {
        const selected = allItems.find((i) => i.id === itemId);
        const newItems = [...items];
        newItems[index].itemId = itemId;
        newItems[index].unit = selected?.unit || 'Units';
        if (selected) {
            newItems[index].categoryId = selected.categoryId;
        }
        setItems(newItems);
    };
    const handleQuantityChange = (index, qty) => {
        const newItems = [...items];
        newItems[index].quantityRequested = Math.max(1, qty);
        setItems(newItems);
    };
    const handleRowNotesChange = (index, val) => {
        const newItems = [...items];
        newItems[index].notes = val;
        setItems(newItems);
    };
    const handleSubmit = (isDraft) => {
        setError(null);
        if (!purpose.trim()) {
            setError('Please provide a purpose / business justification.');
            return;
        }
        for (let i = 0; i < items.length; i++) {
            if (!items[i].itemId) {
                setError(`Please select an item for line item #${i + 1}`);
                return;
            }
            if (items[i].quantityRequested <= 0) {
                setError(`Quantity for line #${i + 1} must be greater than zero.`);
                return;
            }
        }
        setIsSubmitting(true);
        setTimeout(() => {
            const res = storeService.createStoreRequest({
                purpose,
                requiredDate,
                notes,
                isDraft,
                items: items.map((it) => ({
                    itemId: it.itemId,
                    quantityRequested: it.quantityRequested,
                    notes: it.notes,
                })),
            });
            setIsSubmitting(false);
            if (res.success) {
                onSuccess(res.message);
                onClose();
            }
            else {
                setError(res.message);
            }
        }, 200);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150", children: _jsxs("div", { className: "w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "p-6 bg-slate-900 text-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center", children: _jsx(FileText, { className: "w-5 h-5 text-indigo-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold", children: "Create Store Request (Requisition)" }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Department: ", currentUser.departmentName || 'Central Operations', " \u2022 Requester: ", currentUser.name] })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition", children: "\u2715" })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto flex-1", children: [error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "sm:col-span-2", children: [_jsxs("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5", children: ["Purpose / Business Justification ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("textarea", { required: true, rows: 2, value: purpose, onChange: (e) => setPurpose(e.target.value), placeholder: "e.g. Monthly office supplies replenishment for new employee onboarding kits...", className: "w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5", children: ["Required By Date ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsx("input", { type: "date", required: true, value: requiredDate, onChange: (e) => setRequiredDate(e.target.value), className: "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5", children: "Special Delivery Notes (Optional)" }), _jsx("input", { type: "text", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Deliver to Room 304", className: "w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] })] }), _jsxs("div", { className: "border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden", children: [_jsxs("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-indigo-600 dark:text-indigo-400" }), _jsxs("h4", { className: "font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider", children: ["Requisition Items (", items.length, ")"] })] }), _jsxs("button", { type: "button", onClick: handleAddItemRow, className: "px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), "Add Item Row"] })] }), _jsx("div", { className: "p-4 space-y-3", children: items.map((row, idx) => {
                                        const categoryFilteredItems = allItems.filter((i) => i.categoryId === Number(row.categoryId));
                                        return (_jsxs("div", { className: "p-3.5 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end", children: [_jsxs("div", { className: "sm:col-span-3", children: [_jsx("label", { className: "block text-[10px] font-semibold uppercase text-slate-400 mb-1", children: "Category" }), _jsx("select", { value: row.categoryId, onChange: (e) => handleCategoryChange(idx, Number(e.target.value)), className: "w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", children: categories.map((cat) => (_jsx("option", { value: cat.id, children: cat.name }, cat.id))) })] }), _jsxs("div", { className: "sm:col-span-4", children: [_jsxs("label", { className: "block text-[10px] font-semibold uppercase text-slate-400 mb-1", children: ["Select Item ", _jsx("span", { className: "text-rose-500", children: "*" })] }), _jsxs("select", { value: row.itemId, onChange: (e) => handleItemSelect(idx, Number(e.target.value)), className: "w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", children: [_jsx("option", { value: 0, children: "-- Choose item --" }), categoryFilteredItems.map((item) => (_jsxs("option", { value: item.id, children: [item.itemName, " (Stock: ", item.currentStock, " ", item.unit, ")"] }, item.id)))] })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsxs("label", { className: "block text-[10px] font-semibold uppercase text-slate-400 mb-1", children: ["Qty (", row.unit || 'Units', ")"] }), _jsx("input", { type: "number", min: "1", value: row.quantityRequested, onChange: (e) => handleQuantityChange(idx, parseInt(e.target.value) || 1), className: "w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] }), _jsxs("div", { className: "sm:col-span-2", children: [_jsx("label", { className: "block text-[10px] font-semibold uppercase text-slate-400 mb-1", children: "Remarks" }), _jsx("input", { type: "text", placeholder: "Optional note", value: row.notes, onChange: (e) => handleRowNotesChange(idx, e.target.value), className: "w-full px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] }), _jsx("div", { className: "sm:col-span-1 flex justify-end", children: _jsx("button", { type: "button", disabled: items.length <= 1, onClick: () => handleRemoveItemRow(idx), className: "w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition", title: "Remove Item Row", children: _jsx(Trash2, { className: "w-4 h-4" }) }) })] }, idx));
                                    }) })] })] }), _jsxs("div", { className: "p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer", children: "Cancel" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { type: "button", disabled: isSubmitting, onClick: () => handleSubmit(true), className: "px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer", children: [_jsx(Save, { className: "w-3.5 h-3.5 text-slate-400" }), _jsx("span", { children: "Save as Draft" })] }), _jsxs("button", { type: "button", disabled: isSubmitting, onClick: () => handleSubmit(false), className: "px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition flex items-center gap-2 cursor-pointer", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: isSubmitting ? 'Submitting Requisition...' : 'Submit to Supervisor' })] })] })] })] }) }));
};
