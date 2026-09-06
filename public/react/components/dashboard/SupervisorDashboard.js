import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Clock, CheckCircle2, AlertTriangle, ArrowRight, Eye, CheckSquare, BarChart3, TrendingUp, } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { StatCard } from '../common/StatCard.js';
import { StatusBadge } from '../common/Badge.js';
import { storeService } from '../../services/storeService.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);
export const SupervisorDashboard = ({ onNavigate, onOpenApprovalModal, }) => {
    const [storeRequests, setStoreRequests] = useState([]);
    const [items, setItems] = useState([]);
    const loadData = () => {
        setStoreRequests(storeService.getStoreRequests());
        setItems(storeService.getItems());
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, []);
    const totalSR = storeRequests.length;
    const pendingReviewSR = storeRequests.filter((s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED');
    const approvedSR = storeRequests.filter((s) => s.status === 'APPROVED');
    const rejectedSR = storeRequests.filter((s) => s.status === 'REJECTED');
    const completedSR = storeRequests.filter((s) => s.status === 'COMPLETED');
    const lowStockItems = items.filter((i) => i.status === 'LOW_STOCK');
    const outOfStockItems = items.filter((i) => i.status === 'OUT_OF_STOCK');
    // Chart 1: Status Distribution
    const doughnutData = {
        labels: ['Under Review', 'Approved', 'Completed', 'Rejected', 'Draft'],
        datasets: [
            {
                data: [
                    pendingReviewSR.length,
                    approvedSR.length,
                    completedSR.length,
                    rejectedSR.length,
                    storeRequests.filter((s) => s.status === 'DRAFT').length,
                ],
                backgroundColor: [
                    '#F59E0B', // Amber
                    '#10B981', // Emerald
                    '#4F46E5', // Indigo 600
                    '#F43F5E', // Rose
                    '#94A3B8', // Slate
                ],
                borderWidth: 2,
                borderColor: '#ffffff',
            },
        ],
    };
    // Chart 2: Department Requests Bar
    const departmentCounts = {};
    storeRequests.forEach((sr) => {
        departmentCounts[sr.departmentName] = (departmentCounts[sr.departmentName] || 0) + 1;
    });
    const barData = {
        labels: Object.keys(departmentCounts).length > 0 ? Object.keys(departmentCounts) : ['Human Resources', 'F&B', 'Finance', 'IT'],
        datasets: [
            {
                label: 'Requisitions by Department',
                data: Object.keys(departmentCounts).length > 0 ? Object.values(departmentCounts) : [2, 1, 1, 1],
                backgroundColor: '#6366F1',
                borderRadius: 8,
            },
        ],
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    font: { family: 'Plus Jakarta Sans', size: 11 },
                },
            },
        },
        animation: {
            duration: 800,
        },
    };
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { title: "Total Requisitions", value: totalSR, icon: FileSpreadsheet, color: "primary", trend: "\u2191 14% this month", subtitle: "All active requests", onClick: () => onNavigate('store-requests') }), _jsx(StatCard, { title: "Pending Approvals", value: pendingReviewSR.length, icon: Clock, color: "warning", trend: pendingReviewSR.length > 0 ? `${pendingReviewSR.length} action pending` : 'All cleared', onClick: () => onNavigate('approvals') }), _jsx(StatCard, { title: "Approved & Receiving", value: approvedSR.length + completedSR.length, icon: CheckCircle2, color: "success", trend: "\u2191 8% velocity", subtitle: `${approvedSR.length} ready in warehouse`, onClick: () => onNavigate('store-requests') }), _jsx(StatCard, { title: "Critical Stock Alerts", value: lowStockItems.length + outOfStockItems.length, icon: AlertTriangle, color: outOfStockItems.length > 0 ? 'danger' : 'highlight', trend: outOfStockItems.length > 0 ? `${outOfStockItems.length} out of stock` : 'Healthy stock', subtitle: `${lowStockItems.length} near threshold`, onClick: () => onNavigate('inventory') })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs", children: [_jsxs("div", { className: "text-left p-2 border-r border-slate-100 dark:border-slate-800", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider", children: "Catalog Items" }), _jsx("p", { className: "text-2xl font-bold text-slate-900 dark:text-white mt-1", children: items.length })] }), _jsxs("div", { className: "text-left p-2 border-r border-slate-100 dark:border-slate-800", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider", children: "Rejected Requests" }), _jsx("p", { className: "text-2xl font-bold text-rose-500 mt-1", children: rejectedSR.length })] }), _jsxs("div", { className: "text-left p-2 border-r border-slate-100 dark:border-slate-800", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider", children: "Completed Receiving" }), _jsx("p", { className: "text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1", children: completedSR.length })] }), _jsxs("div", { className: "text-left p-2", children: [_jsx("p", { className: "text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider", children: "Stock Availability" }), _jsx("p", { className: "text-2xl font-bold text-emerald-500 mt-1", children: items.length > 0 ? `${Math.round((items.filter((i) => i.status === 'AVAILABLE').length / items.length) * 100)}%` : '100%' })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(BarChart3, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), _jsx("h3", { className: "font-bold text-base text-slate-900 dark:text-white", children: "Requisitions by Department" })] }), _jsx("span", { className: "px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-full uppercase", children: "Q3 Roadmap" })] }), _jsx("div", { className: "h-64 w-full", children: _jsx(Bar, { data: barData, options: chartOptions }) })] }), _jsxs("div", { className: "lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), _jsx("h3", { className: "font-bold text-base text-slate-900 dark:text-white", children: "Requisition Status" })] }), _jsx("span", { className: "px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase", children: "Live" })] }), _jsx("div", { className: "h-64 w-full", children: _jsx(Doughnut, { data: doughnutData, options: chartOptions }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-8", children: [_jsxs("div", { className: "lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckSquare, { className: "w-5 h-5 text-indigo-600 dark:text-indigo-400" }), _jsx("h3", { className: "font-bold text-base text-slate-900 dark:text-white", children: "Approvals Queue" }), pendingReviewSR.length > 0 && (_jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 uppercase", children: [pendingReviewSR.length, " Action Needed"] }))] }), _jsxs("button", { onClick: () => onNavigate('approvals'), className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1.5", children: [_jsx("span", { children: "View All" }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] }), _jsx("div", { className: "divide-y divide-slate-100 dark:divide-slate-800/80 flex-1 overflow-y-auto max-h-96", children: pendingReviewSR.length === 0 ? (_jsxs("div", { className: "py-12 text-center text-slate-400", children: [_jsx(CheckCircle2, { className: "w-8 h-8 mx-auto text-emerald-500 mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "All Store Requests have been reviewed!" }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "New submissions from department admins will appear in real-time." })] })) : (pendingReviewSR.map((sr) => (_jsxs("div", { className: "p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-indigo-500" }), _jsx("span", { className: "font-mono font-bold text-xs text-slate-900 dark:text-white", children: sr.srNumber }), _jsx("span", { className: "text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", children: sr.departmentName }), _jsx(StatusBadge, { status: sr.status })] }), _jsx("p", { className: "text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-1", children: sr.purpose }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Requested by ", _jsx("strong", { className: "text-slate-600 dark:text-slate-300 font-medium", children: sr.requesterName }), " \u2022 ", sr.items.length, " item(s) \u2022 Needed: ", sr.requiredDate] })] }), _jsxs("div", { className: "flex items-center gap-2.5 shrink-0", children: [_jsxs("button", { onClick: () => onOpenApprovalModal(sr), className: "px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-lg shadow-indigo-100 dark:shadow-none transition flex items-center gap-1.5 cursor-pointer", children: [_jsx(CheckSquare, { className: "w-3.5 h-3.5" }), "Review & Decide"] }), _jsx("button", { onClick: () => onNavigate('store-requests', sr.id), className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer", title: "View Details", children: _jsx(Eye, { className: "w-4 h-4" }) })] })] }, sr.id)))) })] }), _jsxs("div", { className: "lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-rose-500" }), _jsx("h3", { className: "font-bold text-base text-slate-900 dark:text-white", children: "Critical Stock Alerts" })] }), _jsx("button", { onClick: () => onNavigate('inventory'), className: "text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700", children: "Inventory Master \u2192" })] }), _jsx("div", { className: "divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto max-h-96", children: lowStockItems.length === 0 && outOfStockItems.length === 0 ? (_jsxs("div", { className: "py-12 text-center text-slate-400", children: [_jsx(CheckCircle2, { className: "w-8 h-8 mx-auto text-emerald-500 mb-2" }), _jsx("p", { className: "text-sm font-medium", children: "All items are sufficiently stocked." })] })) : ([...outOfStockItems, ...lowStockItems].map((item) => (_jsxs("div", { className: "p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition", children: [_jsxs("div", { className: "min-w-0 space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-mono text-slate-400", children: item.itemCode }), _jsx(StatusBadge, { status: item.status })] }), _jsx("p", { className: "text-xs font-bold text-slate-900 dark:text-white truncate", children: item.itemName }), _jsxs("p", { className: "text-[11px] text-slate-400", children: ["Category: ", item.categoryName] })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsxs("p", { className: `text-sm font-bold font-mono ${item.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'}`, children: [item.currentStock, " ", item.unit] }), _jsxs("p", { className: "text-[11px] text-slate-400", children: ["Min: ", item.minimumStock] })] })] }, item.id)))) })] })] })] }));
};
