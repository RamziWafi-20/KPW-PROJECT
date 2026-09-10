import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { PackageCheck, AlertCircle, ShieldCheck } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const ReceivingModal = ({ sr, isOpen, onClose, onSuccess, }) => {
    if (!isOpen || !sr)
        return null;
    const [notes, setNotes] = useState('All items inspected, barcodes scanned, and accepted in sealed condition.');
    const [itemsPayload, setItemsPayload] = useState(sr.items.map((it) => ({
        storeRequestItemId: it.id,
        itemId: it.itemId,
        itemName: it.itemName,
        unit: it.unit,
        quantityRequested: it.quantityRequested,
        quantityReceived: it.quantityRequested, // Default to full requested qty
        condition: 'Good / Passed Inspection',
        notes: '',
    })));
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const handleQtyChange = (idx, qty) => {
        const next = [...itemsPayload];
        next[idx].quantityReceived = Math.max(0, qty);
        setItemsPayload(next);
    };
    const handleConditionChange = (idx, val) => {
        const next = [...itemsPayload];
        next[idx].condition = val;
        setItemsPayload(next);
    };
    const handleComplete = () => {
        setError(null);
        setIsProcessing(true);
        setTimeout(() => {
            const res = storeService.completeReceiving({
                storeRequestId: sr.id,
                notes,
                receivedItems: itemsPayload.map((it) => ({
                    storeRequestItemId: it.storeRequestItemId,
                    itemId: it.itemId,
                    quantityReceived: it.quantityReceived,
                    condition: it.condition,
                    notes: it.notes,
                })),
            });
            setIsProcessing(false);
            if (res.success) {
                onSuccess(res.message);
                onClose();
            }
            else {
                setError(res.message);
            }
        }, 300);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150", children: _jsxs("div", { className: "w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]", children: [_jsxs("div", { className: "p-6 bg-slate-900 text-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center", children: _jsx(PackageCheck, { className: "w-5 h-5 text-indigo-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-base font-bold", children: "Process Receiving & Inventory Intake" }), _jsxs("p", { className: "text-xs text-slate-400", children: [sr.srNumber, " \u2022 ", sr.departmentName, " (Approved by ", sr.approval?.approvedByName || 'Supervisor', ")"] })] })] }), _jsx("button", { onClick: onClose, className: "w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition", children: "\u2715" })] }), _jsxs("div", { className: "p-6 space-y-6 overflow-y-auto", children: [error && (_jsxs("div", { className: "p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800/60 border border-indigo-100 dark:border-slate-700 text-xs flex items-center gap-3.5", children: [_jsx("div", { className: "w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs", children: _jsx(ShieldCheck, { className: "w-4 h-4" }) }), _jsxs("div", { className: "text-slate-700 dark:text-slate-300", children: [_jsx("strong", { className: "text-slate-900 dark:text-white font-semibold", children: "Inventory Transaction Guarantee:" }), " Completing this intake automatically increments current item stock in warehouse inventory and logs verified stock movements."] })] }), _jsxs("div", { className: "border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden", children: [_jsx("div", { className: "p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800", children: _jsx("h4", { className: "font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300", children: "Inspect Items & Enter Received Quantities" }) }), _jsx("div", { className: "p-4 space-y-3", children: itemsPayload.map((it, idx) => (_jsxs("div", { className: "p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center", children: [_jsxs("div", { className: "sm:col-span-5", children: [_jsx("p", { className: "font-semibold text-xs text-slate-900 dark:text-white", children: it.itemName }), _jsxs("p", { className: "text-[11px] text-slate-400 mt-0.5", children: ["Approved Qty: ", _jsxs("strong", { className: "text-slate-700 dark:text-slate-300", children: [it.quantityRequested, " ", it.unit] })] })] }), _jsxs("div", { className: "sm:col-span-3", children: [_jsxs("label", { className: "block text-[11px] font-semibold uppercase text-slate-400 mb-1", children: ["Received Qty (", it.unit, ")"] }), _jsx("input", { type: "number", min: "0", value: it.quantityReceived, onChange: (e) => handleQtyChange(idx, parseInt(e.target.value) || 0), className: "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] }), _jsxs("div", { className: "sm:col-span-4", children: [_jsx("label", { className: "block text-[11px] font-semibold uppercase text-slate-400 mb-1", children: "Inspection Condition" }), _jsxs("select", { value: it.condition, onChange: (e) => handleConditionChange(idx, e.target.value), className: "w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none", children: [_jsx("option", { value: "Good / Passed Inspection", children: "Good / Passed Inspection" }), _jsx("option", { value: "Sealed Original Box", children: "Sealed Original Box" }), _jsx("option", { value: "Minor Packaging Wear / Verified", children: "Minor Packaging Wear / Verified" }), _jsx("option", { value: "Partial Delivery", children: "Partial Delivery" })] })] })] }, it.storeRequestItemId))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5", children: "General Receiving Inspection Notes" }), _jsx("input", { type: "text", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Carrier invoice #77291 verified, items loaded to Bay B-12", className: "w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none" })] })] }), _jsxs("div", { className: "p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer", children: "Cancel" }), _jsxs("button", { type: "button", disabled: isProcessing, onClick: handleComplete, className: "px-6 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition flex items-center gap-2 cursor-pointer", children: [_jsx(PackageCheck, { className: "w-4 h-4" }), _jsx("span", { children: isProcessing ? 'Updating Stock & Inventory...' : 'Complete Receiving & Update Stock' })] })] })] }) }));
};
