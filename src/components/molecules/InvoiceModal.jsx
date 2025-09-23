import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const InvoiceModal = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMMM dd, yyyy');
  };

  const invoiceNumber = `INV-${payment.transactionId.split('_').pop()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const subtotal = payment.items?.reduce((sum, item) => sum + item.amount, 0) || payment.amount;
  const tax = subtotal * 0.1;
  const total = payment.amount;

  const handleEmailInvoice = () => {
    // Simulate email functionality
    navigator.clipboard.writeText(`Invoice ${invoiceNumber} for ${payment.guestName}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="FileText" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Invoice</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-8 w-8"
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Invoice #:</strong> {invoiceNumber}</p>
                <p><strong>Issue Date:</strong> {formatDate(payment.processedAt)}</p>
                <p><strong>Due Date:</strong> {formatDate(dueDate)}</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-4 rounded-lg">
                <h2 className="text-xl font-bold">GrandView Suite</h2>
                <p className="text-sm opacity-90">Luxury Hotel Experience</p>
              </div>
            </div>
          </div>

          {/* Company & Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* From */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">From:</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-900">GrandView Suite Hotel</p>
                <p>123 Resort Boulevard</p>
                <p>Paradise City, PC 12345</p>
                <p>Phone: (555) 123-4567</p>
                <p>Email: billing@grandviewsuite.com</p>
                <p>Tax ID: 12-3456789</p>
              </div>
            </div>
            
            {/* Bill To */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Bill To:</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-medium text-slate-900">{payment.guestName}</p>
                <p>Room {payment.roomNumber}</p>
                <p>GrandView Suite Hotel</p>
                <p>Guest Services</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div>
            <div className="bg-slate-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-slate-900">Payment Method:</p>
                  <p className="text-slate-600">{payment.cardBrand} •••• {payment.cardLastFour}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Transaction ID:</p>
                  <p className="text-slate-600 font-mono">{payment.transactionId}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Status:</p>
                  <p className="text-success font-medium capitalize">{payment.status}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-900">Description</th>
                    <th className="text-right py-3 px-4 font-medium text-slate-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payment.items && payment.items.length > 0 ? (
                    payment.items.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-600">{item.description}</td>
                        <td className="py-3 px-4 text-right text-slate-900">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-4 text-slate-600">Hotel Service Payment</td>
                      <td className="py-3 px-4 text-right text-slate-900">${payment.amount.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (10%):</span>
                <span className="text-slate-900">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-slate-200 pt-2">
                <span className="text-slate-900">Total Amount:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-2">Payment Terms & Conditions</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p>• Payment has been processed and confirmed</p>
              <p>• All charges are final and non-refundable unless otherwise noted</p>
              <p>• For billing inquiries, please contact our front desk</p>
              <p>• Thank you for choosing GrandView Suite Hotel</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-500 border-t border-slate-200 pt-4">
            <p>This is an electronically generated invoice and is valid without signature.</p>
            <p>© 2024 GrandView Suite Hotel. All rights reserved.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1"
            >
              <ApperIcon name="Printer" size={16} className="mr-2" />
              Print Invoice
            </Button>
            <Button
              variant="primary"
              onClick={handleEmailInvoice}
              className="flex-1"
            >
              <ApperIcon name="Mail" size={16} className="mr-2" />
              Email Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceModal;