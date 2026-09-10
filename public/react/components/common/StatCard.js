import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend, onClick, }) => {
    // Highlight card (Indigo filled card like in the design sample)
    if (color === 'highlight') {
        return (_jsxs("div", { onClick: onClick, className: `bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 dark:shadow-none text-white flex flex-col justify-between transition-all duration-200 ${onClick ? 'cursor-pointer hover:bg-indigo-700 hover:scale-[1.01]' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-indigo-100/90 text-sm font-medium mb-1", children: title }), _jsx("div", { className: "text-2xl sm:text-3xl font-bold", children: value })] }), _jsx("div", { className: "w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white", children: _jsx(Icon, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mt-4", children: [subtitle && _jsx("div", { className: "text-xs text-indigo-100", children: subtitle }), trend && (_jsx("div", { className: "w-full h-1.5 bg-white/25 rounded-full mt-2 overflow-hidden", children: _jsx("div", { className: "w-3/4 h-full bg-white rounded-full" }) }))] })] }));
    }
    // Standard Sleek Interface Card
    const getTrendColor = () => {
        if (color === 'danger' || color === 'warning')
            return 'text-rose-500';
        if (color === 'success')
            return 'text-emerald-500';
        return 'text-slate-400';
    };
    const getIconColor = () => {
        switch (color) {
            case 'success':
                return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40';
            case 'danger':
                return 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/40';
            case 'warning':
                return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/40';
            case 'info':
                return 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-100 dark:border-sky-900/40';
            default:
                return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40';
        }
    };
    return (_jsxs("div", { onClick: onClick, className: `bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:scale-[1.01]' : ''}`, children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "text-slate-400 dark:text-slate-500 text-sm font-medium mb-1", children: title }), _jsx("div", { className: "text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight", children: value })] }), _jsx("div", { className: `w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${getIconColor()}`, children: _jsx(Icon, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [trend && (_jsx("span", { className: `text-xs font-semibold ${getTrendColor()}`, children: trend })), subtitle && (_jsx("span", { className: "text-xs text-slate-400 dark:text-slate-500 font-medium", children: subtitle }))] })] }));
};
