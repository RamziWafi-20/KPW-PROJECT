import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, CheckSquare, PackageCheck, Send, Printer, FileDown, X, TrendingUp, } from 'lucide-react';
import { StatusBadge } from '../common/Badge.js';
import { storeService } from '../../services/storeService.js';
import { pdfService } from '../../services/pdfService.js';
import { DEPARTMENTS } from '../../data/seedData.js';
export const StoreRequestList = ({ currentUser, initialSearchQuery = '', onOpenCreateModal, onOpenApprovalModal, onOpenReceivingModal, onViewDetail, onToast, }) => {
    const [storeRequests, setStoreRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedDept, setSelectedDept] = useState('ALL');
    useEffect(() => {
        if (initialSearchQuery !== undefined) {
            setSearchQuery(initialSearchQuery);
        }
    }, [initialSearchQuery]);
    const loadData = () => {
        setStoreRequests(storeService.getStoreRequests());
    };
    useEffect(() => {
        loadData();
        const unsub = storeService.subscribe(loadData);
        return () => unsub();
    }, []);
    const role = currentUser.role;
    // Recommended search quick chips
    const searchSuggestions = ['SR-2026', 'Laptop', 'Kertas A4', 'APPROVED', 'SUBMITTED', 'IT', 'HRD', 'PT Sumber Berkat'];
    // Filter based on user permissions
    const filtered = storeRequests.filter((sr) => {
        // Dept Admin can only see their own department's SRs
        if (role === 'DEPARTMENT_ADMIN') {
            if (sr.departmentId !== currentUser.departmentId && sr.requesterUserId !== currentUser.id) {
                return false;
            }
        }
        // Status Filter
        if (selectedStatus !== 'ALL' && sr.status !== selectedStatus) {
            return false;
        }
        // Department Filter
        if (selectedDept !== 'ALL' && sr.departmentName !== selectedDept) {
            return false;
        }
        // Search Query
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            const matchSr = sr.srNumber.toLowerCase().includes(q);
            const matchPurpose = sr.purpose?.toLowerCase().includes(q);
            const matchReq = sr.requesterName.toLowerCase().includes(q);
            const matchDept = sr.departmentName.toLowerCase().includes(q);
            const matchPo = sr.poNumber?.toLowerCase().includes(q);
            const matchStatus = sr.status.toLowerCase().includes(q);
            const matchItem = sr.items.some((it) => it.itemName.toLowerCase().includes(q) || it.itemCode.toLowerCase().includes(q));
            return matchSr || matchPurpose || matchReq || matchDept || matchPo || matchStatus || matchItem;
        }
        return true;
    });
    const handleSubmitDraft = (srId) => {
        const res = storeService.submitDraftStoreRequest(srId);
        if (res.success) {
            onToast(res.message);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white dark:bg-[#023E8A] p-6 rounded-3xl border border-slate-200 dark:border-[#0077B6]/40 shadow-xs flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-[#48CAE4]", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsx("input", { type: "text", placeholder: "Cari berdasarkan No. SR, keperluan, pemohon, PO, atau nama barang...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-11 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-[#03045E]/80 border border-slate-200 dark:border-[#0077B6]/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#90E0EF]/60 focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8] focus:outline-none transition" }), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(''), className: "absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer", title: "Hapus pencarian", children: _jsx(X, { className: "w-4 h-4" }) }))] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsxs("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-[#03045E]/80 border border-slate-200 dark:border-[#0077B6]/50 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#00B4D8]/30 focus:outline-none", children: [_jsx("option", { value: "ALL", children: "Semua Status" }), _jsx("option", { value: "DRAFT", children: "Draft" }), _jsx("option", { value: "SUBMITTED", children: "Submitted" }), _jsx("option", { value: "UNDER_REVIEW", children: "Under Review" }), _jsx("option", { value: "APPROVED", children: "Approved" }), _jsx("option", { value: "REJECTED", children: "Rejected" }), _jsx("option", { value: "PROCESSING", children: "Processing" }), _jsx("option", { value: "COMPLETED", children: "Completed" })] }), role !== 'DEPARTMENT_ADMIN' && (_jsxs("select", { value: selectedDept, onChange: (e) => setSelectedDept(e.target.value), className: "px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-[#03045E]/80 border border-slate-200 dark:border-[#0077B6]/50 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#00B4D8]/30 focus:outline-none", children: [_jsx("option", { value: "ALL", children: "Semua Departemen" }), DEPARTMENTS.map((d) => (_jsx("option", { value: d.name, children: d.name }, d.id)))] })), currentUser.role === 'DEPARTMENT_ADMIN' && (_jsxs("button", { onClick: onOpenCreateModal, className: "px-4 py-2.5 text-xs font-semibold text-white bg-[#0077B6] hover:bg-[#0096C7] rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Buat SR Baru" })] }))] })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-[#0077B6]/30 text-xs", children: [_jsxs("span", { className: "text-[11px] font-bold text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1", children: [_jsx(TrendingUp, { className: "w-3 h-3 text-[#0077B6] dark:text-[#48CAE4]" }), "Rekomendasi Keyword:"] }), searchSuggestions.map((kw, i) => (_jsx("button", { onClick: () => setSearchQuery(kw), className: `px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${searchQuery.toLowerCase() === kw.toLowerCase()
                                    ? 'bg-[#0077B6] text-white border-[#0077B6]'
                                    : 'bg-slate-100 dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/50 text-slate-600 dark:text-[#ADE8F4] border-slate-200 dark:border-[#0077B6]/40'}`, children: kw }, i))), searchQuery && (_jsx("button", { onClick: () => setSearchQuery(''), className: "text-[11px] font-semibold text-rose-500 hover:text-rose-600 ml-auto cursor-pointer", children: "Reset Filter" }))] })] }), _jsxs("div", { className: "bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[11px]", children: [_jsx("th", { className: "py-4 px-6", children: "SR Number" }), _jsx("th", { className: "py-4 px-6", children: "Department" }), _jsx("th", { className: "py-4 px-6", children: "Requester" }), _jsx("th", { className: "py-4 px-6", children: "Purpose / Remarks" }), _jsx("th", { className: "py-4 px-6", children: "Required Date" }), _jsx("th", { className: "py-4 px-6 text-center", children: "Items" }), _jsx("th", { className: "py-4 px-6 text-center", children: "Status" }), _jsx("th", { className: "py-4 px-6 text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100 dark:divide-slate-800/80", children: filtered.length === 0 ? (_jsx("tr", { children: _jsxs("td", { colSpan: 8, className: "py-14 text-center text-slate-400", children: [_jsx("p", { className: "text-sm font-semibold", children: "No Store Requests match your criteria." }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Try adjusting search filters." })] }) })) : (filtered.map((sr) => (_jsxs("tr", { className: "hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition", children: [_jsx("td", { className: "py-4 px-6 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap", children: sr.srNumber }), _jsx("td", { className: "py-4 px-6 font-medium text-slate-800 dark:text-white whitespace-nowrap", children: sr.departmentName }), _jsx("td", { className: "py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap", children: sr.requesterName }), _jsx("td", { className: "py-4 px-6 max-w-xs truncate text-slate-700 dark:text-slate-300", children: sr.purpose }), _jsx("td", { className: "py-4 px-6 text-slate-400 whitespace-nowrap", children: sr.requiredDate }), _jsx("td", { className: "py-4 px-6 text-center font-bold text-slate-700 dark:text-slate-300", children: sr.items.length }), _jsx("td", { className: "py-4 px-6 text-center whitespace-nowrap", children: _jsx(StatusBadge, { status: sr.status }) }), _jsx("td", { className: "py-4 px-6 text-right whitespace-nowrap", children: _jsxs("div", { className: "flex items-center justify-end gap-1.5", children: [_jsx("button", { onClick: () => onViewDetail(sr), className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer", title: "View Store Request Details", children: _jsx(Eye, { className: "w-3.5 h-3.5" }) }), role === 'RECEIVING_SUPERVISOR' &&
                                                            (sr.status === 'UNDER_REVIEW' || sr.status === 'SUBMITTED') && (_jsxs("button", { onClick: () => onOpenApprovalModal(sr), className: "px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer", title: "Review Requisition", children: [_jsx(CheckSquare, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Decide" })] })), (role === 'RECEIVING_OFFICER' || role === 'RECEIVING_SUPERVISOR') &&
                                                            sr.status === 'APPROVED' && (_jsxs("button", { onClick: () => onOpenReceivingModal(sr), className: "px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer", title: "Receive Goods", children: [_jsx(PackageCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Receive" })] })), role === 'DEPARTMENT_ADMIN' && sr.status === 'DRAFT' && (_jsxs("button", { onClick: () => handleSubmitDraft(sr.id), className: "px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer", title: "Submit Requisition to Supervisor", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Submit" })] })), _jsx("button", { onClick: () => pdfService.exportStoreRequestPDF(sr), className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer", title: "Export A4 PDF", children: _jsx(FileDown, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => {
                                                                onViewDetail(sr);
                                                                setTimeout(() => pdfService.printCurrentView(), 300);
                                                            }, className: "p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer", title: "Print Document", children: _jsx(Printer, { className: "w-3.5 h-3.5" }) })] }) })] }, sr.id)))) })] }) }), _jsxs("div", { className: "p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400", children: [_jsxs("span", { children: ["Showing ", filtered.length, " of ", storeRequests.length, " requisitions"] }), _jsx("span", { className: "text-[11px] font-medium", children: "ISO 9001:2015 Compliant" })] })] })] }));
};
