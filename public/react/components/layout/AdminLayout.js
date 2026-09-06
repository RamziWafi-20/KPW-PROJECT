import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { Breadcrumb } from './Breadcrumb.js';
import { RoleSwitcherModal } from './RoleSwitcherModal.js';
import { storeService } from '../../services/storeService.js';
import { RefreshCw, Radio } from 'lucide-react';
export const AdminLayout = ({ currentUser, activeView, onNavigate, onLogout, title, subtitle, breadcrumbItems = [], actions, children, }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('stora_sidebar_collapsed') === 'true';
        }
        return false;
    });
    const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('stora_dark_mode') === 'true';
        }
        return false;
    });
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('stora_dark_mode', 'true');
        }
        else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('stora_dark_mode', 'false');
        }
    }, [isDarkMode]);
    useEffect(() => {
        localStorage.setItem('stora_sidebar_collapsed', isSidebarCollapsed ? 'true' : 'false');
    }, [isSidebarCollapsed]);
    const refreshNotifCount = () => {
        setUnreadCount(storeService.getUnreadNotificationCount());
    };
    useEffect(() => {
        refreshNotifCount();
        const unsub = storeService.subscribe(refreshNotifCount);
        return () => unsub();
    }, []);
    const handleToggleDarkMode = () => {
        setIsDarkMode((prev) => !prev);
    };
    const handleToggleSidebarCollapse = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };
    const handleResetDemo = () => {
        if (window.confirm('Reset all Store Requests, Inventory Stock, and Notifications to initial seed state?')) {
            storeService.resetToFactoryDemo();
            onNavigate('dashboard');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-[#F4F9FD] dark:bg-[#03045E] text-slate-900 dark:text-white flex flex-col transition-colors duration-200 font-sans", children: [_jsx(Navbar, { currentUser: currentUser, onToggleSidebar: () => setIsSidebarOpen(!isSidebarOpen), isSidebarCollapsed: isSidebarCollapsed, onToggleCollapse: handleToggleSidebarCollapse, isDarkMode: isDarkMode, onToggleDarkMode: handleToggleDarkMode, onOpenRoleSwitcher: () => setIsRoleSwitcherOpen(true), onLogout: onLogout, onNavigate: onNavigate }), _jsxs("div", { className: "flex-1 flex relative", children: [_jsx(Sidebar, { currentUser: currentUser, activeView: activeView, onNavigate: onNavigate, isOpen: isSidebarOpen, onCloseMobile: () => setIsSidebarOpen(false), unreadNotifsCount: unreadCount, isCollapsed: isSidebarCollapsed, onToggleCollapse: handleToggleSidebarCollapse }), _jsxs("main", { className: `flex-1 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} flex flex-col min-w-0 transition-all duration-300 ease-in-out`, children: [_jsxs("div", { className: "flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2", children: [_jsxs("div", { children: [_jsx(Breadcrumb, { items: breadcrumbItems, onNavigate: onNavigate }), _jsx("h1", { className: "text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1 brand-font", children: title }), subtitle && (_jsx("p", { className: "text-sm text-slate-500 dark:text-[#ADE8F4]/80 mt-1", children: subtitle }))] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [actions, _jsxs("button", { onClick: handleResetDemo, className: "px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-[#ADE8F4] hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/50 rounded-xl shadow-2xs hover:bg-slate-50 dark:hover:bg-[#03045E]/80 transition flex items-center gap-2 cursor-pointer", title: "Reset demo data to initial seeder values", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5 text-slate-400 dark:text-[#90E0EF]" }), _jsx("span", { children: "Reset Seed Data" })] })] })] }), _jsx("div", { className: "space-y-8", children: children })] }), _jsx("footer", { className: "main-footer mt-auto py-5 px-8 border-t border-slate-200 dark:border-[#0077B6]/30 bg-white dark:bg-[#023E8A] text-slate-500 dark:text-[#ADE8F4] text-xs", children: _jsxs("div", { className: "max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-slate-900 dark:text-white", children: "STORA" }), _jsx("span", { children: "\u2014 Store & Receiving Management System" }), _jsx("span", { className: "hidden md:inline text-slate-400 dark:text-[#90E0EF]/60", children: "\u2022 ISO 9001:2015 Compliant" })] }), _jsxs("div", { className: "flex items-center gap-4 text-xs", children: [_jsxs("span", { className: "flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium", children: [_jsx(Radio, { className: "w-3 h-3 animate-pulse" }), "WebSocket Active"] }), _jsx("span", { className: "text-slate-400 dark:text-[#90E0EF]/70", children: "Reverb Port 8080" })] })] }) })] })] }), _jsx(RoleSwitcherModal, { isOpen: isRoleSwitcherOpen, onClose: () => setIsRoleSwitcherOpen(false), currentUser: currentUser, onUserSwitched: (user) => {
                    refreshNotifCount();
                } })] }));
};
