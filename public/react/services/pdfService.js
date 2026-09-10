import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
export const pdfService = {
    // Generate A4 PDF for Receiving Slip (Surat Penerimaan Barang)
    exportReceivingSlipPDF(receiving, storeRequest) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        // Header Background Accent Bar
        doc.setFillColor(3, 4, 94);
        doc.rect(14, 12, 182, 4, 'F');
        // Title & Branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(3, 4, 94);
        doc.text('STORA', 14, 24);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('STORE & RECEIVING MANAGEMENT SYSTEM', 14, 29);
        doc.text('Berita Acara & Surat Penerimaan Barang (RCV)', 14, 33);
        // Document Title Box on Right
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(118, 18, 78, 17, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 119, 182);
        doc.text('SURAT PENERIMAAN BARANG', 121, 24);
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`RCV #: ${receiving.receivingNumber}`, 121, 30);
        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 196, 38);
        // Metadata Grid
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('No. Store Request:', 14, 45);
        doc.text('Departemen:', 14, 51);
        doc.text('Petugas Penerima:', 14, 57);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(receiving.storeRequestNumber, 48, 45);
        doc.text(storeRequest?.departmentName || 'Gudang & Logistik', 48, 51);
        doc.text(receiving.receivedByName, 48, 57);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Tanggal Terima:', 115, 45);
        doc.text('Status QA:', 115, 51);
        doc.text('Supervisor Disetujui:', 115, 57);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(receiving.receivingDate || receiving.createdAt.split('T')[0], 150, 45);
        doc.text('Lengkap & Terverifikasi', 150, 51);
        doc.text(storeRequest?.approval?.approvedByName || 'Ramzi Wafi', 150, 57);
        // Items Table
        const tableRows = receiving.items.map((it, idx) => [
            (idx + 1).toString(),
            it.itemName,
            (it.quantityReceived || 0).toString(),
            it.unit || 'Unit',
            it.condition || 'Baik / Tersegel',
            it.notes || 'Pemeriksaan fisik sesuai standar gudang',
        ]);
        autoTable(doc, {
            startY: 65,
            head: [['#', 'Nama Barang', 'Qty Diterima', 'Satuan', 'Kondisi Fisik', 'Catatan / Batch']],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [3, 4, 94],
                textColor: [255, 255, 255],
                fontSize: 8.5,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [30, 41, 59],
            },
        });
        const finalY = doc.lastAutoTable.finalY + 10;
        if (receiving.notes) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text('Catatan Pemeriksaan:', 14, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(receiving.notes, 14, finalY + 5);
        }
        const signY = Math.max(finalY + 20, 215);
        // Box 1: Receiver
        doc.setDrawColor(203, 213, 225);
        doc.rect(14, signY, 55, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('PETUGAS PENERIMA (QA)', 18, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Officer:', 18, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(receiving.receivedByName, 18, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Tanggal: ' + (receiving.receivingDate || receiving.createdAt.split('T')[0]), 18, signY + 22);
        doc.line(18, signY + 36, 62, signY + 36);
        doc.setFontSize(7);
        doc.text('Tanda Tangan & Cap Gudang', 18, signY + 40);
        // Box 2: Supervisor
        doc.rect(74, signY, 55, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('SUPERVISOR GUDANG', 78, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Supervisor:', 78, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(storeRequest?.approval?.approvedByName || 'Ramzi Wafi', 78, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Status: Disetujui & Valid', 78, signY + 22);
        doc.line(78, signY + 36, 122, signY + 36);
        doc.setFontSize(7);
        doc.text('Tanda Tangan & Verifikasi', 78, signY + 40);
        doc.save(`STORA_${receiving.receivingNumber}.pdf`);
    },
    // Generate A4 PDF for Store Request
    exportStoreRequestPDF(sr) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        // Primary Brand Colors
        const darkPrimary = [3, 4, 94]; // #03045E
        const primary = [0, 119, 182]; // #0077B6
        // Header Background Accent Bar
        doc.setFillColor(3, 4, 94);
        doc.rect(14, 12, 182, 4, 'F');
        // Title & Branding
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(3, 4, 94);
        doc.text('STORA', 14, 24);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('STORE & RECEIVING MANAGEMENT SYSTEM', 14, 29);
        doc.text('ISO 9001:2015 Controlled Inventory Document', 14, 33);
        // Document Title Box on Right
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(125, 18, 71, 17, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(0, 119, 182);
        doc.text('OFFICIAL STORE REQUEST', 128, 24);
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`SR #: ${sr.srNumber}`, 128, 30);
        // Divider
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 196, 38);
        // Metadata Grid
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Department:', 14, 45);
        doc.text('Requester:', 14, 51);
        doc.text('Request Date:', 14, 57);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(sr.departmentName, 42, 45);
        doc.text(sr.requesterName, 42, 51);
        doc.text(sr.requestDate, 42, 57);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Required Date:', 115, 45);
        doc.text('Status:', 115, 51);
        doc.text('Approved By:', 115, 57);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(sr.requiredDate, 145, 45);
        doc.text(sr.status, 145, 51);
        doc.text(sr.approval?.approvedByName || (sr.status === 'REJECTED' ? 'REJECTED' : 'Pending'), 145, 57);
        // Purpose Box
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text('Purpose / Justification:', 14, 65);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 41, 59);
        const splitPurpose = doc.splitTextToSize(sr.purpose, 180);
        doc.text(splitPurpose, 14, 70);
        let nextY = 74 + splitPurpose.length * 4;
        // Items Table
        const tableRows = sr.items.map((it, idx) => [
            (idx + 1).toString(),
            it.itemCode,
            it.itemName,
            it.categoryName,
            it.quantityRequested.toString(),
            it.unit,
            it.notes || '-',
        ]);
        autoTable(doc, {
            startY: nextY,
            head: [['#', 'Item Code', 'Item Description', 'Category', 'Qty Req.', 'Unit', 'Remarks']],
            body: tableRows,
            theme: 'grid',
            headStyles: {
                fillColor: [3, 4, 94],
                textColor: [255, 255, 255],
                fontSize: 8.5,
                fontStyle: 'bold',
            },
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: [30, 41, 59],
            },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 26 },
                2: { cellWidth: 55 },
                3: { cellWidth: 32 },
                4: { cellWidth: 18, halign: 'center' },
                5: { cellWidth: 15, halign: 'center' },
                6: { cellWidth: 28 },
            },
        });
        const finalY = doc.lastAutoTable.finalY + 12;
        // Approval / Receiving Status Notes
        if (sr.approval?.comments) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.text('Supervisor Notes / Decision Comments:', 14, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(sr.approval.comments, 14, finalY + 5);
        }
        else if (sr.approval?.rejectionReason) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(220, 38, 38);
            doc.text('Rejection Reason:', 14, finalY);
            doc.setFont('helvetica', 'normal');
            doc.text(sr.approval.rejectionReason, 14, finalY + 5);
            doc.setTextColor(30, 41, 59);
        }
        // Official Signature Section
        const signY = Math.max(finalY + 20, 220);
        // Box 1: Requested By
        doc.setDrawColor(203, 213, 225);
        doc.rect(14, signY, 55, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('REQUESTED BY', 18, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Department Admin:', 18, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(sr.requesterName, 18, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + sr.requestDate, 18, signY + 22);
        doc.line(18, signY + 36, 62, signY + 36);
        doc.setFontSize(7);
        doc.text('Signature & Stamp', 18, signY + 40);
        // Box 2: Verified & Approved By (Supervisor)
        doc.rect(74, signY, 55, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('APPROVED BY', 78, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Supervisor:', 78, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(sr.approval?.approvedByName || 'Receiving Supervisor', 78, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + (sr.approval?.approvedAt?.substring(0, 10) || '__________________'), 78, signY + 22);
        doc.line(78, signY + 36, 122, signY + 36);
        doc.setFontSize(7);
        doc.text('Official Supervisor Signature', 78, signY + 40);
        // Box 3: Goods Received / Issued By (Officer)
        doc.rect(134, signY, 55, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('RECEIVED / DISPATCHED BY', 138, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Officer:', 138, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(sr.receiving?.receivedByName || 'Receiving Officer', 138, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + (sr.receiving?.receivingDate || '__________________'), 138, signY + 22);
        doc.line(138, signY + 36, 182, signY + 36);
        doc.setFontSize(7);
        doc.text('Warehouse Gate Pass Signature', 138, signY + 40);
        // Footer
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('STORA v1.0 — Store & Receiving Management System | Generated on ' + new Date().toISOString(), 14, 285);
        doc.text('Page 1 of 1', 180, 285);
        doc.save(`STORA_${sr.srNumber}.pdf`);
    },
    // Generate A4 PDF for Summary Reports
    exportReportPDF(report) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        // Header bar
        doc.setFillColor(3, 4, 94);
        doc.rect(14, 12, 182, 4, 'F');
        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(3, 4, 94);
        doc.text('STORA', 14, 24);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('STORE & RECEIVING MANAGEMENT SYSTEM', 14, 29);
        doc.text('Official Executive Inventory & Receiving Audit Report', 14, 33);
        // Report Meta Box
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(120, 18, 76, 18, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 119, 182);
        doc.text(`${report.periodType.toUpperCase()} SUMMARY REPORT`, 123, 24);
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`Ref: ${report.reportNumber} | Period: ${report.startDate} to ${report.endDate}`, 123, 30);
        doc.text(`Prepared By: ${report.generatedBy}`, 123, 34);
        // Summary Metric Cards
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 40, 196, 40);
        const metrics = [
            { label: 'Total Requests', val: report.totalStoreRequests.toString() },
            { label: 'Approved SR', val: report.approvedStoreRequests.toString() },
            { label: 'Rejected SR', val: report.rejectedStoreRequests.toString() },
            { label: 'Completed RCV', val: report.completedReceivingCount.toString() },
            { label: 'Items Catalog', val: report.totalInventoryItems.toString() },
            { label: 'Low / Out Stock', val: `${report.lowStockItemsCount} / ${report.outOfStockItemsCount}` },
        ];
        metrics.forEach((m, idx) => {
            const x = 14 + (idx % 3) * 62;
            const y = 44 + Math.floor(idx / 3) * 16;
            doc.setFillColor(248, 250, 252);
            doc.rect(x, y, 58, 13, 'F');
            doc.setDrawColor(226, 232, 240);
            doc.rect(x, y, 58, 13, 'S');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(100, 116, 139);
            doc.text(m.label.toUpperCase(), x + 4, y + 5);
            doc.setFontSize(11);
            doc.setTextColor(3, 4, 94);
            doc.text(m.val, x + 4, y + 10.5);
        });
        // Table 1: Department Breakdown
        const deptRows = report.departmentBreakdown.map((d) => [d.department, d.count.toString(), d.approved.toString()]);
        autoTable(doc, {
            startY: 80,
            head: [['Department Name', 'Total Requests', 'Approved Requests']],
            body: deptRows,
            theme: 'grid',
            headStyles: {
                fillColor: [3, 4, 94],
                textColor: [255, 255, 255],
                fontSize: 8,
            },
            styles: { fontSize: 7.5, cellPadding: 2 },
        });
        const nextY1 = doc.lastAutoTable.finalY + 6;
        // Table 2: Low Stock & Critical Items
        if (report.lowStockItems.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.setTextColor(185, 28, 28);
            doc.text('CRITICAL / LOW STOCK INVENTORY ITEMS', 14, nextY1);
            const stockRows = report.lowStockItems.map((item) => [
                item.itemCode,
                item.itemName,
                item.categoryName || '-',
                item.currentStock.toString(),
                item.minimumStock.toString(),
                item.unit,
                item.status,
            ]);
            autoTable(doc, {
                startY: nextY1 + 2,
                head: [['Code', 'Item Name', 'Category', 'Current', 'Min Threshold', 'Unit', 'Status']],
                body: stockRows,
                theme: 'grid',
                headStyles: {
                    fillColor: [185, 28, 28],
                    textColor: [255, 255, 255],
                    fontSize: 7.5,
                },
                styles: { fontSize: 7, cellPadding: 2 },
            });
        }
        // Signature Area at bottom
        const signY = 230;
        doc.setDrawColor(203, 213, 225);
        doc.rect(14, signY, 85, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text('REPORT PREPARED BY', 18, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Store & Inventory Coordinator:', 18, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text(report.generatedBy, 18, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ' + report.generatedAt.substring(0, 10), 18, signY + 22);
        doc.line(18, signY + 36, 80, signY + 36);
        doc.setFontSize(7);
        doc.text('Coordinator Signature', 18, signY + 40);
        doc.rect(111, signY, 85, 45);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('VERIFIED & AUDITED BY', 115, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Supervisor (Executive Sign-Off):', 115, signY + 12);
        doc.setFont('helvetica', 'bold');
        doc.text('Ramzi Wafi', 115, signY + 17);
        doc.setFont('helvetica', 'normal');
        doc.text('Date: ________________________', 115, signY + 22);
        doc.line(115, signY + 36, 177, signY + 36);
        doc.setFontSize(7);
        doc.text('Official Supervisor Signature', 115, signY + 40);
        // Footer
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`STORA Enterprise Inventory System — Generated ${report.generatedAt}`, 14, 285);
        doc.text('Page 1 of 1', 180, 285);
        doc.save(`STORA_${report.reportNumber}.pdf`);
    },
    // Generate A4 PDF for Inventory Stock Report
    exportInventoryReportPDF(items) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        // Header bar
        doc.setFillColor(3, 4, 94);
        doc.rect(14, 12, 182, 4, 'F');
        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(3, 4, 94);
        doc.text('STORA', 14, 24);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('STORE & RECEIVING MANAGEMENT SYSTEM', 14, 29);
        doc.text('ISO 9001:2015 Warehouse Stock Audit & Valuation Report', 14, 33);
        // Box
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(120, 18, 76, 17, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 119, 182);
        doc.text('INVENTORY STOCK AUDIT', 123, 24);
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`Generated: ${new Date().toISOString().substring(0, 10)}`, 123, 30);
        const stockRows = items.map((item, idx) => [
            (idx + 1).toString(),
            item.itemCode,
            item.itemName,
            item.categoryName,
            `${item.currentStock} ${item.unit}`,
            `${item.minimumStock} ${item.unit}`,
            item.location,
            item.status,
        ]);
        autoTable(doc, {
            startY: 42,
            head: [['#', 'Item Code', 'Item Description', 'Category', 'Stock Qty', 'Min Threshold', 'Location', 'Status']],
            body: stockRows,
            theme: 'grid',
            headStyles: {
                fillColor: [3, 4, 94],
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
            },
            styles: { fontSize: 7.5, cellPadding: 2.5 },
        });
        const signY = Math.max(doc.lastAutoTable.finalY + 15, 235);
        doc.setDrawColor(203, 213, 225);
        doc.rect(14, signY, 85, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('AUDITED BY', 18, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Warehouse Stock Controller', 18, signY + 12);
        doc.line(18, signY + 30, 80, signY + 30);
        doc.setFontSize(7);
        doc.text('Signature & Date', 18, signY + 35);
        doc.rect(111, signY, 85, 40);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('APPROVED BY', 115, signY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text('Receiving Supervisor (Ramzi Wafi)', 115, signY + 12);
        doc.line(115, signY + 30, 177, signY + 30);
        doc.setFontSize(7);
        doc.text('Supervisor Verification', 115, signY + 35);
        doc.save(`STORA_Inventory_Audit_${new Date().toISOString().substring(0, 10)}.pdf`);
    },
    // Generate A4 PDF for Monthly Store Requests
    exportMonthlyStoreRequestsPDF(storeRequests, period) {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
        doc.setFillColor(3, 4, 94);
        doc.rect(14, 12, 182, 4, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(3, 4, 94);
        doc.text('STORA', 14, 24);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text('STORE & RECEIVING MANAGEMENT SYSTEM', 14, 29);
        doc.text('Monthly Requisitions & Store Requests Summary', 14, 33);
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(120, 18, 76, 17, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 119, 182);
        doc.text('MONTHLY SR REPORT', 123, 24);
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`Period: ${period} | Count: ${storeRequests.length}`, 123, 30);
        const rows = storeRequests.map((sr, idx) => [
            (idx + 1).toString(),
            sr.srNumber,
            sr.departmentName,
            sr.requesterName,
            sr.requestDate,
            sr.requiredDate,
            sr.items.length.toString(),
            sr.status,
        ]);
        autoTable(doc, {
            startY: 42,
            head: [['#', 'SR Number', 'Department', 'Requester', 'Date', 'Required', 'Items', 'Status']],
            body: rows,
            theme: 'grid',
            headStyles: {
                fillColor: [3, 4, 94],
                textColor: [255, 255, 255],
                fontSize: 8,
            },
            styles: { fontSize: 7.5, cellPadding: 2.5 },
        });
        doc.save(`STORA_Monthly_SR_${period}.pdf`);
    },
    // Print using native browser print dialog
    printCurrentView() {
        window.print();
    },
};
