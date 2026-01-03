import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useStock } from "../../context/stockContext";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function InvoicePage() {
  const { id } = useParams();
  const location = useLocation();
  const { getById } = useStock();
  const invoiceRef = useRef();

  const [sale, setSale] = useState(location.state?.sale || null);
  const [loading, setLoading] = useState(!location.state?.sale);

  // Customer Info
  const [customer, setCustomer] = useState({
    name: sale?.customerName || "Walk-in Customer",
    phone: sale?.customerPhone || "-",
    tin: sale?.customerTIN || "-",
  });

  // Layout: 'A4', 'X58', 'X80'
  const [layout, setLayout] = useState("A4");

  useEffect(() => {
    if (sale) return;

    setLoading(true);
    getById("sales", id)
      .then(setSale)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, sale, getById]);

  if (loading) return <div className="p-4">Loading invoice...</div>;
  if (!sale) return <div className="p-4 text-red-600">Invoice not found</div>;

  // Ensure safe number conversion
  const n = (v) => Number(v) || 0;

  // Prepare items: use sale.items if present, fallback to single-item
  const items =
    sale.items && sale.items.length > 0
      ? sale.items.map((item) => ({
          productName: item.productName || "N/A",
          description: item.description || "",
          quantity: n(item.quantity),
          unit: item.unit || "Kg",
          unitPrice: n(item.unitPrice),
          discount: n(item.discount),
          tax: n(item.tax),
          totalPrice: n(item.totalPrice),
        }))
      : [
          {
            productName: sale.productName || "N/A",
            description: sale.description || "",
            quantity: n(sale.quantity),
            unit: sale.unit || "Kg",
            unitPrice: n(sale.unitPrice),
            discount: n(sale.discount),
            tax: n(sale.tax),
            totalPrice: n(sale.totalPrice),
          },
        ];

  // Totals
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const totalDiscount = items.reduce((acc, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDisc = item.discount > 1 ? item.discount : itemSubtotal * (item.discount / 100);
    return acc + itemDisc;
  }, 0);
  const totalVAT = items.reduce((acc, item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDisc = item.discount > 1 ? item.discount : itemSubtotal * (item.discount / 100);
    const vat = (itemSubtotal - itemDisc) * (item.tax / 100);
    return acc + vat;
  }, 0);
  const totalPrice = subtotal - totalDiscount + totalVAT;

  const savePDF = async () => {
    if (!invoiceRef.current) return;
    const el = invoiceRef.current;
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf =
      layout === "A4"
        ? new jsPDF("p", "mm", "a4")
        : new jsPDF("p", "mm", [layout === "X58" ? 58 : 80, 200]);

    pdf.addImage(
      img,
      "PNG",
      0,
      0,
      layout === "A4" ? 210 : layout === "X58" ? 58 : 80,
      undefined
    );
    pdf.save(`invoice-${sale.id}.pdf`);
  };

  const emailInvoice = () => {
    alert("Email invoice functionality requires backend server setup.");
  };

  return (
    <div className="flex justify-center p-4 bg-gray-100 min-h-screen">
      <div
        ref={invoiceRef}
        className={`bg-white font-mono text-sm p-4`}
        style={{
          width: layout === "A4" ? "210mm" : layout === "X58" ? "58mm" : "80mm",
        }}
      >
        {/* Company Header */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="Company Logo" className="mx-auto w-16 h-16" />
          <h2 className="font-bold text-lg">My Company Ltd</h2>
          <p className="text-xs">123 Kigali Street, Rwanda | VAT No: 123456789</p>
        </div>

        <hr className="mb-2" />

        {/* Invoice & Customer Info */}
        <div className="mb-2 text-xs">
          <p>
            <strong>Invoice No:</strong> {sale.id}
          </p>
          <p>
            <strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Customer:</strong> {customer.name}
          </p>
          <p>
            <strong>Phone:</strong> {customer.phone || "-"}
          </p>
          <p>
            <strong>TIN:</strong> {customer.tin || "-"}
          </p>
        </div>

        <hr className="mb-2" />

        {/* Items Table */}
        <div className="mb-2 text-xs">
          {items.map((item, index) => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemDiscount = item.discount > 1 ? item.discount : itemSubtotal * (item.discount / 100);
            const itemVAT = (itemSubtotal - itemDiscount) * (item.tax / 100);
            const itemTotal = itemSubtotal - itemDiscount + itemVAT;

            return (
              <div key={index} className="mb-2 border-b pb-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Item:</span>
                  <span>{item.productName}</span>
                </div>
                {item.description && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Description:</span>
                    <span>{item.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-semibold">Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Unit:</span>
                  <span>{item.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Price:</span>
                  <span>{item.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Discount:</span>
                  <span>{itemDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">VAT:</span>
                  <span>{itemVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>{itemTotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <hr className="mb-2" />

        {/* Totals */}
        <div className="text-right text-sm font-bold">
          <p>Subtotal: {subtotal.toFixed(2)}</p>
          <p>Discount: {totalDiscount.toFixed(2)}</p>
          <p>VAT: {totalVAT.toFixed(2)}</p>
          <p>Total: {totalPrice.toFixed(2)}</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center my-2">
          <QRCode size={80} value={`Invoice:${sale.id}|Total:${totalPrice.toFixed(2)}`} />
        </div>

        <p className="text-center text-xs mt-1">Thank you for your business 🇷🇼</p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-2 mt-2 no-print">
          <button onClick={() => window.print()} className="bg-green-600 text-white px-2 py-1 rounded">
            Print
          </button>
          <button onClick={savePDF} className="bg-blue-600 text-white px-2 py-1 rounded">
            PDF
          </button>
          <button onClick={emailInvoice} className="bg-purple-600 text-white px-2 py-1 rounded">
            Email
          </button>
        </div>
      </div>
    </div>
  );
}
