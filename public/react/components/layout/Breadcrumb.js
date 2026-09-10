import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
export const Breadcrumb = ({ items, onNavigate }) => {
    return (_jsxs("nav", { className: "flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400", children: [_jsxs("button", { onClick: () => onNavigate('dashboard'), className: "flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer", children: [_jsx(Home, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Home" })] }), items.map((item, idx) => (_jsxs(React.Fragment, { children: [_jsx(ChevronRight, { className: "w-3 h-3 text-slate-300 dark:text-slate-600" }), item.view ? (_jsx("button", { onClick: () => onNavigate(item.view), className: "hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium cursor-pointer", children: item.label })) : (_jsx("span", { className: "font-semibold text-slate-800 dark:text-slate-200", children: item.label }))] }, idx)))] }));
};
