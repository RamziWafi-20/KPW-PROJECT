import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { storeService } from './services/storeService.js';
import { LoginView } from './components/auth/LoginView.js';
import { AdminLayout } from './components/layout/AdminLayout.js';
import { SupervisorDashboard } from './components/dashboard/SupervisorDashboard.js';
import { OfficerDashboard } from './components/dashboard/OfficerDashboard.js';
import { DepartmentAdminDashboard } from './components/dashboard/DepartmentAdminDashboard.js';
import { StoreRequestList } from './components/store-requests/StoreRequestList.js';
import { CreateStoreRequestModal } from './components/store-requests/CreateStoreRequestModal.js';
import { StoreRequestDetailModal } from './components/store-requests/StoreRequestDetailModal.js';
import { ApprovalModal } from './components/approvals/ApprovalModal.js';
import { ReceivingModal } from './components/receiving/ReceivingModal.js';
import { CategoriesView } from './components/inventory/CategoriesView.js';
import { ItemMasterView } from './components/inventory/ItemMasterView.js';
import { ReceivingLogsView } from './components/receiving/ReceivingLogsView.js';
import { ReportsView } from './components/reports/ReportsView.js';
import { AuditLogView } from './components/audit/AuditLogView.js';
import { NotificationsView } from './components/notifications/NotificationsView.js';
import { Plus, CheckCircle2 } from 'lucide-react';
export function App() {
    const [currentUser, setCurrentUser] = useState(() => storeService.getCurrentUser());
    const [activeView, setActiveView] = useState('dashboard');
    const [toastMessage, setToastMessage] = useState(null);
    // Modals state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [approvalModalSR, setApprovalModalSR] = useState(null);
    const [receivingModalSR, setReceivingModalSR] = useState(null);
    const [detailModalSR, setDetailModalSR] = useState(null);
    const [searchFilterQuery, setSearchFilterQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    useEffect(() => {
        const unsub = storeService.subscribe(() => {
            const user = storeService.getCurrentUser();
            setCurrentUser(user);
        });
        return () => unsub();
    }, []);
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => {
            setToastMessage(null);
        }, 4000);
    };
    const handleNavigate = (view, id) => {
        if (view === 'create-sr') {
            setIsCreateModalOpen(true);
            setActiveView('store-requests');
            return;
        }
        if (view === 'sr-status') {
            setActiveView('store-requests');
            return;
        }
        setActiveView(view);
        if (id !== undefined && id !== null) {
            if (typeof id === 'number') {
                const found = storeService.getStoreRequestById(Number(id));
                if (found) {
                    setDetailModalSR(found);
                }
            }
            else if (typeof id === 'string') {
                const allSRs = storeService.getStoreRequests();
                const matchedSR = allSRs.find((sr) => sr.srNumber.toLowerCase() === id.toLowerCase());
                if (matchedSR) {
                    setDetailModalSR(matchedSR);
                }
                setSearchFilterQuery(id);
            }
        }
        else {
            setSearchFilterQuery('');
        }
    };
    const handleLogout = () => {
        storeService.logout();
        setCurrentUser(null);
        setActiveView('dashboard');
    };
    if (!currentUser) {
        return _jsx(LoginView, { onLoginSuccess: (user) => setCurrentUser(user) });
    }
    // Determine Title, Subtitle, and Breadcrumbs based on activeView
    const getHeaderInfo = () => {
        switch (activeView) {
            case 'dashboard':
                return {
                    title: 'System Operations Dashboard',
                    subtitle: `Logged in as ${currentUser.name} (${currentUser.roleTitle})`,
                    breadcrumbs: [{ label: 'Dashboard' }],
                };
            case 'store-requests':
                return {
                    title: 'Store Requests & Requisitions',
                    subtitle: 'Manage departmental requisitions, approvals, and receiving pipelines',
                    breadcrumbs: [{ label: 'Store Requests' }],
                };
            case 'approvals':
                return {
                    title: 'Supervisor Approval Queue',
                    subtitle: 'Authorize, adjust, or decline departmental store requests',
                    breadcrumbs: [{ label: 'Store Requests', view: 'store-requests' }, { label: 'Approvals' }],
                };
            case 'receiving':
                return {
                    title: 'Warehouse Receiving Logs & QA Inspection',
                    subtitle: 'Official Goods Receiving notes (RCV), physical inspection reports, and verified intake',
                    breadcrumbs: [{ label: 'Receiving Operations', view: 'receiving' }, { label: 'Receiving Logs' }],
                };
            case 'inventory':
            case 'items-master':
                return {
                    title: 'Master Data Barang (Item Master)',
                    subtitle: 'Katalog lengkap barang gudang, ambang batas minimum stok, dan penyesuaian saldo fisik',
                    breadcrumbs: [{ label: 'Inventory', view: 'items-master' }, { label: 'Item Master' }],
                };
            case 'categories':
                return {
                    title: 'Kategori Master Barang (Category Master)',
                    subtitle: 'Printing & stationery, Medic, Food, Beverage, Engineering, IT, Housekeeping, dll',
                    breadcrumbs: [{ label: 'Master Data', view: 'categories' }, { label: 'Categories' }],
                };
            case 'stock-movements':
                return {
                    title: 'Log Mutasi Stok Masuk',
                    subtitle: 'Buku mutasi stok gudang masuk fisik dari penerimaan barang',
                    breadcrumbs: [{ label: 'Receiving', view: 'receiving' }, { label: 'Stock Movements' }],
                };
            case 'reports':
                return {
                    title: 'ISO 9001 Reports & PDF Center',
                    subtitle: 'Generate and print official A4 store request and inventory audit documents',
                    breadcrumbs: [{ label: 'Reports' }],
                };
            case 'audit-log':
            case 'audit-logs':
                return {
                    title: 'System Audit & Compliance Log',
                    subtitle: 'Immutable record of user actions, state mutations, and timestamps',
                    breadcrumbs: [{ label: 'Audit Log' }],
                };
            case 'notifications':
                return {
                    title: 'Broadcast & Reverb Notifications',
                    subtitle: 'Real-time alerts for requisitions, approvals, stock warnings, and goods intake',
                    breadcrumbs: [{ label: 'Notifications' }],
                };
            default:
                return {
                    title: 'STORA System',
                    breadcrumbs: [{ label: 'Overview' }],
                };
        }
    };
    const header = getHeaderInfo();
    // Render header actions
    const renderHeaderActions = () => {
        if (currentUser.role === 'DEPARTMENT_ADMIN') {
            return (_jsxs("button", { onClick: () => setIsCreateModalOpen(true), className: "px-5 py-2.5 text-xs font-medium text-white bg-[#0077B6] hover:bg-[#0096C7] rounded-xl shadow-lg shadow-[#0077B6]/20 transition flex items-center gap-2 cursor-pointer", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Buat Permintaan Baru" })] }));
        }
        return null;
    };
    return (_jsxs(AdminLayout, { currentUser: currentUser, activeView: activeView, onNavigate: handleNavigate, onLogout: handleLogout, title: header.title, subtitle: header.subtitle, breadcrumbItems: header.breadcrumbs, actions: renderHeaderActions(), children: [toastMessage && (_jsxs("div", { className: "fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400 shrink-0" }), _jsx("span", { className: "text-xs font-medium", children: toastMessage }), _jsx("button", { onClick: () => setToastMessage(null), className: "ml-3 text-slate-400 hover:text-white text-xs cursor-pointer", children: "\u2715" })] })), activeView === 'dashboard' && (_jsxs(_Fragment, { children: [currentUser.role === 'RECEIVING_SUPERVISOR' && (_jsx(SupervisorDashboard, { onNavigate: handleNavigate, onOpenApprovalModal: (sr) => setApprovalModalSR(sr) })), currentUser.role === 'RECEIVING_OFFICER' && (_jsx(OfficerDashboard, { onNavigate: handleNavigate, onOpenReceivingModal: (sr) => setReceivingModalSR(sr) })), currentUser.role === 'DEPARTMENT_ADMIN' && (_jsx(DepartmentAdminDashboard, { currentUser: currentUser, onNavigate: handleNavigate, onOpenCreateModal: () => setIsCreateModalOpen(true) }))] })), (activeView === 'store-requests' || activeView === 'approvals') && (_jsx(StoreRequestList, { currentUser: currentUser, initialSearchQuery: searchFilterQuery, onOpenCreateModal: () => setIsCreateModalOpen(true), onOpenApprovalModal: (sr) => setApprovalModalSR(sr), onOpenReceivingModal: (sr) => setReceivingModalSR(sr), onViewDetail: (sr) => setDetailModalSR(sr), onToast: showToast })), (activeView === 'receiving' || activeView === 'stock-movements') && (_jsx(ReceivingLogsView, { currentUser: currentUser, onNavigateToSR: (srId) => handleNavigate('store-requests', srId), onToast: showToast })), activeView === 'categories' && (_jsx(CategoriesView, { currentUser: currentUser, onNavigateToItems: (categoryName) => {
                    setSelectedCategoryFilter(categoryName);
                    setActiveView('items-master');
                }, onToast: showToast })), (activeView === 'items-master' || activeView === 'inventory') && (_jsx(ItemMasterView, { currentUser: currentUser, initialCategory: selectedCategoryFilter, initialSearch: searchFilterQuery, onToast: showToast })), activeView === 'reports' && _jsx(ReportsView, {}), (activeView === 'audit-log' || activeView === 'audit-logs') && _jsx(AuditLogView, {}), activeView === 'notifications' && (_jsx(NotificationsView, { onNavigateToSR: (srId) => handleNavigate('store-requests', srId) })), _jsx(CreateStoreRequestModal, { isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), currentUser: currentUser, onSuccess: (msg) => {
                    showToast(msg);
                    setActiveView('store-requests');
                } }), _jsx(ApprovalModal, { sr: approvalModalSR, isOpen: !!approvalModalSR, onClose: () => setApprovalModalSR(null), onSuccess: (msg) => showToast(msg) }), _jsx(ReceivingModal, { sr: receivingModalSR, isOpen: !!receivingModalSR, onClose: () => setReceivingModalSR(null), onSuccess: (msg) => showToast(msg) }), _jsx(StoreRequestDetailModal, { sr: detailModalSR, isOpen: !!detailModalSR, onClose: () => setDetailModalSR(null) })] }));
}
export default App;
