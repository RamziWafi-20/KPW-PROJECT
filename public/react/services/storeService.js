import { DEMO_USERS, DEPARTMENTS, INITIAL_STORE_REQUESTS, INITIAL_STOCK_MOVEMENTS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS, } from '../data/seedData.js';
import { ALL_CATEGORIES, ALL_ITEMS } from '../data/masterData.js';
const STORAGE_KEYS = {
    CURRENT_USER: 'stora_current_user_v2',
    USERS: 'stora_users_v2',
    CATEGORIES: 'stora_categories_v2',
    ITEMS: 'stora_items_v2',
    STORE_REQUESTS: 'stora_srs_v2',
    STOCK_MOVEMENTS: 'stora_movements_v2',
    NOTIFICATIONS: 'stora_notifications_v2',
    AUDIT_LOGS: 'stora_audit_logs_v2',
    THEME: 'stora_theme_mode_v1',
};
// BroadcastChannel for instant cross-tab real-time sync (simulating Laravel Reverb)
let broadcastChannel = null;
try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('stora_reverb_events');
    }
}
catch {
    // Fallback
}
class StoreService {
    currentUser = null;
    users = DEMO_USERS;
    categories = ALL_CATEGORIES;
    items = ALL_ITEMS;
    storeRequests = INITIAL_STORE_REQUESTS;
    stockMovements = INITIAL_STOCK_MOVEMENTS;
    notifications = INITIAL_NOTIFICATIONS;
    auditLogs = INITIAL_AUDIT_LOGS;
    listeners = new Set();
    notificationListeners = new Set();
    serverSyncQueue = Promise.resolve();
    serverPollTimer = null;
    serverSyncPending = false;
    constructor() {
        this.loadFromStorage();
        this.hydrateFromServer();
        if (typeof window !== 'undefined') {
            this.serverPollTimer = window.setInterval(() => this.hydrateFromServer(false), 5000);
        }
        if (broadcastChannel) {
            broadcastChannel.onmessage = (event) => {
                if (event.data?.type === 'STATE_MUTATION') {
                    this.loadFromStorage();
                    this.notifyListeners();
                }
                else if (event.data?.type === 'NOTIFICATION_BROADCAST') {
                    this.loadFromStorage();
                    this.notifyListeners();
                    this.notificationListeners.forEach((fn) => fn(event.data.notification));
                }
            };
        }
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    onRealtimeNotification(listener) {
        this.notificationListeners.add(listener);
        return () => {
            this.notificationListeners.delete(listener);
        };
    }
    notifyListeners() {
        this.listeners.forEach((fn) => fn());
    }
    persist() {
        try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
            localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.items));
            localStorage.setItem(STORAGE_KEYS.STORE_REQUESTS, JSON.stringify(this.storeRequests));
            localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(this.stockMovements));
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
            if (this.currentUser) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
            }
            else {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            }
        }
        catch {
            // Storage unavailable or quota
        }
        this.notifyListeners();
        if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'STATE_MUTATION' });
        }
        this.syncToServer();
    }
    loadFromStorage() {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
            else {
                // Default to Ramzi Wafi (Supervisor)
                this.currentUser = DEMO_USERS[0];
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
            }
            const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            if (storedCategories) {
                const parsedCats = JSON.parse(storedCategories);
                if (parsedCats.length >= ALL_CATEGORIES.length) {
                    this.categories = parsedCats;
                }
                else {
                    this.categories = ALL_CATEGORIES;
                    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
                }
            }
            else {
                this.categories = ALL_CATEGORIES;
            }
            const storedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
            if (storedItems) {
                const parsedItems = JSON.parse(storedItems);
                if (parsedItems.length >= ALL_ITEMS.length) {
                    this.items = parsedItems;
                }
                else {
                    this.items = ALL_ITEMS;
                    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.items));
                }
            }
            else {
                this.items = ALL_ITEMS;
            }
            const storedSRs = localStorage.getItem(STORAGE_KEYS.STORE_REQUESTS);
            if (storedSRs)
                this.storeRequests = JSON.parse(storedSRs);
            const storedMovements = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
            if (storedMovements)
                this.stockMovements = JSON.parse(storedMovements);
            const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
            if (storedNotifs)
                this.notifications = JSON.parse(storedNotifs);
            const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
            if (storedLogs)
                this.auditLogs = JSON.parse(storedLogs);
        }
        catch {
            // Use defaults
        }
    }
    getCsrfToken() {
        if (typeof document === 'undefined') return '';
        return document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content') || '';
    }
    getServerPayload() {
        return {
            users: this.users,
            categories: this.categories,
            items: this.items,
            storeRequests: this.storeRequests,
            stockMovements: this.stockMovements,
            notifications: this.notifications,
            auditLogs: this.auditLogs,
        };
    }
    applyServerPayload(payload) {
        if (!payload) return;
        if (Array.isArray(payload.users)) this.users = payload.users;
        if (Array.isArray(payload.categories)) this.categories = payload.categories;
        if (Array.isArray(payload.items)) this.items = payload.items;
        if (Array.isArray(payload.storeRequests)) this.storeRequests = payload.storeRequests;
        if (Array.isArray(payload.stockMovements)) this.stockMovements = payload.stockMovements;
        if (Array.isArray(payload.notifications)) this.notifications = payload.notifications;
        if (Array.isArray(payload.auditLogs)) this.auditLogs = payload.auditLogs;
    }
    async hydrateFromServer(notify = true) {
        if (typeof window === 'undefined' || !navigator.onLine || this.serverSyncPending) return;
        try {
            const response = await fetch('/api/stora/state', { headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' } });
            if (!response.ok) return;
            const result = await response.json();
            if (result.success && result.data) {
                const before = JSON.stringify(this.getServerPayload());
                const after = JSON.stringify(result.data);
                if (before !== after) {
                    this.applyServerPayload(result.data);
                    this.persistLocalOnly();
                    if (notify) this.notifyListeners();
                }
            }
        } catch {
            // Offline/network failure: local state remains available.
        }
    }
    persistLocalOnly() {
        try {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
            localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(this.items));
            localStorage.setItem(STORAGE_KEYS.STORE_REQUESTS, JSON.stringify(this.storeRequests));
            localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(this.stockMovements));
            localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
        } catch {}
    }
    syncToServer() {
        if (typeof window === 'undefined') return;
        const payload = this.getServerPayload();
        this.serverSyncPending = true;
        this.serverSyncQueue = this.serverSyncQueue.then(async () => {
            try {
                const response = await fetch('/api/stora/state', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': this.getCsrfToken(),
                    },
                    body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('STORA state sync failed');
                this.serverSyncPending = false;
            } catch {
                // Local state remains usable; retry on the next mutation.
                this.serverSyncPending = false;
            }
        });
    }
    resetToFactoryDemo() {
        this.currentUser = DEMO_USERS[0];
        this.users = [...DEMO_USERS];
        this.categories = [...ALL_CATEGORIES];
        this.items = [...ALL_ITEMS];
        this.storeRequests = [...INITIAL_STORE_REQUESTS];
        this.stockMovements = [...INITIAL_STOCK_MOVEMENTS];
        this.notifications = [...INITIAL_NOTIFICATIONS];
        this.auditLogs = [...INITIAL_AUDIT_LOGS];
        this.persist();
        this.logAudit('DATABASE_SEED', 'Reset all system data to initial factory demo seed state', 'System', 'RESET');
    }
    // --- Auth & Sessions ---
    getCurrentUser() {
        return this.currentUser;
    }
    login(username, _password) {
        const user = this.users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
        if (!user) {
            return { success: false, message: 'Invalid credentials. User does not exist.' };
        }
        this.currentUser = user;
        this.persist();
        this.logAudit('USER_LOGIN', `User ${user.name} (${user.roleTitle}) logged in via session authentication`, 'User', user.id.toString());
        return { success: true, message: `Welcome back, ${user.name}!`, user };
    }
    switchUser(userId) {
        const user = this.users.find((u) => u.id === userId) || this.users[0];
        this.currentUser = user;
        this.persist();
        this.logAudit('ROLE_SWITCH', `Switched active session to ${user.name} (${user.roleTitle})`, 'Session', user.id.toString());
        return user;
    }
    logout() {
        if (this.currentUser) {
            this.logAudit('USER_LOGOUT', `User ${this.currentUser.name} logged out and session invalidated`, 'User', this.currentUser.id.toString());
        }
        this.currentUser = null;
        this.persist();
    }
    // --- Audit Logging ---
    logAudit(action, description, referenceType, referenceId) {
        const user = this.currentUser || DEMO_USERS[0];
        const newLog = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            action,
            description,
            referenceType,
            referenceId,
            ipAddress: '127.0.0.1 (Reverb/Local)',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
        this.auditLogs = [newLog, ...this.auditLogs];
        this.persist();
    }
    getAuditLogs() {
        return this.auditLogs;
    }
    // --- Notifications (Reverb Realtime Pipeline) ---
    createAndBroadcastNotification(payload) {
        const notification = {
            id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            recipientUserId: payload.recipientUserId,
            recipientRole: payload.recipientRole,
            title: payload.title,
            message: payload.message,
            eventType: payload.eventType,
            referenceType: payload.referenceType,
            referenceId: payload.referenceId,
            url: payload.url,
            readAt: null,
            createdAt: new Date().toISOString(),
        };
        this.notifications = [notification, ...this.notifications];
        this.persist();
        // Trigger local listeners
        this.notificationListeners.forEach((fn) => fn(notification));
        // Broadcast across windows / tabs simulating Reverb WebSocket
        if (broadcastChannel) {
            broadcastChannel.postMessage({
                type: 'NOTIFICATION_BROADCAST',
                notification,
            });
        }
        // Play subtle audio alert if permitted
        this.playNotificationSound();
    }
    playNotificationSound() {
        try {
            if (typeof window !== 'undefined' && window.AudioContext) {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            }
        }
        catch {
            // Audio autoplay policy catch
        }
    }
    getActiveNotifications(userId) {
        const targetUserId = userId || this.currentUser?.id;
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return this.notifications
            .filter((n) => {
            // 24-hour condition
            const createdTime = new Date(n.createdAt).getTime();
            if (now - createdTime > twentyFourHours)
                return false;
            // User target matching or role broadcast
            if (targetUserId && n.recipientUserId === targetUserId)
                return true;
            if (this.currentUser && n.recipientRole && n.recipientRole === this.currentUser.role)
                return true;
            return false;
        })
            .map((n) => ({
            ...n,
            type: n.eventType,
            read: !!n.readAt,
        }));
    }
    getNotifications(filter24h = true) {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return this.notifications
            .filter((n) => {
            if (filter24h) {
                const createdTime = new Date(n.createdAt).getTime();
                if (now - createdTime > twentyFourHours)
                    return false;
            }
            return true;
        })
            .map((n) => ({
            ...n,
            type: n.eventType,
            read: !!n.readAt,
        }));
    }
    getUnreadNotificationCount(userId) {
        const active = this.getActiveNotifications(userId);
        return active.filter((n) => !n.readAt).length;
    }
    markNotificationAsRead(id) {
        this.notifications = this.notifications.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n);
        this.persist();
    }
    markAllNotificationsAsRead(userId) {
        const targetUserId = userId || this.currentUser?.id;
        this.notifications = this.notifications.map((n) => {
            if (n.recipientUserId === targetUserId || (this.currentUser && n.recipientRole === this.currentUser.role)) {
                return { ...n, readAt: new Date().toISOString() };
            }
            return n;
        });
        this.persist();
    }
    cleanupExpiredNotifications() {
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const beforeCount = this.notifications.length;
        this.notifications = this.notifications.filter((n) => {
            return now - new Date(n.createdAt).getTime() <= twentyFourHours;
        });
        const purged = beforeCount - this.notifications.length;
        this.persist();
        this.logAudit('NOTIFICATION_CLEANUP', `php artisan notifications:cleanup executed. Purged ${purged} expired notifications older than 24h.`, 'Scheduler', 'CRON');
        return purged;
    }
    // --- Store Requests ---
    getStoreRequests() {
        return this.storeRequests;
    }
    getStoreRequestById(id) {
        return this.storeRequests.find((sr) => sr.id === id);
    }
    generateNextSrNumber() {
        const currentYear = new Date().getFullYear();
        const currentYearPrefix = `SR-${currentYear}-`;
        const matchingNumbers = this.storeRequests
            .filter((sr) => sr.srNumber.startsWith(currentYearPrefix))
            .map((sr) => {
            const numPart = parseInt(sr.srNumber.replace(currentYearPrefix, ''), 10);
            return isNaN(numPart) ? 0 : numPart;
        });
        const maxNum = matchingNumbers.length > 0 ? Math.max(...matchingNumbers) : 0;
        const nextNum = (maxNum + 1).toString().padStart(6, '0');
        return `${currentYearPrefix}${nextNum}`;
    }
    createStoreRequest(payload) {
        if (!this.currentUser) {
            return { success: false, message: 'Authentication required.' };
        }
        if (!payload.purpose || payload.purpose.trim() === '') {
            return { success: false, message: 'Purpose is required.' };
        }
        if (!payload.items || payload.items.length === 0) {
            return { success: false, message: 'At least one item is required.' };
        }
        // Validation
        for (const row of payload.items) {
            if (!row.itemId)
                return { success: false, message: 'All items must be selected.' };
            if (!row.quantityRequested || row.quantityRequested <= 0) {
                return { success: false, message: 'Quantity must be greater than zero.' };
            }
        }
        const srNumber = this.generateNextSrNumber();
        const departmentId = this.currentUser.departmentId || 1;
        const department = DEPARTMENTS.find((d) => d.id === departmentId) || DEPARTMENTS[0];
        const srId = Date.now() + Math.floor(Math.random() * 100);
        const srItems = payload.items.map((it, idx) => {
            const itemMaster = this.items.find((m) => m.id === it.itemId);
            const cat = this.categories.find((c) => c.id === itemMaster.categoryId);
            return {
                id: srId * 10 + idx,
                storeRequestId: srId,
                itemId: itemMaster.id,
                itemCode: itemMaster.itemCode,
                itemName: itemMaster.itemName,
                categoryId: cat.id,
                categoryName: cat.name,
                quantityRequested: it.quantityRequested,
                quantityReceived: 0,
                unit: itemMaster.unit,
                notes: it.notes || '',
            };
        });
        const status = payload.isDraft ? 'DRAFT' : 'UNDER_REVIEW';
        const newSR = {
            id: srId,
            srNumber,
            departmentId: department.id,
            departmentName: department.name,
            requesterUserId: this.currentUser.id,
            requesterName: this.currentUser.name,
            requestDate: new Date().toISOString().split('T')[0],
            requiredDate: payload.requiredDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
            purpose: payload.purpose.trim(),
            notes: payload.notes || '',
            status,
            items: srItems,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.storeRequests = [newSR, ...this.storeRequests];
        this.persist();
        this.logAudit(payload.isDraft ? 'SAVE_SR_DRAFT' : 'SUBMIT_SR', `${payload.isDraft ? 'Saved draft' : 'Submitted'} Store Request ${srNumber} (${srItems.length} items) for ${department.name}`, 'StoreRequest', srNumber);
        // If submitted, dispatch real-time notification to Receiving Supervisor
        if (!payload.isDraft) {
            const supervisor = this.users.find((u) => u.role === 'RECEIVING_SUPERVISOR') || DEMO_USERS[0];
            this.createAndBroadcastNotification({
                recipientUserId: supervisor.id,
                recipientRole: 'RECEIVING_SUPERVISOR',
                title: 'New Store Request',
                message: `${srNumber} has been submitted by ${this.currentUser.name} (${department.name}) and requires your review.`,
                eventType: 'SR_SUBMITTED',
                referenceType: 'StoreRequest',
                referenceId: srNumber,
                url: `/store-requests/${srId}`,
            });
        }
        return {
            success: true,
            message: payload.isDraft ? `Draft ${srNumber} saved successfully.` : `Store Request ${srNumber} submitted successfully!`,
            storeRequest: newSR,
        };
    }
    submitDraftStoreRequest(srId) {
        const sr = this.storeRequests.find((s) => s.id === srId);
        if (!sr)
            return { success: false, message: 'Store Request not found.' };
        if (sr.status !== 'DRAFT') {
            return { success: false, message: `Only DRAFT requests can be submitted (Current status: ${sr.status}).` };
        }
        sr.status = 'UNDER_REVIEW';
        sr.updatedAt = new Date().toISOString();
        this.persist();
        this.logAudit('SUBMIT_SR', `Submitted Store Request draft ${sr.srNumber}`, 'StoreRequest', sr.srNumber);
        const supervisor = this.users.find((u) => u.role === 'RECEIVING_SUPERVISOR') || DEMO_USERS[0];
        this.createAndBroadcastNotification({
            recipientUserId: supervisor.id,
            recipientRole: 'RECEIVING_SUPERVISOR',
            title: 'New Store Request',
            message: `${sr.srNumber} has been submitted by ${sr.requesterName} and requires your review.`,
            eventType: 'SR_SUBMITTED',
            referenceType: 'StoreRequest',
            referenceId: sr.srNumber,
            url: `/store-requests/${sr.id}`,
        });
        return { success: true, message: `Store Request ${sr.srNumber} submitted to Receiving Supervisor!` };
    }
    // --- Approvals (Supervisor Only) ---
    approveStoreRequest(srId, comments) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized. Only Receiving Supervisors can approve Store Requests.' };
        }
        const sr = this.storeRequests.find((s) => s.id === srId);
        if (!sr)
            return { success: false, message: 'Store Request not found.' };
        if (sr.status !== 'UNDER_REVIEW' && sr.status !== 'SUBMITTED') {
            return { success: false, message: `Cannot approve SR in state: ${sr.status}` };
        }
        // State Transition
        sr.status = 'APPROVED';
        sr.updatedAt = new Date().toISOString();
        sr.approval = {
            id: Date.now(),
            storeRequestId: sr.id,
            approvedByUserId: this.currentUser.id,
            approvedByName: this.currentUser.name,
            approvedAt: new Date().toISOString(),
            comments: comments || 'Approved by Receiving Supervisor',
            status: 'APPROVED',
        };
        // Auto-Deduct Inventory Stock on Store Request Approval
        const stockMovementList = [];
        const lowStockAlerts = [];
        const outOfStockAlerts = [];
        for (const srItem of sr.items) {
            const masterItem = this.items.find((it) => it.id === srItem.itemId || it.itemCode === srItem.itemCode);
            if (masterItem) {
                const prevStock = masterItem.currentStock;
                const deductQty = srItem.quantityRequested;
                const newStock = Math.max(0, prevStock - deductQty);
                masterItem.currentStock = newStock;
                masterItem.updatedAt = new Date().toISOString();
                if (newStock === 0) {
                    masterItem.status = 'OUT_OF_STOCK';
                    outOfStockAlerts.push(masterItem);
                }
                else if (newStock <= masterItem.minimumStock) {
                    masterItem.status = 'LOW_STOCK';
                    lowStockAlerts.push(masterItem);
                }
                else {
                    masterItem.status = 'AVAILABLE';
                }
                srItem.quantityReceived = deductQty;
                // Stock Movement Log (OUT / DISBURSEMENT)
                const movement = {
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    itemId: masterItem.id,
                    itemCode: masterItem.itemCode,
                    itemName: masterItem.itemName,
                    type: 'OUT',
                    quantity: deductQty,
                    previousStock: prevStock,
                    newStock: newStock,
                    referenceType: 'StoreRequest',
                    referenceId: sr.srNumber,
                    userId: this.currentUser.id,
                    userName: this.currentUser.name,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    notes: `Stok keluar untuk pemenuhan Store Request ${sr.srNumber} (${sr.departmentName})`,
                    createdAt: new Date().toISOString(),
                };
                stockMovementList.push(movement);
            }
        }
        if (stockMovementList.length > 0) {
            this.stockMovements = [...stockMovementList, ...this.stockMovements];
        }
        this.persist();
        this.logAudit('APPROVE_SR', `Approved Store Request ${sr.srNumber} (${sr.departmentName}). Auto-deducted inventory stock for ${sr.items.length} items.`, 'StoreRequest', sr.srNumber);
        // Notify Department Admin (Requester)
        this.createAndBroadcastNotification({
            recipientUserId: sr.requesterUserId,
            recipientRole: 'DEPARTMENT_ADMIN',
            title: 'Store Request Approved',
            message: `${sr.srNumber} has been approved by ${this.currentUser.name}. Barang telah dialokasikan dan stok otomatis terpotong.`,
            eventType: 'SR_APPROVED',
            referenceType: 'StoreRequest',
            referenceId: sr.srNumber,
            url: `/store-requests/${sr.id}`,
        });
        // Notify Receiving Officer
        const officer = this.users.find((u) => u.role === 'RECEIVING_OFFICER');
        if (officer) {
            this.createAndBroadcastNotification({
                recipientUserId: officer.id,
                recipientRole: 'RECEIVING_OFFICER',
                title: 'New Approved Store Request',
                message: `${sr.srNumber} (${sr.departmentName}) is approved and ready for receiving inspection.`,
                eventType: 'SR_APPROVED',
                referenceType: 'StoreRequest',
                referenceId: sr.srNumber,
                url: `/receiving/${sr.id}`,
            });
        }
        // Stock alerts for supervisor
        for (const lowItem of lowStockAlerts) {
            this.createAndBroadcastNotification({
                recipientUserId: this.currentUser.id,
                recipientRole: 'RECEIVING_SUPERVISOR',
                title: 'Low Stock Alert',
                message: `${lowItem.itemName} (${lowItem.itemCode}) stok tersisa ${lowItem.currentStock} ${lowItem.unit} (di bawah batas minimum ${lowItem.minimumStock}).`,
                eventType: 'LOW_STOCK',
                referenceType: 'Inventory',
                referenceId: lowItem.id,
                url: '/inventory',
            });
        }
        for (const outItem of outOfStockAlerts) {
            this.createAndBroadcastNotification({
                recipientUserId: this.currentUser.id,
                recipientRole: 'RECEIVING_SUPERVISOR',
                title: 'Out of Stock Alert',
                message: `${outItem.itemName} (${outItem.itemCode}) stok telah HABIS (0 ${outItem.unit}).`,
                eventType: 'OUT_OF_STOCK',
                referenceType: 'Inventory',
                referenceId: outItem.id,
                url: '/inventory',
            });
        }
        return { success: true, message: `Store Request ${sr.srNumber} berhasil disetujui & stok inventory otomatis berkurang!` };
    }
    rejectStoreRequest(srId, reason) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized. Only Receiving Supervisors can reject Store Requests.' };
        }
        if (!reason || reason.trim() === '') {
            return { success: false, message: 'Rejection reason is required.' };
        }
        const sr = this.storeRequests.find((s) => s.id === srId);
        if (!sr)
            return { success: false, message: 'Store Request not found.' };
        if (sr.status !== 'UNDER_REVIEW' && sr.status !== 'SUBMITTED') {
            return { success: false, message: `Cannot reject SR in state: ${sr.status}` };
        }
        // State Transition
        sr.status = 'REJECTED';
        sr.updatedAt = new Date().toISOString();
        sr.approval = {
            id: Date.now(),
            storeRequestId: sr.id,
            rejectedByUserId: this.currentUser.id,
            rejectedByName: this.currentUser.name,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason.trim(),
            status: 'REJECTED',
        };
        this.persist();
        this.logAudit('REJECT_SR', `Rejected Store Request ${sr.srNumber}. Reason: ${reason.trim()}`, 'StoreRequest', sr.srNumber);
        // Notify Department Admin (Requester) with reason
        this.createAndBroadcastNotification({
            recipientUserId: sr.requesterUserId,
            recipientRole: 'DEPARTMENT_ADMIN',
            title: 'Store Request Rejected',
            message: `${sr.srNumber} has been rejected. Reason: ${reason.trim()}`,
            eventType: 'SR_REJECTED',
            referenceType: 'StoreRequest',
            referenceId: sr.srNumber,
            url: `/store-requests/${sr.id}`,
        });
        return { success: true, message: `Store Request ${sr.srNumber} has been rejected.` };
    }
    // --- Receiving Process (Receiving Officer) with DB Transaction Emulation ---
    completeReceiving(payload) {
        if (!this.currentUser || (this.currentUser.role !== 'RECEIVING_OFFICER' && this.currentUser.role !== 'RECEIVING_SUPERVISOR')) {
            return { success: false, message: 'Unauthorized. Only Receiving Personnel can process receiving.' };
        }
        const sr = this.storeRequests.find((s) => s.id === payload.storeRequestId);
        if (!sr)
            return { success: false, message: 'Store Request not found.' };
        if (sr.status !== 'APPROVED' && sr.status !== 'PROCESSING') {
            return { success: false, message: `Cannot receive SR with status: ${sr.status}` };
        }
        // Validation of item quantities
        for (const rItem of payload.receivedItems) {
            if (rItem.quantityReceived < 0) {
                return { success: false, message: 'Received quantity cannot be negative.' };
            }
        }
        // Generate Receiving Number
        const receivingYear = new Date().getFullYear();
        const receivingNumber = `RCV-${receivingYear}-${Math.floor(100000 + Math.random() * 900000)}`;
        const receivingId = Date.now();
        // Start simulated DB::transaction()
        try {
            const stockMovementList = [];
            const lowStockAlerts = [];
            const outOfStockAlerts = [];
            const receivingItemsRecords = [];
            for (const itemPayload of payload.receivedItems) {
                const srItem = sr.items.find((it) => it.id === itemPayload.storeRequestItemId || it.itemId === itemPayload.itemId);
                if (srItem) {
                    srItem.quantityReceived = (srItem.quantityReceived || 0) + itemPayload.quantityReceived;
                }
                const masterItem = this.items.find((it) => it.id === itemPayload.itemId);
                if (masterItem) {
                    const prevStock = masterItem.currentStock;
                    const newStock = prevStock + itemPayload.quantityReceived;
                    // Update Master Item
                    masterItem.currentStock = newStock;
                    masterItem.updatedAt = new Date().toISOString();
                    // Evaluate Status
                    if (newStock === 0) {
                        masterItem.status = 'OUT_OF_STOCK';
                        outOfStockAlerts.push(masterItem);
                    }
                    else if (newStock <= masterItem.minimumStock) {
                        masterItem.status = 'LOW_STOCK';
                        lowStockAlerts.push(masterItem);
                    }
                    else {
                        masterItem.status = 'AVAILABLE';
                    }
                    // Stock Movement
                    const movement = {
                        id: Date.now() + Math.floor(Math.random() * 10000),
                        itemId: masterItem.id,
                        itemCode: masterItem.itemCode,
                        itemName: masterItem.itemName,
                        type: 'IN',
                        quantity: itemPayload.quantityReceived,
                        previousStock: prevStock,
                        newStock: newStock,
                        referenceType: 'Receiving',
                        referenceId: receivingNumber,
                        userId: this.currentUser.id,
                        userName: this.currentUser.name,
                        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        notes: `Receiving completed for ${sr.srNumber} (${sr.departmentName})`,
                        createdAt: new Date().toISOString(),
                    };
                    stockMovementList.push(movement);
                    receivingItemsRecords.push({
                        id: receivingId * 10 + itemPayload.itemId,
                        receivingId,
                        storeRequestItemId: srItem ? srItem.id : 0,
                        itemId: masterItem.id,
                        itemName: masterItem.itemName,
                        quantityReceived: itemPayload.quantityReceived,
                        unit: masterItem.unit,
                        condition: itemPayload.condition || 'Good / Passed Inspection',
                        notes: itemPayload.notes || '',
                    });
                }
            }
            // Update Store Request status to COMPLETED
            sr.status = 'COMPLETED';
            sr.updatedAt = new Date().toISOString();
            sr.receiving = {
                id: receivingId,
                storeRequestId: sr.id,
                storeRequestNumber: sr.srNumber,
                receivingNumber,
                receivedByUserId: this.currentUser.id,
                receivedByName: this.currentUser.name,
                receivingDate: new Date().toISOString().split('T')[0],
                status: 'COMPLETED',
                notes: payload.notes || 'Items verified and received in good condition.',
                completedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                items: receivingItemsRecords,
            };
            // Add Stock Movements
            this.stockMovements = [...stockMovementList, ...this.stockMovements];
            // Audit Log
            this.logAudit('COMPLETE_RECEIVING', `Completed receiving ${receivingNumber} for ${sr.srNumber}. Auto-updated inventory stock and recorded ${stockMovementList.length} stock movements.`, 'Receiving', receivingNumber);
            this.persist();
            // Broadcast Realtime Notifications
            // 1. Notify Department Admin
            this.createAndBroadcastNotification({
                recipientUserId: sr.requesterUserId,
                recipientRole: 'DEPARTMENT_ADMIN',
                title: 'Receiving Completed',
                message: `Goods for ${sr.srNumber} have been received and processed under ${receivingNumber}.`,
                eventType: 'RECEIVING_COMPLETED',
                referenceType: 'Receiving',
                referenceId: receivingNumber,
                url: `/store-requests/${sr.id}`,
            });
            // 2. Notify Receiving Supervisor
            const supervisor = this.users.find((u) => u.role === 'RECEIVING_SUPERVISOR');
            if (supervisor && supervisor.id !== this.currentUser.id) {
                this.createAndBroadcastNotification({
                    recipientUserId: supervisor.id,
                    recipientRole: 'RECEIVING_SUPERVISOR',
                    title: 'Receiving Completed',
                    message: `${receivingNumber} completed by ${this.currentUser.name} for ${sr.srNumber} (${sr.departmentName}).`,
                    eventType: 'RECEIVING_COMPLETED',
                    referenceType: 'Receiving',
                    referenceId: receivingNumber,
                    url: `/receiving/${sr.id}`,
                });
            }
            // Stock alerts (if any items triggered low/out of stock)
            for (const lowItem of lowStockAlerts) {
                if (supervisor) {
                    this.createAndBroadcastNotification({
                        recipientUserId: supervisor.id,
                        recipientRole: 'RECEIVING_SUPERVISOR',
                        title: 'Low Stock Alert',
                        message: `${lowItem.itemName} current stock (${lowItem.currentStock} ${lowItem.unit}) has dropped to or below minimum threshold (${lowItem.minimumStock}).`,
                        eventType: 'LOW_STOCK',
                        referenceType: 'Inventory',
                        referenceId: lowItem.id,
                        url: '/inventory',
                    });
                }
            }
            for (const outItem of outOfStockAlerts) {
                if (supervisor) {
                    this.createAndBroadcastNotification({
                        recipientUserId: supervisor.id,
                        recipientRole: 'RECEIVING_SUPERVISOR',
                        title: 'Out of Stock Alert',
                        message: `${outItem.itemName} is completely OUT OF STOCK (0 ${outItem.unit}).`,
                        eventType: 'OUT_OF_STOCK',
                        referenceType: 'Inventory',
                        referenceId: outItem.id,
                        url: '/inventory',
                    });
                }
            }
            return {
                success: true,
                message: `Receiving ${receivingNumber} completed successfully! Inventory automatically updated.`,
                receivingNumber,
            };
        }
        catch (err) {
            // Rollback
            this.loadFromStorage();
            return { success: false, message: `Transaction failed and rolled back: ${err?.message || 'Unknown error'}` };
        }
    }
    // --- Receiving Logs Queries ---
    getReceivings() {
        const list = [];
        for (const sr of this.storeRequests) {
            if (sr.receiving) {
                list.push(sr.receiving);
            }
        }
        // Sort newest first
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    getReceivingById(id) {
        return this.getReceivings().find((r) => r.id === id);
    }
    getReceivingByNumber(rcvNumber) {
        return this.getReceivings().find((r) => r.receivingNumber.toLowerCase() === rcvNumber.toLowerCase());
    }
    // --- Item Master Management (CRUD) ---
    getItems() {
        return this.items;
    }
    getItemById(id) {
        return this.items.find((i) => i.id === id);
    }
    createItem(data) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized. Only Receiving Supervisors can manage Item Master.' };
        }
        if (!data.itemName || !data.categoryId) {
            return { success: false, message: 'Nama Barang dan Kategori wajib diisi.' };
        }
        const category = this.categories.find((c) => c.id === Number(data.categoryId));
        if (!category)
            return { success: false, message: 'Kategori tidak ditemukan.' };
        const catCode = category.code || 'GEN';
        let itemCode = data.itemCode?.trim();
        if (!itemCode) {
            const nextSeq = (this.items.filter((i) => i.categoryId === category.id).length + 1)
                .toString()
                .padStart(3, '0');
            itemCode = `ITM-${catCode}-${nextSeq}`;
        }
        const unit = data.unit?.trim() || 'Pcs';
        const currentStock = Math.max(0, Number(data.currentStock) || 0);
        const minimumStock = Math.max(0, Number(data.minimumStock) || 10);
        let status = 'AVAILABLE';
        if (currentStock === 0)
            status = 'OUT_OF_STOCK';
        else if (currentStock <= minimumStock)
            status = 'LOW_STOCK';
        const newItem = {
            id: Date.now(),
            itemCode: itemCode.toUpperCase(),
            serialNumber: data.serialNumber?.trim() || undefined,
            itemName: data.itemName.trim(),
            categoryId: category.id,
            categoryName: category.name,
            unit,
            description: data.description || '',
            minimumStock,
            currentStock,
            location: data.location || 'Gudang Utama - Rak A1',
            imageUrl: data.imageUrl,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.items = [newItem, ...this.items];
        // Initial Stock Movement if stock > 0
        if (newItem.currentStock > 0) {
            this.stockMovements = [
                {
                    id: Date.now() + 1,
                    itemId: newItem.id,
                    itemCode: newItem.itemCode,
                    itemName: newItem.itemName,
                    type: 'IN',
                    quantity: newItem.currentStock,
                    previousStock: 0,
                    newStock: newItem.currentStock,
                    referenceType: 'Initial',
                    referenceId: 'INIT-SEED',
                    userId: this.currentUser.id,
                    userName: this.currentUser.name,
                    date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    notes: `Saldo awal input barang baru [${newItem.itemCode}] (${category.name})`,
                    createdAt: new Date().toISOString(),
                },
                ...this.stockMovements,
            ];
        }
        // Refresh Category itemCount
        category.itemCount = this.items.filter((i) => i.categoryId === category.id).length;
        this.persist();
        this.logAudit('CREATE_ITEM', `Created item master ${newItem.itemCode} - ${newItem.itemName} in category ${category.name}`, 'Item', newItem.itemCode);
        return { success: true, message: `Barang ${newItem.itemCode} (${newItem.itemName}) berhasil ditambahkan ke database & Kategori Master!`, item: newItem };
    }
    updateItem(id, data) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized.' };
        }
        const item = this.items.find((i) => i.id === id);
        if (!item)
            return { success: false, message: 'Item not found.' };
        const prevStock = item.currentStock;
        if (data.itemName)
            item.itemName = data.itemName.trim();
        if (data.itemCode)
            item.itemCode = data.itemCode.trim().toUpperCase();
        if (data.serialNumber !== undefined)
            item.serialNumber = data.serialNumber ? data.serialNumber.trim() : undefined;
        if (data.categoryId) {
            item.categoryId = Number(data.categoryId);
            const cat = this.categories.find((c) => c.id === item.categoryId);
            if (cat)
                item.categoryName = cat.name;
        }
        if (data.unit)
            item.unit = data.unit.trim();
        if (data.description !== undefined)
            item.description = data.description;
        if (data.location !== undefined)
            item.location = data.location;
        if (data.imageUrl !== undefined)
            item.imageUrl = data.imageUrl;
        if (data.minimumStock !== undefined)
            item.minimumStock = Number(data.minimumStock);
        if (data.currentStock !== undefined) {
            item.currentStock = Number(data.currentStock);
            if (item.currentStock !== prevStock) {
                // Stock adjustment movement
                const diff = item.currentStock - prevStock;
                this.stockMovements = [
                    {
                        id: Date.now(),
                        itemId: item.id,
                        itemCode: item.itemCode,
                        itemName: item.itemName,
                        type: diff >= 0 ? 'IN' : 'OUT',
                        quantity: Math.abs(diff),
                        previousStock: prevStock,
                        newStock: item.currentStock,
                        referenceType: 'Adjustment',
                        referenceId: 'ADJ-' + Date.now().toString().slice(-6),
                        userId: this.currentUser.id,
                        userName: this.currentUser.name,
                        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        notes: 'Manual inventory adjustment via Supervisor Item Master console',
                        createdAt: new Date().toISOString(),
                    },
                    ...this.stockMovements,
                ];
            }
        }
        // Re-evaluate stock status
        if (item.currentStock === 0)
            item.status = 'OUT_OF_STOCK';
        else if (item.currentStock <= item.minimumStock)
            item.status = 'LOW_STOCK';
        else
            item.status = 'AVAILABLE';
        item.updatedAt = new Date().toISOString();
        this.persist();
        this.logAudit('UPDATE_ITEM', `Updated item master ${item.itemCode} - ${item.itemName}`, 'Item', item.itemCode);
        return { success: true, message: `Item ${item.itemCode} updated successfully.` };
    }
    adjustStock(itemId, addedQty, reason) {
        if (!this.currentUser)
            return { success: false, message: 'Authentication required.' };
        const item = this.items.find((i) => i.id === itemId);
        if (!item)
            return { success: false, message: 'Item not found.' };
        const prevStock = item.currentStock;
        const newStock = Math.max(0, prevStock + addedQty);
        item.currentStock = newStock;
        if (newStock === 0)
            item.status = 'OUT_OF_STOCK';
        else if (newStock <= item.minimumStock)
            item.status = 'LOW_STOCK';
        else
            item.status = 'AVAILABLE';
        item.updatedAt = new Date().toISOString();
        const movement = {
            id: Date.now(),
            itemId: item.id,
            itemCode: item.itemCode,
            itemName: item.itemName,
            type: addedQty >= 0 ? 'IN' : 'OUT',
            quantity: Math.abs(addedQty),
            previousStock: prevStock,
            newStock: newStock,
            referenceType: 'Adjustment',
            referenceId: 'ADJ-' + Date.now().toString().slice(-6),
            referenceNumber: 'ADJ-' + Date.now().toString().slice(-6),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            performedByName: this.currentUser.name,
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            notes: reason || 'Inventory stock manual adjustment',
            reason: reason || 'Inventory stock manual adjustment',
            createdAt: new Date().toISOString(),
        };
        this.stockMovements = [movement, ...this.stockMovements];
        this.persist();
        this.logAudit('STOCK_ADJUSTED', `Adjusted stock for ${item.itemCode} (${addedQty > 0 ? '+' : ''}${addedQty} ${item.unit}). New balance: ${newStock}`, 'Item', item.itemCode);
        return { success: true, message: `Stock for ${item.itemName} updated (${addedQty > 0 ? '+' : ''}${addedQty} ${item.unit}). Current stock: ${newStock}` };
    }
    deleteItem(id) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized.' };
        }
        const item = this.items.find((i) => i.id === id);
        if (!item)
            return { success: false, message: 'Item not found.' };
        this.items = this.items.filter((i) => i.id !== id);
        this.persist();
        this.logAudit('DELETE_ITEM', `Deleted item master ${item.itemCode} - ${item.itemName}`, 'Item', item.itemCode);
        return { success: true, message: `Item ${item.itemCode} deleted.` };
    }
    // --- Category Management (CRUD) ---
    getCategories() {
        // Dynamically ensure itemCount is always exact
        return this.categories.map((c) => ({
            ...c,
            itemCount: this.items.filter((i) => i.categoryId === c.id).length,
        }));
    }
    createCategory(data) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized. Only Receiving Supervisors can add categories.' };
        }
        if (!data.name || data.name.trim() === '') {
            return { success: false, message: 'Nama kategori wajib diisi.' };
        }
        const trimmedName = data.name.trim();
        // Auto-generate clean 3-4 letter code if not provided
        let catCode = data.code?.trim().toUpperCase();
        if (!catCode) {
            const cleanLetters = trimmedName.replace(/[^a-zA-Z]/g, '');
            if (cleanLetters.length >= 3) {
                catCode = cleanLetters.substring(0, 3).toUpperCase();
            }
            else {
                catCode = (cleanLetters + 'CAT').substring(0, 3).toUpperCase();
            }
            // Check if code exists, append number if needed
            const exists = this.categories.some((c) => c.code === catCode);
            if (exists) {
                catCode = `${catCode.substring(0, 2)}${this.categories.length + 1}`;
            }
        }
        const newCat = {
            id: Date.now(),
            name: trimmedName,
            code: catCode,
            description: data.description?.trim() || `Kategori ${trimmedName} dan persediaan terkait`,
            itemCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.categories = [...this.categories, newCat];
        this.persist();
        this.logAudit('CREATE_CATEGORY', `Created category ${newCat.name} (${newCat.code})`, 'Category', newCat.code);
        return { success: true, message: `Kategori "${newCat.name}" berhasil dibuat!`, category: newCat };
    }
    updateCategory(id, data) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized.' };
        }
        const cat = this.categories.find((c) => c.id === id);
        if (!cat)
            return { success: false, message: 'Category not found.' };
        if (data.name)
            cat.name = data.name.trim();
        if (data.code)
            cat.code = data.code.trim().toUpperCase();
        if (data.description !== undefined)
            cat.description = data.description;
        cat.updatedAt = new Date().toISOString();
        this.persist();
        this.logAudit('UPDATE_CATEGORY', `Updated category ${cat.name}`, 'Category', cat.code);
        return { success: true, message: `Category ${cat.name} updated.` };
    }
    deleteCategory(id) {
        if (!this.currentUser || this.currentUser.role !== 'RECEIVING_SUPERVISOR') {
            return { success: false, message: 'Unauthorized.' };
        }
        const inUse = this.items.some((i) => i.categoryId === id);
        if (inUse) {
            return { success: false, message: 'Cannot delete category that contains existing inventory items.' };
        }
        const cat = this.categories.find((c) => c.id === id);
        if (!cat)
            return { success: false, message: 'Category not found.' };
        this.categories = this.categories.filter((c) => c.id !== id);
        this.persist();
        this.logAudit('DELETE_CATEGORY', `Deleted category ${cat.name}`, 'Category', cat.code);
        return { success: true, message: `Category ${cat.name} deleted.` };
    }
    // --- Stock Movements ---
    getStockMovements() {
        return this.stockMovements;
    }
    // --- Reports & Analytics Engine ---
    generateReport(periodType, customStart, customEnd) {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();
        if (periodType === 'daily') {
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
        }
        else if (periodType === 'weekly') {
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (periodType === 'monthly') {
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        }
        else if (periodType === 'custom' && customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
        }
        const filteredSRs = this.storeRequests.filter((sr) => {
            const d = new Date(sr.createdAt);
            return d >= startDate && d <= endDate;
        });
        const statusDistribution = {
            DRAFT: 0,
            SUBMITTED: 0,
            UNDER_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            PROCESSING: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };
        this.storeRequests.forEach((sr) => {
            statusDistribution[sr.status] = (statusDistribution[sr.status] || 0) + 1;
        });
        const deptMap = {};
        DEPARTMENTS.forEach((d) => {
            deptMap[d.name] = { count: 0, approved: 0 };
        });
        this.storeRequests.forEach((sr) => {
            if (!deptMap[sr.departmentName]) {
                deptMap[sr.departmentName] = { count: 0, approved: 0 };
            }
            deptMap[sr.departmentName].count += 1;
            if (sr.status === 'APPROVED' || sr.status === 'COMPLETED') {
                deptMap[sr.departmentName].approved += 1;
            }
        });
        const departmentBreakdown = Object.entries(deptMap).map(([dept, val]) => ({
            department: dept,
            count: val.count,
            approved: val.approved,
        }));
        const catMap = {};
        this.categories.forEach((c) => {
            catMap[c.name] = { count: 0, totalQty: 0 };
        });
        this.items.forEach((item) => {
            const cat = item.categoryName || 'Other';
            if (!catMap[cat])
                catMap[cat] = { count: 0, totalQty: 0 };
            catMap[cat].count += 1;
            catMap[cat].totalQty += item.currentStock;
        });
        const categoryBreakdown = Object.entries(catMap).map(([cat, val]) => ({
            category: cat,
            count: val.count,
            totalQty: val.totalQty,
        }));
        const lowStockItems = this.items.filter((i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK');
        const completedReceivings = this.storeRequests.filter((sr) => sr.receiving && sr.receiving.status === 'COMPLETED');
        let totalReceivedQty = 0;
        completedReceivings.forEach((sr) => {
            sr.receiving?.items.forEach((it) => {
                totalReceivedQty += it.quantityReceived;
            });
        });
        const reportNumber = `RPT-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        const report = {
            periodType,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            generatedBy: this.currentUser?.name || 'Ramzi Wafi (Supervisor)',
            reportNumber,
            totalStoreRequests: this.storeRequests.length,
            approvedStoreRequests: this.storeRequests.filter((s) => s.status === 'APPROVED' || s.status === 'COMPLETED').length,
            rejectedStoreRequests: this.storeRequests.filter((s) => s.status === 'REJECTED').length,
            completedReceivingCount: completedReceivings.length,
            totalReceivedItemsQuantity: totalReceivedQty,
            lowStockItemsCount: this.items.filter((i) => i.status === 'LOW_STOCK').length,
            outOfStockItemsCount: this.items.filter((i) => i.status === 'OUT_OF_STOCK').length,
            totalInventoryItems: this.items.length,
            totalStockMovements: this.stockMovements.length,
            departmentBreakdown,
            categoryBreakdown,
            statusDistribution,
            recentReceivings: completedReceivings.map((s) => s.receiving),
            lowStockItems,
        };
        this.logAudit('GENERATE_REPORT', `Generated ${periodType.toUpperCase()} global report #${reportNumber}`, 'Report', reportNumber);
        return report;
    }
}
export const storeService = new StoreService();
