import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const StatusBadge = ({ status }) => {
    switch (status) {
        case 'DRAFT':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300", children: "DRAFT" });
        case 'SUBMITTED':
        case 'UNDER_REVIEW':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60", children: "UNDER REVIEW" });
        case 'APPROVED':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60", children: "APPROVED" });
        case 'REJECTED':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60", children: "REJECTED" });
        case 'PROCESSING':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 animate-pulse", children: "PROCESSING" });
        case 'COMPLETED':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60", children: "COMPLETED" });
        case 'AVAILABLE':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60", children: "AVAILABLE" });
        case 'LOW_STOCK':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono", children: "LOW STOCK" });
        case 'OUT_OF_STOCK':
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-mono", children: "OUT OF STOCK" });
        case 'IN':
            return _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800", children: "+ IN" });
        case 'OUT':
            return _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800", children: "- OUT" });
        case 'ADJUSTMENT':
            return _jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800", children: "ADJ" });
        default:
            return _jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", children: status });
    }
};
