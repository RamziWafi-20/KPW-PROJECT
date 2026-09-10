import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, FileSpreadsheet, Boxes, Tag, Clock, ArrowRight, Sparkles, TrendingUp, History, ChevronRight, BarChart3, ShieldAlert, CornerDownLeft, } from 'lucide-react';
import { storeService } from '../../services/storeService.js';
import { StatusBadge } from '../common/Badge.js';
const RECENT_SEARCHES_KEY = 'stora_recent_searches_v1';
const MAX_RECENTS = 6;
// Recommended initial search keywords
const POPULAR_KEYWORDS = [
    { label: 'Dell XPS 15', category: 'Item', type: 'item' },
    { label: 'Kertas HVS A4', category: 'Item', type: 'item' },
    { label: 'SR-2026-001', category: 'Requisition', type: 'sr' },
    { label: 'Low Stock Items', category: 'Status', type: 'status' },
    { label: 'APPROVED', category: 'Status', type: 'status' },
    { label: 'IT Department', category: 'Department', type: 'dept' },
    { label: 'Printing & Stationery', category: 'Category', type: 'cat' },
    { label: 'Coffee Beans Robusta', category: 'Item', type: 'item' },
];
export const GlobalSearch = ({ currentUser, onNavigate, onOpenDetailModal, onOpenCreateModal, onOpenApprovalModal, onOpenReceivingModal, placeholder = 'Cari nomor SR, barang, kategori, departemen, atau status...', isMobile = false, }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
            return saved ? JSON.parse(saved) : ['SR-2026', 'Laptop', 'A4 Paper', 'Low Stock'];
        }
        catch {
            return ['SR-2026', 'Laptop', 'A4 Paper', 'Low Stock'];
        }
    });
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchContainerRef = useRef(null);
    const inputRef = useRef(null);
    // Data sources
    const [storeRequests, setStoreRequests] = useState([]);
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const refreshData = () => {
        setStoreRequests(storeService.getStoreRequests());
        setItems(storeService.getItems());
        setCategories(storeService.getCategories());
    };
    useEffect(() => {
        refreshData();
        const unsub = storeService.subscribe(refreshData);
        return () => unsub();
    }, []);
    // Global Keyboard Shortcut: Ctrl+K or Cmd+K or "/"
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger if user is already typing in an input or textarea (unless ctrl+k)
            const target = e.target;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            else if (e.key === '/' && !isInput) {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);
    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Save recent search
    const saveRecentSearch = (term) => {
        const trimmed = term.trim();
        if (!trimmed)
            return;
        const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENTS);
        setRecentSearches(updated);
        try {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        }
        catch {
            // ignore
        }
    };
    const removeRecentSearch = (e, term) => {
        e.stopPropagation();
        const updated = recentSearches.filter((s) => s !== term);
        setRecentSearches(updated);
        try {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        }
        catch {
            // ignore
        }
    };
    const clearAllRecent = (e) => {
        e.stopPropagation();
        setRecentSearches([]);
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        }
        catch {
            // ignore
        }
    };
    // 1. Compute Keyword Recommendations based on user query
    const keywordRecommendations = useMemo(() => {
        const q = query.trim().toLowerCase();
        const suggestions = [];
        const seen = new Set();
        const addSuggestion = (text, category, type) => {
            const lower = text.toLowerCase();
            if (!seen.has(lower) && lower !== q) {
                seen.add(lower);
                suggestions.push({ text, category, type });
            }
        };
        if (!q) {
            // When empty query, return popular keywords
            POPULAR_KEYWORDS.forEach((k) => {
                suggestions.push({
                    text: k.label,
                    category: k.category,
                    type: k.type,
                });
            });
            return suggestions.slice(0, 8);
        }
        // A. Match Items Name & Code
        items.forEach((item) => {
            if (item.itemName.toLowerCase().includes(q)) {
                addSuggestion(item.itemName, item.categoryName || 'Item', 'item');
            }
            if (item.itemCode.toLowerCase().includes(q)) {
                addSuggestion(item.itemCode, 'SKU Code', 'item');
            }
        });
        // B. Match Store Requests
        storeRequests.forEach((sr) => {
            if (sr.srNumber.toLowerCase().includes(q)) {
                addSuggestion(sr.srNumber, 'Requisition No', 'sr');
            }
            if (sr.poNumber && sr.poNumber.toLowerCase().includes(q)) {
                addSuggestion(sr.poNumber, 'PO Number', 'sr');
            }
            if (sr.departmentName.toLowerCase().includes(q)) {
                addSuggestion(sr.departmentName, 'Department', 'dept');
            }
            if (sr.requesterName.toLowerCase().includes(q)) {
                addSuggestion(sr.requesterName, 'Requester', 'general');
            }
        });
        // C. Match Categories
        categories.forEach((cat) => {
            if (cat.name.toLowerCase().includes(q) || cat.code.toLowerCase().includes(q)) {
                addSuggestion(cat.name, 'Category', 'cat');
            }
        });
        // D. Match Status Keywords
        const statuses = ['APPROVED', 'SUBMITTED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'LOW STOCK', 'AVAILABLE'];
        statuses.forEach((st) => {
            if (st.toLowerCase().includes(q)) {
                addSuggestion(st, 'Status Filter', 'status');
            }
        });
        return suggestions.slice(0, 7);
    }, [query, items, storeRequests, categories]);
    // 2. Compute Filtered Search Results
    const searchResults = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return {
                storeRequests: [],
                items: [],
                categories: [],
                total: 0,
            };
        }
        // A. Store Requests
        const matchedSRs = storeRequests
            .filter((sr) => {
            const matchSrNo = sr.srNumber.toLowerCase().includes(q);
            const matchPo = sr.poNumber?.toLowerCase().includes(q);
            const matchDept = sr.departmentName.toLowerCase().includes(q);
            const matchReq = sr.requesterName.toLowerCase().includes(q);
            const matchStatus = sr.status.toLowerCase().includes(q);
            const matchPurpose = sr.purpose?.toLowerCase().includes(q);
            const matchItem = sr.items.some((it) => it.itemName.toLowerCase().includes(q) || it.itemCode.toLowerCase().includes(q));
            return matchSrNo || matchPo || matchDept || matchReq || matchStatus || matchPurpose || matchItem;
        })
            .slice(0, 5);
        // B. Items & Inventory
        const matchedItems = items
            .filter((item) => {
            const matchName = item.itemName.toLowerCase().includes(q);
            const matchCode = item.itemCode.toLowerCase().includes(q);
            const matchCat = item.categoryName?.toLowerCase().includes(q);
            const matchLoc = item.location?.toLowerCase().includes(q);
            const matchStatus = item.status.toLowerCase().replace('_', ' ').includes(q);
            return matchName || matchCode || matchCat || matchLoc || matchStatus;
        })
            .slice(0, 5);
        // C. Categories
        const matchedCats = categories
            .filter((cat) => {
            return cat.name.toLowerCase().includes(q) || cat.code.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q);
        })
            .slice(0, 3);
        return {
            storeRequests: matchedSRs,
            items: matchedItems,
            categories: matchedCats,
            total: matchedSRs.length + matchedItems.length + matchedCats.length,
        };
    }, [query, storeRequests, items, categories]);
    // Flattened actionable list for keyboard navigation
    const flatActionableItems = useMemo(() => {
        const list = [];
        // Suggestions first if present
        keywordRecommendations.forEach((k) => {
            list.push({ type: 'SUGGESTION', data: k.text, label: k.text });
        });
        // Store requests
        searchResults.storeRequests.forEach((sr) => {
            list.push({ type: 'SR', data: sr, label: sr.srNumber });
        });
        // Items
        searchResults.items.forEach((it) => {
            list.push({ type: 'ITEM', data: it, label: it.itemName });
        });
        // Categories
        searchResults.categories.forEach((cat) => {
            list.push({ type: 'CATEGORY', data: cat, label: cat.name });
        });
        return list;
    }, [keywordRecommendations, searchResults]);
    // Handle Search Submission / Selection
    const handleSelectKeyword = (keyword) => {
        setQuery(keyword);
        saveRecentSearch(keyword);
        // Determine the most appropriate view
        const qLower = keyword.toLowerCase();
        const isSR = storeRequests.some((sr) => sr.srNumber.toLowerCase() === qLower);
        if (isSR) {
            const foundSR = storeRequests.find((sr) => sr.srNumber.toLowerCase() === qLower);
            if (foundSR && onOpenDetailModal) {
                onOpenDetailModal(foundSR);
            }
            onNavigate('store-requests', keyword);
        }
        else if (items.some((it) => it.itemName.toLowerCase() === qLower || it.itemCode.toLowerCase() === qLower)) {
            onNavigate('inventory', keyword);
        }
        else {
            onNavigate('store-requests', keyword);
        }
        setIsOpen(false);
    };
    const handleSelectSR = (sr) => {
        saveRecentSearch(sr.srNumber);
        if (onOpenDetailModal) {
            onOpenDetailModal(sr);
        }
        onNavigate('store-requests', sr.srNumber);
        setIsOpen(false);
    };
    const handleSelectItem = (item) => {
        saveRecentSearch(item.itemName);
        onNavigate('inventory', item.itemName);
        setIsOpen(false);
    };
    const handleSelectCategory = (cat) => {
        saveRecentSearch(cat.name);
        onNavigate('inventory', cat.name);
        setIsOpen(false);
    };
    const handleFullSearch = () => {
        if (!query.trim())
            return;
        saveRecentSearch(query);
        onNavigate('store-requests', query);
        setIsOpen(false);
    };
    // Keyboard navigation handler
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < flatActionableItems.length - 1 ? prev + 1 : 0));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatActionableItems.length - 1));
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < flatActionableItems.length) {
                const item = flatActionableItems[selectedIndex];
                if (item.type === 'SUGGESTION') {
                    handleSelectKeyword(item.data);
                }
                else if (item.type === 'SR') {
                    handleSelectSR(item.data);
                }
                else if (item.type === 'ITEM') {
                    handleSelectItem(item.data);
                }
                else if (item.type === 'CATEGORY') {
                    handleSelectCategory(item.data);
                }
            }
            else {
                handleFullSearch();
            }
        }
        else if (e.key === 'Tab') {
            if (keywordRecommendations.length > 0 && query.trim()) {
                e.preventDefault();
                setQuery(keywordRecommendations[0].text);
            }
        }
        else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };
    // Highlight matched substring
    const highlightMatch = (text, matchText) => {
        if (!matchText || !text)
            return text;
        const parts = text.split(new RegExp(`(${matchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
        return (_jsx("span", { children: parts.map((part, i) => part.toLowerCase() === matchText.toLowerCase() ? (_jsx("mark", { className: "bg-[#00B4D8]/30 dark:bg-[#00B4D8]/40 text-[#0077B6] dark:text-[#ADE8F4] font-bold px-0.5 rounded-xs", children: part }, i)) : (part)) }));
    };
    return (_jsxs("div", { ref: searchContainerRef, className: `relative w-full ${isMobile ? 'block' : 'max-w-md'}`, children: [_jsxs("div", { className: "relative flex items-center", children: [_jsx("div", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 dark:text-[#48CAE4]", children: _jsx(Search, { className: "w-4 h-4" }) }), _jsx("input", { ref: inputRef, type: "text", id: "global-search-input", value: query, onChange: (e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(-1);
                            if (!isOpen)
                                setIsOpen(true);
                        }, onFocus: () => setIsOpen(true), onKeyDown: handleKeyDown, placeholder: placeholder, className: "w-full pl-10 pr-20 py-2.5 bg-slate-50 dark:bg-[#03045E]/70 border border-slate-200 dark:border-[#0077B6]/50 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-[#90E0EF]/60 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/40 focus:border-[#00B4D8] transition-all shadow-2xs", autoComplete: "off" }), _jsx("div", { className: "absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5", children: query ? (_jsx("button", { onClick: () => {
                                setQuery('');
                                setSelectedIndex(-1);
                                inputRef.current?.focus();
                            }, className: "p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer", title: "Clear search", children: _jsx(X, { className: "w-3.5 h-3.5" }) })) : (_jsx("div", { className: "hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-[#023E8A] text-[10px] font-mono text-slate-500 dark:text-[#ADE8F4]/80 border border-slate-300 dark:border-[#0077B6]/40 pointer-events-none", children: _jsx("span", { children: "\u2318K" }) })) })] }), isOpen && (_jsxs("div", { id: "global-search-dropdown", className: "absolute left-0 top-full mt-2 w-full min-w-[320px] sm:min-w-[480px] max-w-[90vw] sm:max-w-2xl bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/60 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md", children: [_jsxs("div", { className: "px-4 py-2.5 bg-slate-50 dark:bg-[#03045E]/90 border-b border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between text-xs", children: [_jsxs("div", { className: "flex items-center gap-2 text-slate-500 dark:text-[#ADE8F4] font-medium", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4]" }), _jsx("span", { children: query ? `Pencarian STORA: "${query}"` : 'Pusat Pencarian & Rekomendasi' })] }), query && searchResults.total > 0 && (_jsxs("span", { className: "text-[11px] font-semibold text-[#0077B6] dark:text-[#ADE8F4] bg-[#CAF0F8] dark:bg-[#03045E] px-2 py-0.5 rounded-full", children: [searchResults.total, " Hasil Ditemukan"] }))] }), _jsxs("div", { className: "max-h-[440px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#0077B6]/20", children: [_jsxs("div", { className: "p-3.5 bg-slate-50/50 dark:bg-[#03045E]/40", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1.5", children: [_jsx(TrendingUp, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4]" }), query ? 'Rekomendasi Kata Kunci (Keywords)' : 'Kata Kunci Populer'] }), query && (_jsx("span", { className: "text-[10px] text-slate-400 dark:text-[#90E0EF]/60", children: "Tekan [Tab] untuk melengkapi" }))] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: keywordRecommendations.map((rec, idx) => (_jsxs("button", { onClick: () => handleSelectKeyword(rec.text), className: "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/60 border border-slate-200 dark:border-[#0077B6]/40 text-xs text-slate-700 dark:text-slate-200 font-medium transition cursor-pointer group shadow-2xs", children: [_jsx(Search, { className: "w-3 h-3 text-slate-400 group-hover:text-[#0077B6] dark:group-hover:text-[#ADE8F4]" }), _jsx("span", { children: highlightMatch(rec.text, query) }), _jsx("span", { className: "text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 dark:bg-[#023E8A] text-slate-400 dark:text-[#90E0EF] font-mono", children: rec.category })] }, idx))) })] }), !query && recentSearches.length > 0 && (_jsxs("div", { className: "p-3.5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1.5", children: [_jsx(History, { className: "w-3.5 h-3.5 text-slate-400 dark:text-[#ADE8F4]" }), "Pencarian Terakhir"] }), _jsx("button", { onClick: clearAllRecent, className: "text-[10px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer", children: "Hapus Riwayat" })] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: recentSearches.map((term, i) => (_jsxs("div", { onClick: () => handleSelectKeyword(term), className: "group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-100 dark:bg-[#03045E]/80 hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 text-xs text-slate-700 dark:text-slate-200 transition cursor-pointer border border-transparent hover:border-[#90E0EF]", children: [_jsx(Clock, { className: "w-3 h-3 text-slate-400" }), _jsx("span", { children: term }), _jsx("button", { onClick: (e) => removeRecentSearch(e, term), className: "p-0.5 rounded text-slate-400 hover:text-rose-500 dark:hover:text-rose-300", title: "Hapus", children: _jsx(X, { className: "w-3 h-3" }) })] }, i))) })] })), query && searchResults.storeRequests.length > 0 && (_jsxs("div", { className: "p-3.5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1.5", children: [_jsx(FileSpreadsheet, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4]" }), "Permintaan Barang (Store Requests)"] }), _jsxs("span", { className: "text-[10px] text-[#0077B6] dark:text-[#ADE8F4]", children: [searchResults.storeRequests.length, " ditemukan"] })] }), _jsx("div", { className: "space-y-1.5", children: searchResults.storeRequests.map((sr) => (_jsxs("div", { onClick: () => handleSelectSR(sr), className: "p-2.5 rounded-xl hover:bg-[#CAF0F8]/40 dark:hover:bg-[#03045E]/70 border border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between gap-3 transition cursor-pointer group", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-[#CAF0F8] dark:bg-[#03045E] flex items-center justify-center text-[#0077B6] dark:text-[#48CAE4] shrink-0 font-mono text-xs font-bold", children: "SR" }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-xs text-slate-900 dark:text-white font-mono group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4]", children: highlightMatch(sr.srNumber, query) }), _jsx(StatusBadge, { status: sr.status })] }), _jsxs("p", { className: "text-[11px] text-slate-500 dark:text-[#ADE8F4]/80 truncate mt-0.5", children: [highlightMatch(sr.departmentName, query), " \u2022 ", sr.requesterName, " \u2022 ", sr.items.length, " item (", sr.items.map((i) => i.itemName).slice(0, 2).join(', '), ")"] })] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400 group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4] group-hover:translate-x-0.5 transition shrink-0" })] }, sr.id))) })] })), query && searchResults.items.length > 0 && (_jsxs("div", { className: "p-3.5", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1.5", children: [_jsx(Boxes, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4]" }), "Katalog Barang & Inventaris"] }), _jsxs("span", { className: "text-[10px] text-[#0077B6] dark:text-[#ADE8F4]", children: [searchResults.items.length, " ditemukan"] })] }), _jsx("div", { className: "space-y-1.5", children: searchResults.items.map((item) => (_jsxs("div", { onClick: () => handleSelectItem(item), className: "p-2.5 rounded-xl hover:bg-[#CAF0F8]/40 dark:hover:bg-[#03045E]/70 border border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between gap-3 transition cursor-pointer group", children: [_jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0", children: _jsx(Boxes, { className: "w-4 h-4" }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4] truncate", children: highlightMatch(item.itemName, query) }), _jsx("span", { className: "text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#03045E] text-slate-500 dark:text-[#ADE8F4]", children: highlightMatch(item.itemCode, query) })] }), _jsxs("div", { className: "flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-[#ADE8F4]/80", children: [_jsx("span", { children: item.categoryName }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: item.currentStock <= item.minimumStock ? 'text-amber-500 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-semibold', children: ["Stok: ", item.currentStock, " ", item.unit] }), item.location && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsx("span", { children: item.location })] }))] })] })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-slate-400 group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4] group-hover:translate-x-0.5 transition shrink-0" })] }, item.id))) })] })), query && searchResults.categories.length > 0 && (_jsxs("div", { className: "p-3.5", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsxs("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 flex items-center gap-1.5", children: [_jsx(Tag, { className: "w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4]" }), "Kategori & Klasifikasi"] }) }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: searchResults.categories.map((cat) => (_jsxs("div", { onClick: () => handleSelectCategory(cat), className: "p-2 rounded-xl hover:bg-[#CAF0F8]/40 dark:hover:bg-[#03045E]/70 border border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between transition cursor-pointer group", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#0077B6] dark:group-hover:text-[#48CAE4]", children: highlightMatch(cat.name, query) }), _jsxs("p", { className: "text-[10px] text-slate-400 dark:text-[#ADE8F4]/70 font-mono", children: ["Kode: ", cat.code, " (", cat.itemCount || 0, " items)"] })] }), _jsx(ArrowRight, { className: "w-3.5 h-3.5 text-slate-400 group-hover:text-[#0077B6]" })] }, cat.id))) })] })), _jsxs("div", { className: "p-3.5 bg-slate-50 dark:bg-[#03045E]/60", children: [_jsx("div", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#ADE8F4]/80 mb-2", children: "Aksi Cepat (Quick Jump)" }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [_jsxs("button", { onClick: () => {
                                                    onNavigate('store-requests');
                                                    setIsOpen(false);
                                                }, className: "p-2 rounded-xl bg-white dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 text-left transition cursor-pointer group", children: [_jsx(FileSpreadsheet, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4] mb-1" }), _jsx("p", { className: "text-xs font-semibold text-slate-800 dark:text-white", children: "Semua SR" }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-[#ADE8F4]/70", children: "Daftar Permintaan" })] }), _jsxs("button", { onClick: () => {
                                                    onNavigate('inventory');
                                                    setIsOpen(false);
                                                }, className: "p-2 rounded-xl bg-white dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 text-left transition cursor-pointer group", children: [_jsx(Boxes, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4] mb-1" }), _jsx("p", { className: "text-xs font-semibold text-slate-800 dark:text-white", children: "Inventaris" }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-[#ADE8F4]/70", children: "Katalog & Stok" })] }), _jsxs("button", { onClick: () => {
                                                    onNavigate('reports');
                                                    setIsOpen(false);
                                                }, className: "p-2 rounded-xl bg-white dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 text-left transition cursor-pointer group", children: [_jsx(BarChart3, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4] mb-1" }), _jsx("p", { className: "text-xs font-semibold text-slate-800 dark:text-white", children: "Laporan PDF" }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-[#ADE8F4]/70", children: "ISO 9001 Reports" })] }), _jsxs("button", { onClick: () => {
                                                    onNavigate('audit-logs');
                                                    setIsOpen(false);
                                                }, className: "p-2 rounded-xl bg-white dark:bg-[#03045E] hover:bg-[#CAF0F8] dark:hover:bg-[#0077B6]/40 border border-slate-200 dark:border-[#0077B6]/30 text-left transition cursor-pointer group", children: [_jsx(ShieldAlert, { className: "w-4 h-4 text-[#0077B6] dark:text-[#48CAE4] mb-1" }), _jsx("p", { className: "text-xs font-semibold text-slate-800 dark:text-white", children: "Audit Log" }), _jsx("p", { className: "text-[10px] text-slate-400 dark:text-[#ADE8F4]/70", children: "Jejak Aktivitas" })] })] })] }), query && searchResults.total === 0 && (_jsxs("div", { className: "p-8 text-center", children: [_jsx(Search, { className: "w-8 h-8 mx-auto text-slate-300 dark:text-slate-500 mb-2" }), _jsxs("p", { className: "text-xs font-bold text-slate-700 dark:text-white", children: ["Tidak ada hasil untuk \"", query, "\""] }), _jsx("p", { className: "text-[11px] text-slate-400 dark:text-[#ADE8F4]/70 mt-1 max-w-xs mx-auto", children: "Coba kata kunci lain atau pilih rekomendasi kata kunci di atas untuk mencari data terkait." }), _jsxs("button", { onClick: handleFullSearch, className: "mt-3 px-4 py-2 rounded-xl bg-[#0077B6] hover:bg-[#0096C7] text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5", children: [_jsx("span", { children: "Cari di Seluruh Requisition" }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] }))] }), _jsxs("div", { className: "px-4 py-2.5 bg-slate-50 dark:bg-[#03045E] border-t border-slate-100 dark:border-[#0077B6]/30 flex items-center justify-between text-[11px] text-slate-400 dark:text-[#ADE8F4]/80", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx("kbd", { className: "px-1.5 py-0.5 rounded bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/50 font-mono text-[10px]", children: "\u2191\u2193" }), ' ', "Navigasi"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("kbd", { className: "px-1.5 py-0.5 rounded bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/50 font-mono text-[10px]", children: "Enter" }), ' ', "Pilih"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx("kbd", { className: "px-1.5 py-0.5 rounded bg-white dark:bg-[#023E8A] border border-slate-200 dark:border-[#0077B6]/50 font-mono text-[10px]", children: "Esc" }), ' ', "Tutup"] })] }), query && (_jsxs("button", { onClick: handleFullSearch, className: "font-semibold text-[#0077B6] dark:text-[#48CAE4] hover:underline flex items-center gap-1", children: [_jsx("span", { children: "Lihat semua hasil" }), _jsx(CornerDownLeft, { className: "w-3 h-3" })] }))] })] }))] }));
};
