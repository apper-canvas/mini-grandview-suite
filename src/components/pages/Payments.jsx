import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import paymentService from "@/services/api/paymentService";
import PaymentModal from "@/components/molecules/PaymentModal";
import ReceiptModal from "@/components/molecules/ReceiptModal";
import InvoiceModal from "@/components/molecules/InvoiceModal";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPaymentsData();
  }, []);

  const loadPaymentsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getAll(),
        paymentService.getStats()
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payments data:', error);
      setError('Failed to load payments data');
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (paymentData) => {
    try {
      const result = await paymentService.processPayment(paymentData);
      toast.success('Payment processed successfully!');
      
      // Refresh data
      await loadPaymentsData();
      
      return result;
    } catch (error) {
      console.error('Payment processing error:', error);
      throw error;
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleGenerateInvoice = () => {
    setShowReceiptModal(false);
    setShowInvoiceModal(true);
  };

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

const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card': return 'CreditCard';
      case 'cash': return 'Banknote';
      case 'upi': return 'Smartphone';
      default: return 'DollarSign';
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
            Payment Management
          </h1>
          <div className="flex items-center space-x-2 text-sm text-secondary">
            <ApperIcon name="Home" size={14} />
            <span>Dashboard</span>
            <ApperIcon name="ChevronRight" size={14} />
            <span className="text-slate-900 font-medium">Payments</span>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <ApperIcon name="AlertCircle" size={48} className="text-error mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to Load Payments</h3>
            <p className="text-secondary mb-4">{error}</p>
            <Button onClick={loadPaymentsData}>
              <ApperIcon name="RefreshCw" size={16} className="mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 gradient-text mb-2">
              Payment Management
            </h1>
            <div className="flex items-center space-x-2 text-sm text-secondary">
              <ApperIcon name="Home" size={14} />
              <span>Dashboard</span>
              <ApperIcon name="ChevronRight" size={14} />
              <span className="text-slate-900 font-medium">Payments</span>
            </div>
          </div>
          
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" size={16} />
            <span>Process Payment</span>
          </Button>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${stats.totalRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-success">All time</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-success/10 to-emerald-100 flex items-center justify-center">
                <ApperIcon name="TrendingUp" size={24} className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Today's Revenue</p>
                <p className="text-2xl font-bold text-slate-900">${stats.todaysRevenue?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-primary">{stats.todaysTransactions || 0} transactions</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center">
                <ApperIcon name="DollarSign" size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions || 0}</p>
                <p className="text-xs text-accent">Completed payments</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-accent/10 to-yellow-100 flex items-center justify-center">
                <ApperIcon name="CreditCard" size={24} className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">Pending Payments</p>
                <p className="text-2xl font-bold text-slate-900">{stats.pendingPayments || 0}</p>
                <p className="text-xs text-warning">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-warning/10 to-yellow-100 flex items-center justify-center">
                <ApperIcon name="Clock" size={24} className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Receipt" className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadPaymentsData}
              >
                <ApperIcon name="RefreshCw" size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-primary/10 to-blue-100 flex items-center justify-center mb-4">
                <ApperIcon name="CreditCard" className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Payments Found</h3>
              <p className="text-secondary max-w-md mx-auto mb-4">
                Start processing payments to see transaction history here.
              </p>
              <Button onClick={() => setShowPaymentModal(true)}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Process First Payment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 font-medium text-secondary">Transaction</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Guest</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Amount</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Method</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.Id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => handleViewReceipt(payment)}
                    >
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="font-mono text-sm text-slate-900">{payment.transactionId}</span>
                          <span className="text-xs text-secondary">Room {payment.roomNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-medium text-slate-900">{payment.guestName}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-semibold text-slate-900">${payment.amount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name={getPaymentMethodIcon(payment.method)} size={16} className="text-slate-500" />
                          <span className="text-slate-600 capitalize">
                            {payment.cardBrand} •••• {payment.cardLastFour}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm text-slate-600">{formatDate(payment.processedAt)}</span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReceipt(payment);
                          }}
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handleProcessPayment}
      />
      
      <ReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        payment={selectedPayment}
        onGenerateInvoice={handleGenerateInvoice}
      />
      
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        payment={selectedPayment}
      />
    </div>
  );
};

export default Payments;