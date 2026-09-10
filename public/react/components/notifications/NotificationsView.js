import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, XCircle, PackageCheck, AlertTriangle, FileSpreadsheet, Clock, CheckCheck, } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const NotificationsView = ({ onNavigateToSR }) => {
    const [notifications, setNotifications] = useState([]);
    const [filter24HoursOnly, setFilter24HoursOnly] = useState(true);
    const [filterType, setFilterType] = useState('ALL');
    const loadData = () => {
        setNotifications(storeService.getNotifications(filter24HoursOnly));
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, [filter24HoursOnly]);
    const handleMarkAllRead = () => {
        storeService.markAllNotificationsAsRead();
        loadData();
    };
    const handleNotificationClick = (notif) => {
        storeService.markNotificationAsRead(notif.id);
        if (notif.data?.storeRequestId) {
            onNavigateToSR(notif.data.storeRequestId);
        }
    };
    const getIcon = (type) => {
        switch (type) {
            case 'STORE_REQUEST_SUBMITTED':
                return _jsx(FileSpreadsheet, { className: "w-5 h-5 text-amber-500" });
            case 'STORE_REQUEST_APPROVED':
                return _jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-500" });
            case 'STORE_REQUEST_REJECTED':
                return _jsx(XCircle, { className: "w-5 h-5 text-rose-500" });
            case 'RECEIVING_COMPLETED':
                return _jsx(PackageCheck, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" });
            case 'LOW_STOCK_ALERT':
                return _jsx(AlertTriangle, { className: "w-5 h-5 text-amber-500" });
            default:
                return _jsx(Bell, { className: "w-5 h-5 text-slate-400" });
        }
    };
    const filtered = notifications.filter((n) => {
        if (filterType !== 'ALL' && n.type !== filterType)
            return false;
        return true;
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsx("div", { className: "flex items-center gap-3", children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("input", { type: "checkbox", id: "filter24h", checked: filter24HoursOnly, onChange: (e) => setFilter24HoursOnly(e.target.checked), className: "w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600" }), _jsx("label", { htmlFor: "filter24h", className: "text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer", children: "Only Show Last 24 Hours (Realtime)" })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("select", { value: filterType, onChange: (e) => setFilterType(e.target.value), className: "px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none", children: [_jsx("option", { value: "ALL", children: "All Event Types" }), _jsx("option", { value: "STORE_REQUEST_SUBMITTED", children: "Requisitions Submitted" }), _jsx("option", { value: "STORE_REQUEST_APPROVED", children: "Approvals" }), _jsx("option", { value: "STORE_REQUEST_REJECTED", children: "Rejections" }), _jsx("option", { value: "RECEIVING_COMPLETED", children: "Goods Intake" }), _jsx("option", { value: "LOW_STOCK_ALERT", children: "Stock Alerts" })] }), _jsxs("button", { onClick: handleMarkAllRead, className: "px-4 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition flex items-center gap-2 cursor-pointer", children: [_jsx(CheckCheck, { className: "w-4 h-4" }), _jsx("span", { children: "Mark All As Read" })] })] })] }), _jsx("div", { className: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80", children: filtered.length === 0 ? (_jsxs("div", { className: "py-20 text-center text-slate-400", children: [_jsx("div", { className: "w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3", children: _jsx(Bell, { className: "w-6 h-6" }) }), _jsx("p", { className: "text-sm font-semibold text-slate-700 dark:text-slate-300", children: "No notifications matching current filter." }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Events will broadcast in real-time as Store Requests and Goods Receiving progress." })] })) : (filtered.map((notif) => (_jsxs("div", { onClick: () => handleNotificationClick(notif), className: `p-6 transition cursor-pointer flex items-start gap-4 ${!notif.read
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'}`, children: [_jsx("div", { className: "p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 shrink-0", children: getIcon(notif.type) }), _jsxs("div", { className: "flex-1 min-w-0 space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("h4", { className: "font-semibold text-sm text-slate-900 dark:text-white", children: notif.title }), _jsxs("span", { className: "text-[11px] text-slate-400 whitespace-nowrap flex items-center gap-1.5", children: [_jsx(Clock, { className: "w-3.5 h-3.5" }), notif.createdAt] })] }), _jsx("p", { className: "text-xs text-slate-600 dark:text-slate-300 leading-relaxed", children: notif.message }), notif.data?.srNumber && (_jsxs("div", { className: "flex items-center gap-2 pt-1.5", children: [_jsx("span", { className: "font-mono font-bold text-[11px] text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700", children: notif.data.srNumber }), _jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Click to inspect store request \u2192" })] }))] }), !notif.read && (_jsx("div", { className: "w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2 shadow-xs" }))] }, notif.id)))) })] }));
};
