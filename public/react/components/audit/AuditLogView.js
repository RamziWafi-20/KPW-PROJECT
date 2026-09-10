import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const AuditLogView = () => {
    const [logs, setLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAction, setSelectedAction] = useState('ALL');
    const loadData = () => {
        setLogs(storeService.getAuditLogs());
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, []);
    const filteredLogs = logs.filter((log) => {
        if (selectedAction !== 'ALL' && log.action !== selectedAction)
            return false;
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            return (log.details.toLowerCase().includes(q) ||
                log.userName.toLowerCase().includes(q) ||
                log.action.toLowerCase().includes(q) ||
                log.ipAddress.toLowerCase().includes(q));
        }
        return true;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "p-6 rounded-3xl bg-indigo-50/70 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 text-xs flex items-center gap-4", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100 dark:shadow-none", children: _jsx(ShieldCheck, { className: "w-5 h-5" }) }), _jsxs("div", { className: "text-slate-700 dark:text-slate-300", children: [_jsx("strong", { className: "text-slate-900 dark:text-white font-semibold", children: "Security & Compliance Audit Trail:" }), " Every Store Request state mutation, supervisor authorization, goods receiving transaction, and inventory restock is recorded with verified timestamp and IP address."] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsx("input", { type: "text", placeholder: "Search audit trail by keyword, user, or IP address...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-11 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" })] }), _jsxs("select", { value: selectedAction, onChange: (e) => setSelectedAction(e.target.value), className: "px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none", children: [_jsx("option", { value: "ALL", children: "All Audit Actions" }), _jsx("option", { value: "SR_CREATED", children: "SR Created" }), _jsx("option", { value: "SR_SUBMITTED", children: "SR Submitted" }), _jsx("option", { value: "SR_APPROVED", children: "SR Approved" }), _jsx("option", { value: "SR_REJECTED", children: "SR Rejected" }), _jsx("option", { value: "RECEIVING_COMPLETED", children: "Receiving Completed" }), _jsx("option", { value: "STOCK_ADJUSTED", children: "Stock Adjusted" })] })] }), _jsx("div", { className: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: [_jsx("th", { className: "py-4 px-6", children: "Timestamp" }), _jsx("th", { className: "py-4 px-6", children: "Action Type" }), _jsx("th", { className: "py-4 px-6", children: "User" }), _jsx("th", { className: "py-4 px-6", children: "Entity & ID" }), _jsx("th", { className: "py-4 px-6", children: "Audit Details" }), _jsx("th", { className: "py-4 px-6", children: "IP Address" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800/80", children: filteredLogs.map((log) => (_jsxs("tr", { className: "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition", children: [_jsx("td", { className: "py-4 px-6 text-slate-400 font-mono whitespace-nowrap", children: log.createdAt }), _jsx("td", { className: "py-4 px-6 whitespace-nowrap", children: _jsx("span", { className: `px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${log.action.includes('APPROVED')
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                                    : log.action.includes('REJECTED')
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                                        : log.action.includes('RECEIVING')
                                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`, children: log.action }) }), _jsx("td", { className: "py-4 px-6 font-semibold text-slate-900 dark:text-white whitespace-nowrap", children: log.userName }), _jsxs("td", { className: "py-4 px-6 font-mono text-slate-400 whitespace-nowrap", children: [log.entityType, " #", log.entityId] }), _jsx("td", { className: "py-4 px-6 text-slate-700 dark:text-slate-300 max-w-md", children: log.details }), _jsx("td", { className: "py-4 px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap", children: log.ipAddress })] }, log.id))) })] }) }) })] }));
};
