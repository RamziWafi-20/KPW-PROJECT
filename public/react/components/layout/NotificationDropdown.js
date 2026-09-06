import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, ExternalLink, Clock, AlertTriangle, CheckCircle2, XCircle, Package, FileText, } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
export const NotificationDropdown = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const refresh = () => {
        const active = storeService.getActiveNotifications();
        setNotifications(active);
        setUnreadCount(storeService.getUnreadNotificationCount());
    };
    useEffect(() => {
        refresh();
        const unsubscribe = storeService.subscribe(refresh);
        return () => unsubscribe();
    }, []);
    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleNotificationClick = (notif) => {
        storeService.markNotificationAsRead(notif.id);
        setIsOpen(false);
        if (notif.referenceType === 'StoreRequest') {
            onNavigate('store-requests', notif.referenceId);
        }
        else if (notif.referenceType === 'Receiving') {
            onNavigate('receiving', notif.referenceId);
        }
        else if (notif.referenceType === 'Inventory') {
            onNavigate('inventory');
        }
        else if (notif.referenceType === 'Report') {
            onNavigate('reports');
        }
        else {
            onNavigate('notifications');
        }
    };
    const handleMarkAllRead = () => {
        storeService.markAllNotificationsAsRead();
        refresh();
    };
    const handleCleanup = () => {
        const count = storeService.cleanupExpiredNotifications();
        refresh();
        alert(`Cleaned up ${count} notifications older than 24 hours (Simulated 'php artisan notifications:cleanup')`);
    };
    const formatTimeAgo = (isoString) => {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)
            return 'Just now';
        if (mins < 60)
            return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24)
            return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };
    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'SR_SUBMITTED':
                return _jsx(FileText, { className: "w-4 h-4 text-sky-500" });
            case 'SR_APPROVED':
                return _jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-500" });
            case 'SR_REJECTED':
                return _jsx(XCircle, { className: "w-4 h-4 text-rose-500" });
            case 'RECEIVING_COMPLETED':
                return _jsx(Package, { className: "w-4 h-4 text-[#0077B6]" });
            case 'LOW_STOCK':
            case 'OUT_OF_STOCK':
                return _jsx(AlertTriangle, { className: "w-4 h-4 text-amber-500" });
            default:
                return _jsx(Bell, { className: "w-4 h-4 text-slate-500" });
        }
    };
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { id: "navbar-notification-bell", onClick: () => setIsOpen(!isOpen), className: "relative w-10 h-10 bg-slate-100 dark:bg-[#03045E]/70 rounded-full flex items-center justify-center border border-slate-200 dark:border-[#0077B6]/40 text-slate-600 dark:text-[#ADE8F4] hover:bg-slate-200 dark:hover:bg-[#03045E] transition cursor-pointer", title: "Realtime Notifications", children: [_jsx(Bell, { className: "w-4 h-4" }), unreadCount > 0 && (_jsx("span", { id: "navbar-notification-badge", className: "absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white dark:border-[#03045E] rounded-full" }))] }), isOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-96 max-w-[calc(100vw-24px)] bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/60 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150", children: [_jsxs("div", { className: "px-5 py-4 bg-[#0077B6] dark:bg-[#03045E] text-white flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Bell, { className: "w-4 h-4 text-[#ADE8F4]" }), _jsx("span", { className: "font-bold text-sm tracking-wide", children: "Realtime Notifications" }), unreadCount > 0 && (_jsxs("span", { className: "text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-semibold text-white", children: [unreadCount, " new"] }))] }), _jsx("div", { className: "flex items-center gap-1.5 text-xs text-[#ADE8F4]", children: _jsxs("button", { onClick: handleMarkAllRead, className: "hover:text-white flex items-center gap-1 hover:underline px-1.5 py-0.5 rounded transition font-medium", title: "Mark all active as read", children: [_jsx(CheckCheck, { className: "w-3.5 h-3.5" }), "Read All"] }) })] }), _jsxs("div", { className: "px-5 py-2 bg-slate-50 dark:bg-[#03045E]/80 border-b border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between text-[11px] text-slate-500 dark:text-[#ADE8F4]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3 text-[#0077B6] dark:text-[#48CAE4]" }), "Active in last 24 hours"] }), _jsxs("button", { onClick: handleCleanup, className: "text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 hover:underline font-medium", title: "Execute php artisan notifications:cleanup", children: [_jsx(Trash2, { className: "w-3 h-3" }), "Clean >24h"] })] }), _jsx("div", { className: "max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#0077B6]/30", children: notifications.length === 0 ? (_jsxs("div", { className: "py-10 text-center px-4", children: [_jsx(Bell, { className: "w-8 h-8 mx-auto text-slate-300 dark:text-slate-500 mb-2 stroke-[1.5]" }), _jsx("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-300", children: "No active notifications" }), _jsx("p", { className: "text-xs text-slate-400 dark:text-slate-400 mt-1", children: "You're all caught up! New requests and updates will appear here in real-time." })] })) : (notifications.map((notif) => {
                            const isUnread = !notif.readAt;
                            return (_jsxs("div", { onClick: () => handleNotificationClick(notif), className: `p-4 flex items-start gap-3 cursor-pointer transition-colors ${isUnread
                                    ? 'bg-[#CAF0F8]/40 dark:bg-[#03045E]/50 hover:bg-[#CAF0F8]/70 dark:hover:bg-[#03045E]/80'
                                    : 'hover:bg-slate-50 dark:hover:bg-[#03045E]/30'}`, children: [_jsx("div", { className: "mt-0.5 p-2 rounded-xl bg-white dark:bg-[#03045E] shadow-xs border border-slate-200/80 dark:border-[#0077B6]/40 shrink-0", children: getEventIcon(notif.eventType) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between gap-1", children: [_jsx("p", { className: `text-xs ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`, children: notif.title }), _jsx("span", { className: "text-[10px] text-slate-400 dark:text-[#90E0EF] shrink-0", children: formatTimeAgo(notif.createdAt) })] }), _jsx("p", { className: "text-xs text-slate-600 dark:text-[#ADE8F4] mt-0.5 line-clamp-2 leading-relaxed", children: notif.message }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1.5 text-[10px] text-[#0077B6] dark:text-[#48CAE4] font-semibold", children: [_jsx("span", { children: "View details" }), _jsx(ExternalLink, { className: "w-2.5 h-2.5" })] })] }), isUnread && (_jsx("span", { className: "w-2 h-2 rounded-full bg-[#0077B6] dark:bg-[#00B4D8] shrink-0 mt-1.5" }))] }, notif.id));
                        })) }), _jsx("div", { className: "px-5 py-3 bg-slate-50 dark:bg-[#03045E]/90 border-t border-slate-200 dark:border-[#0077B6]/30 text-center", children: _jsx("button", { onClick: () => {
                                setIsOpen(false);
                                onNavigate('notifications');
                            }, className: "text-xs font-semibold text-[#0077B6] dark:text-[#48CAE4] hover:text-[#023E8A] dark:hover:text-white", children: "Open Full Notification Center \u2192" }) })] }))] }));
};
