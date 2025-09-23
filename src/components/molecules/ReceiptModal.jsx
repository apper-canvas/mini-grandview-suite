import React from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const ReceiptModal = ({ isOpen, onClose, payment, onGenerateInvoice }) => {
  if (!isOpen || !payment) return null;

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const subtotal = payment.items?.reduce((sum, item) => sum + item.amount, 0) || payment.amount;
  const tax = subtotal * 0.1; // 10% tax
  const total = payment.amount;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Receipt" size={20} className="text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Payment Receipt</h3>
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
        
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-slate-900">GrandView Suite Hotel</h2>
            <p className="text-sm text-slate-600">123 Resort Boulevard, Paradise City</p>
            <p className="text-sm text-slate-600">Phone: (555) 123-4567</p>
          </div>

          {/* Transaction Info */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Transaction ID:</span>
              <span className="text-sm font-mono text-slate-900">{payment.transactionId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Date & Time:</span>
              <span className="text-sm text-slate-900">{formatDate(payment.processedAt)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              <Badge variant={getStatusBadgeVariant(payment.status)}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Guest Info */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <h4 className="font-medium text-slate-900">Guest Information</h4>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Guest Name:</span>
              <span className="text-sm text-slate-900">{payment.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Room Number:</span>
              <span className="text-sm text-slate-900">{payment.roomNumber}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <h4 className="font-medium text-slate-900">Payment Method</h4>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <ApperIcon name="CreditCard" size={16} className="text-slate-500" />
                <span className="text-sm text-slate-900">
                  {payment.cardBrand} •••• {payment.cardLastFour}
                </span>
              </div>
              <span className="text-sm text-slate-900">
                ${payment.amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Itemized Charges */}
          {payment.items && payment.items.length > 0 && (
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="font-medium text-slate-900">Itemized Charges</h4>
              <div className="space-y-2">
                {payment.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.description}</span>
                    <span className="text-slate-900">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (10%):</span>
                  <span className="text-slate-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-slate-200 pt-1">
                  <span className="text-slate-900">Total:</span>
                  <span className="text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
            <p>Thank you for choosing GrandView Suite Hotel</p>
            <p>For questions regarding this receipt, please contact our front desk</p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onGenerateInvoice}
              className="flex-1"
            >
              <ApperIcon name="FileText" size={16} className="mr-2" />
              Generate Invoice
            </Button>
            <Button
              variant="primary"
              onClick={() => window.print()}
              className="flex-1"
            >
              <ApperIcon name="Printer" size={16} className="mr-2" />
              Print Receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptModal;