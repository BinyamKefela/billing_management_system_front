"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuthToken } from "@/app/auth/login/api";
import { toast } from "react-toastify";
import { EyeIcon, PencilIcon, TrashIcon, Plus, CreditCard, DollarSign, Calendar, User, Building, FileText, Search, Filter, Check, Clock, AlertCircle, Download, CheckSquare, Square } from "lucide-react";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// ✅ Zod validation schema for Single Payment
const paymentSchema = z.object({
  bill: z.coerce.number().min(1, "Bill is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'card']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

// ✅ Zod validation schema for Bulk Payment
const bulkPaymentSchema = z.object({
  bill_ids: z.array(z.number()).min(1, "Select at least one bill"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  payment_method: z.enum(['cash', 'bank_transfer', 'mobile_money', 'card']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;
type BulkPaymentFormData = z.infer<typeof bulkPaymentSchema>;

type Payment = {
  id: number;
  bill: number;
  bill_details?: {
    id: number;
    bill_number: string;
    amount: string;
    due_date: string;
    status: string;
    description?: string;
    biller_details?: {
      name: string;
      company_name?: string;
    };
  };
  customer: number;
  amount: string;
  payment_method: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  payment_date: string;
  reference_number?: string;
  notes?: string;
};

type Bill = {
  id: number;
  bill_number: string;
  biller: number;
  biller_details?: {
    name: string;
    company_name?: string;
  };
  amount: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  description?: string;
  total_paid?: string;
  remaining_amount?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [modalType, setModalType] = useState<"add" | "edit" | "view" | "delete" | "bulk" | null>(null);
  const [button_clicked, setButtonClicked] = useState(false);
  const [activeTab, setActiveTab] = useState<"payments" | "bills">("payments");
  const [selectedBills, setSelectedBills] = useState<number[]>([]);

  // Search + Pagination + Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 1000);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    const user_id = Cookies.get("id") ? parseInt(Cookies.get("id") as string, 10) : 0;
    try {
      let url = `${BASE_URL}/get_payments?page=${page}&search=${encodeURIComponent(debouncedSearch)}`;
      if (methodFilter !== "all") {
        url += `&payment_method=${methodFilter}`;
      }
      if(Cookies.get("is_customer") === "true"){
        url += `&customer=${user_id}`;
      }
      if(Cookies.get("is_biller") === "true"){
        url += `&bill__biller__user__id=${user_id}`;
      }

      const res = await fetch(url, {
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getAuthToken()}` 
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        setPayments(data.data || data.results || []);
        setTotalPages(data.total_pages || 1);
      } else {
        toast.error(data.error || "Failed to load payments");
      }
    } catch {
      toast.error("Couldn't fetch payments");
    } finally {
      setLoading(false);
    }
  };

  // Fetch bills for payment
  const fetchBills = async () => {
    const user_id = Cookies.get("id") ? parseInt(Cookies.get("id") as string, 10) : 0;
    try {
      let url = `${BASE_URL}/get_bills?page=${page}&search=${encodeURIComponent(debouncedSearch)}`;
      if (statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      if(Cookies.get("is_customer") === "true"){
        url += `&customer=${user_id}`;
      }
      if(Cookies.get("is_biller") === "true"){
        url += `&biller__user__id=${user_id}`;
      }
      const res = await fetch(url, {
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${getAuthToken()}` 
        },
      });
      const data = await res.json();
      if (res.status === 200) {
        setBills(data.data || data.results || []);
      }
    } catch {
      console.error("Failed to fetch bills");
    }
  };

  useEffect(() => { 
    if (activeTab === "payments") {
      fetchPayments();
    } else {
      fetchBills();
    }
  }, [page, debouncedSearch, methodFilter, statusFilter, activeTab]);

  // ✅ Get bills available for payment (status not "paid")
  const getBillsAvailableForPayment = () => {
    return bills.filter(bill => bill.status !== "paid");
  };

  // ✅ Get bills available for payment with remaining amount
  const getBillsWithRemainingAmount = () => {
    return getBillsAvailableForPayment().filter(bill => getBillPaymentProgress(bill).remainingAmount > 0);
  };

  // ✅ React Hook Form for Single Payment
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'mobile_money',
      bill: 0, // Initialize with 0 instead of undefined
    }
  });

  // ✅ React Hook Form for Bulk Payment
  const { 
    register: registerBulk,
    handleSubmit: handleSubmitBulk, 
    reset: resetBulk, 
    formState: { errors: errorsBulk },
    watch: watchBulk,
    setValue: setValueBulk,
    setError: setErrorBulk,
    clearErrors: clearErrorsBulk
  } = useForm<BulkPaymentFormData>({
    resolver: zodResolver(bulkPaymentSchema),
    defaultValues: {
      payment_method: 'mobile_money',
      bill_ids: [],
    }
  });

  const formValues = watch();
  const formValuesBulk = watchBulk();

  const handleOpen = (type: typeof modalType, payment?: Payment) => {
    console.log("Opening modal:", type);
    setModalType(type);
    setSelected(payment || null);
    
    if (payment) {
      reset({
        bill: payment.bill,
        amount: parseFloat(payment.amount),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number || "",
        notes: payment.notes || "",
      });
    } else {
      reset({
        bill: 0,
        amount: 0,
        payment_method: 'mobile_money',
        reference_number: "",
        notes: "",
      });
    }

    if (type === "bulk") {
      setSelectedBills([]);
      resetBulk({
        payment_method: 'mobile_money',
        bill_ids: [],
        amount: 0,
        reference_number: "",
        notes: "",
      });
      clearErrorsBulk("bill_ids");
    }
  };

  const handleClose = () => { 
    console.log("Closing modal");
    setModalType(null); 
    setSelected(null); 
    setSelectedBills([]);
    reset({}); 
    resetBulk({});
  };

  // ✅ Single Payment Submission
  const onSubmit = async (data: PaymentFormData) => {
    console.log("Single payment form submitted:", data);
    
    // Validate bill selection
    if (!data.bill || data.bill === 0) {
      toast.error("Please select a bill");
      return;
    }

    setButtonClicked(true);
    
    try {
      const submitData = {
        bill: data.bill,
        amount: data.amount,
        payment_method: data.payment_method,
        reference_number: data.reference_number || "",
        notes: data.notes || "",
      };

      console.log("Sending single payment data:", submitData);

      const res = await fetch(BASE_URL + "/post_payment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}` 
        },
        body: JSON.stringify(submitData),
      });
      
      const responseData = await res.json();
      console.log("Single payment response:", responseData);
      
      if (res.status === 201) {
        toast.success("Payment created successfully");
        await fetchPayments();
        await fetchBills();
        handleClose();
      } else {
        toast.error(responseData.error || responseData.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Couldn't create payment");
    } finally { 
      setButtonClicked(false); 
    }
  };

  // ✅ Bulk Payment Submission
  const onSubmitBulk = async (data: BulkPaymentFormData) => {
    console.log("Bulk payment form submitted:", data);
    
    // Validate bill selection
    if (selectedBills.length === 0) {
      setErrorBulk("bill_ids", {
        type: "manual",
        message: "Select at least one bill"
      });
      toast.error("Please select at least one bill");
      return;
    }

    setButtonClicked(true);
    
    try {
      const submitData = {
        bill_ids: selectedBills,
        amount: data.amount,
        payment_method: data.payment_method,
        reference_number: data.reference_number || "",
        notes: data.notes || "",
      };

      console.log("Sending bulk payment data:", submitData);

      const res = await fetch(BASE_URL + "/post_payment_bulk", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}` 
        },
        body: JSON.stringify(submitData),
      });
      
      const responseData = await res.json();
      console.log("Bulk payment response:", responseData);
      
      if (res.status === 201) {
        toast.success(`Successfully created ${responseData.payments?.length || 0} payments`);
        await fetchPayments();
        await fetchBills();
        handleClose();
      } else {
        toast.error(responseData.error || responseData.message || "Failed to create bulk payments");
      }
    } catch (error) {
      console.error("Bulk payment error:", error);
      toast.error("Couldn't process bulk payment");
    } finally { 
      setButtonClicked(false); 
    }
  };

  // ✅ Delete payment
  const handleDelete = async () => {
    if (selected) {
      try {
        const res = await fetch(`${BASE_URL}/delete_payment/${selected.id}`, { 
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        
        if (res.status === 200) {
          toast.success("Payment deleted successfully");
        } else {
          toast.error("Failed to delete payment");
        }
      } catch {
        toast.error("Failed to delete payment");
      }
      
      if (activeTab === "payments") {
        await fetchPayments();
      } else {
        await fetchBills();
      }
      handleClose();
    }
  };

  // 🔢 Pagination buttons
  const getPageNumbers = () => {
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);
    if (page <= 2) end = Math.min(5, totalPages);
    if (page >= totalPages - 1) start = Math.max(totalPages - 4, 1);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);
  };

  // 🎨 Status badge styling for bills
  const getBillStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
      partially_paid: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`;
  };

  // 🎨 Payment method badge styling
  const getPaymentMethodBadge = (method: string) => {
    const styles = {
      cash: "bg-green-100 text-green-800 border-green-200",
      bank_transfer: "bg-blue-100 text-blue-800 border-blue-200",
      mobile_money: "bg-purple-100 text-purple-800 border-purple-200",
      card: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return `px-3 py-1 rounded-full text-xs font-medium border ${styles[method as keyof typeof styles] || styles.cash}`;
  };

  // 💰 Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(parseFloat(amount));
  };

  // 📅 Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // 💳 Get payment method display name
  const getPaymentMethodDisplay = (method: string) => {
    const methods = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      mobile_money: "Mobile Money",
      card: "Card",
    };
    return methods[method as keyof typeof methods] || method;
  };

  // 📊 Calculate bill payment progress
  const getBillPaymentProgress = (bill: Bill) => {
    const totalAmount = parseFloat(bill.amount);
    const paidAmount = parseFloat(bill.total_paid || "0");
    const progress = (paidAmount / totalAmount) * 100;
    return {
      progress: Math.min(progress, 100),
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
    };
  };

  // 💸 Handle quick pay (full amount)
  const handleQuickPay = (bill: Bill) => {
    const { remainingAmount } = getBillPaymentProgress(bill);
    console.log("Quick pay for bill:", bill.id, "Amount:", remainingAmount);
    
    // Reset form first
    reset({
      bill: bill.id,
      amount: remainingAmount,
      payment_method: 'mobile_money',
      reference_number: "",
      notes: "",
    });
    
    handleOpen("add");
  };

  // ✅ Handle bill selection for bulk payment
  const handleBillSelect = (billId: number) => {
    setSelectedBills(prev => {
      const newSelection = prev.includes(billId) 
        ? prev.filter(id => id !== billId)
        : [...prev, billId];
      
      // Update the form value for bill_ids
      setValueBulk("bill_ids", newSelection);
      
      // Clear errors when bills are selected
      if (newSelection.length > 0) {
        clearErrorsBulk("bill_ids");
      }
      
      return newSelection;
    });
  };

  // ✅ Select all bills with remaining amount and status not "paid"
  const handleSelectAll = () => {
    const availableBills = getBillsWithRemainingAmount();
    const allBillIds = availableBills.map(bill => bill.id);
    setSelectedBills(allBillIds);
    setValueBulk("bill_ids", allBillIds);
    clearErrorsBulk("bill_ids");
  };

  // ✅ Clear all selections
  const handleClearAll = () => {
    setSelectedBills([]);
    setValueBulk("bill_ids", []);
    setErrorBulk("bill_ids", {
      type: "manual",
      message: "Select at least one bill"
    });
  };

  // ✅ Calculate total amount for selected bills
  const getTotalSelectedAmount = () => {
    return selectedBills.reduce((total, billId) => {
      const bill = bills.find(b => b.id === billId);
      if (bill) {
        return total + getBillPaymentProgress(bill).remainingAmount;
      }
      return total;
    }, 0);
  };

  // Debug: Check available bills
  console.log("Available bills for payment:", getBillsWithRemainingAmount());
  console.log("Selected bills for bulk payment:", selectedBills);
  console.log("Form values:", formValues);
  console.log("Form errors:", errors);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments & Billing</h1>
                <p className="text-gray-600">Manage your bills and payment history</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleOpen("bulk")}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <CheckSquare className="w-5 h-5" />
                Bulk Pay
              </button>
              <button 
                onClick={() => handleOpen("add")}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Single Pay
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mt-6">
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === "payments"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment History
            </button>
            <button
              onClick={() => setActiveTab("bills")}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === "bills"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="w-4 h-4" />
              My Bills
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder={activeTab === "payments" 
                    ? "Search payments by reference, bill number..." 
                    : "Search bills by number, description..."} 
                  value={search} 
                  onChange={(e) => { 
                    setPage(1); 
                    setSearch(e.target.value); 
                  }} 
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  {activeTab === "payments" ? (
                    <select 
                      value={methodFilter}
                      onChange={(e) => {
                        setPage(1);
                        setMethodFilter(e.target.value);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Methods</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Card</option>
                    </select>
                  ) : (
                    <select 
                      value={statusFilter}
                      onChange={(e) => {
                        setPage(1);
                        setStatusFilter(e.target.value);
                      }}
                      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="partially_paid">Partially Paid</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                              <CreditCard className="w-12 h-12 opacity-50" />
                              <p className="text-lg">No payments found</p>
                              <p className="text-sm">Make your first payment to get started</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment, index) => (
                          <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(page - 1) * 10 + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-green-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {payment.bill_details?.bill_number || `Bill #${payment.bill}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {payment.bill_details?.biller_details?.company_name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={getPaymentMethodBadge(payment.payment_method)}>
                                {getPaymentMethodDisplay(payment.payment_method)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.reference_number || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {formatDate(payment.payment_date)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpen("view", payment)}
                                  className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                                  title="View Payment"
                                >
                                  <EyeIcon size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpen("edit", payment)}
                                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                  title="Edit Payment"
                                >
                                  <PencilIcon size={16} />
                                </button>
                                <button
                                  onClick={() => handleOpen("delete", payment)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                  title="Delete Payment"
                                >
                                  <TrashIcon size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {payments.length > 0 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {payments.length} payments
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={page === 1}
                          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                        >
                          Previous
                        </button>

                        {getPageNumbers().map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                              p === page 
                                ? "bg-green-600 text-white border-green-600" 
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </button>
                        ))}

                        <button
                          disabled={page === totalPages}
                          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                          className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Bills Table */}
        {activeTab === "bills" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Biller</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {bills.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center gap-3 text-gray-500">
                              <FileText className="w-12 h-12 opacity-50" />
                              <p className="text-lg">No bills found</p>
                              <p className="text-sm">All your bills will appear here</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        bills.map((bill, index) => {
                          const { progress, paidAmount, remainingAmount } = getBillPaymentProgress(bill);
                          const isAvailableForPayment = bill.status !== "paid";
                          
                          return (
                            <tr key={bill.id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(page - 1) * 10 + index + 1}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {bill.bill_number}
                                    </p>
                                    {bill.description && (
                                      <p className="text-xs text-gray-500 truncate max-w-xs">
                                        {bill.description}
                                      </p>
                                    )}
                                    {/* Payment Progress */}
                                    {isAvailableForPayment && (
                                      <div className="mt-2">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>Progress: {progress.toFixed(1)}%</span>
                                          <span>{formatCurrency(paidAmount.toString())} of {formatCurrency(bill.amount)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {bill.biller_details?.company_name || bill.biller_details?.name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(bill.amount)}
                                  </span>
                                </div>
                                {isAvailableForPayment && remainingAmount > 0 && (
                                  <p className="text-xs text-red-600 mt-1">
                                    Due: {formatCurrency(remainingAmount.toString())}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-900">
                                    {formatDate(bill.due_date)}
                                  </span>
                                </div>
                                {bill.status === 'overdue' && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                                    <AlertCircle className="w-3 h-3" />
                                    Overdue
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={getBillStatusBadge(bill.status)}>
                                  {bill.status.charAt(0).toUpperCase() + bill.status.slice(1).replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {isAvailableForPayment && remainingAmount > 0 && (
                                    <>
                                      <button
                                        onClick={() => handleQuickPay(bill)}
                                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                                      >
                                        Pay Now
                                      </button>
                                      <button
                                        onClick={() => {
                                          console.log("Custom pay for bill:", bill.id);
                                          setValue("bill", bill.id);
                                          setValue("amount", remainingAmount);
                                          handleOpen("add");
                                        }}
                                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                                      >
                                        Custom Pay
                                      </button>
                                    </>
                                  )}
                                  {bill.status === "paid" && (
                                    <span className="text-xs text-green-600 font-medium">Fully Paid</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Single Payment Modal */}
      {modalType && modalType !== "bulk" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    modalType === 'add' ? 'bg-green-100 text-green-600' :
                    modalType === 'edit' ? 'bg-blue-100 text-blue-600' :
                    modalType === 'view' ? 'bg-purple-100 text-purple-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === "add" ? "Make Payment" :
                     modalType === "edit" ? "Edit Payment" :
                     modalType === "view" ? "Payment Details" : "Delete Payment"}
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* View Modal */}
              {modalType === "view" && selected && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Bill Information</label>
                        <div className="mt-2 space-y-2">
                          <p><span className="font-medium">Bill Number:</span> {selected.bill_details?.bill_number || `Bill #${selected.bill}`}</p>
                          <p><span className="font-medium">Biller:</span> {selected.bill_details?.biller_details?.company_name}</p>
                          {selected.bill_details?.description && (
                            <p><span className="font-medium">Description:</span> {selected.bill_details.description}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Payment Information</label>
                        <div className="mt-2 space-y-2">
                          <p><span className="font-medium">Amount:</span> {formatCurrency(selected.amount)}</p>
                          <p><span className="font-medium">Method:</span> 
                            <span className={getPaymentMethodBadge(selected.payment_method) + " ml-2"}>
                              {getPaymentMethodDisplay(selected.payment_method)}
                            </span>
                          </p>
                          {selected.reference_number && (
                            <p><span className="font-medium">Reference:</span> {selected.reference_number}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Timeline</label>
                        <div className="mt-2 space-y-2">
                          <p><span className="font-medium">Payment Date:</span> {formatDate(selected.payment_date)}</p>
                          {selected.bill_details?.due_date && (
                            <p><span className="font-medium">Due Date:</span> {formatDate(selected.bill_details.due_date)}</p>
                          )}
                        </div>
                      </div>
                      {selected.notes && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Notes</label>
                          <p className="mt-2 text-gray-900 bg-gray-50 p-3 rounded-lg">{selected.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleOpen("edit", selected)}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                      Edit Payment
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* Add/Edit Modal */}
              {(modalType === "add" || modalType === "edit") && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bill Selection */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Select Bill *
                      </label>
                      <select
                        {...register("bill", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="0">Select a bill to pay</option>
                        {getBillsWithRemainingAmount().map((bill) => (
                          <option key={bill.id} value={bill.id}>
                            {bill.bill_number} - {bill.biller_details?.company_name} - 
                            Due: {formatDate(bill.due_date)} - 
                            Remaining: {formatCurrency(getBillPaymentProgress(bill).remainingAmount.toString())}
                          </option>
                        ))}
                      </select>
                      {errors.bill && (
                        <p className="text-red-500 text-sm mt-1">{errors.bill.message}</p>
                      )}
                      {getBillsWithRemainingAmount().length === 0 && (
                        <p className="text-sm text-gray-500 mt-1">No bills available for payment</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <DollarSign className="w-4 h-4" />
                        Amount (ETB) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register("amount", { valueAsNumber: true })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                      {errors.amount && (
                        <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method *
                      </label>
                      <select
                        {...register("payment_method")}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="card">Card</option>
                      </select>
                    </div>

                    {/* Reference Number */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                      <input
                        {...register("reference_number")}
                        placeholder="Transaction reference"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      placeholder="Additional payment notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={button_clicked || getBillsWithRemainingAmount().length === 0}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {button_clicked ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {modalType === "add" ? "Processing Payment..." : "Updating Payment..."}
                      </div>
                    ) : (
                      modalType === "add" ? "Make Payment" : "Update Payment"
                    )}
                  </button>
                </form>
              )}

              {/* Delete Modal */}
              {modalType === "delete" && selected && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrashIcon className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Payment</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this payment of <strong>{formatCurrency(selected.amount)}</strong> 
                    for bill <strong>{selected.bill_details?.bill_number || `Bill #${selected.bill}`}</strong>?
                    This action cannot be undone and will affect the bill status.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleDelete}
                      disabled={button_clicked}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {button_clicked ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Payment Modal */}
      {modalType === "bulk" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Bulk Payment</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitBulk(onSubmitBulk)} className="space-y-6">
                {/* Bill Selection Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Select Bills to Pay ({selectedBills.length} selected)
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                    {getBillsWithRemainingAmount().length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No bills available for payment
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getBillsWithRemainingAmount().map((bill) => {
                          const { remainingAmount } = getBillPaymentProgress(bill);
                          const isSelected = selectedBills.includes(bill.id);
                          
                          return (
                            <label
                              key={bill.id}
                              className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${
                                isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleBillSelect(bill.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {bill.bill_number}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {bill.biller_details?.company_name} • Due: {formatDate(bill.due_date)} • Status: {bill.status}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {formatCurrency(remainingAmount.toString())}
                                    </p>
                                    <p className="text-xs text-gray-500">Remaining</p>
                                  </div>
                                </div>
                                {bill.description && (
                                  <p className="text-xs text-gray-500 mt-1 truncate">
                                    {bill.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {errorsBulk.bill_ids && (
                    <p className="text-red-500 text-sm mt-1">{errorsBulk.bill_ids.message}</p>
                  )}
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Amount per Bill (ETB) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...registerBulk("amount", { valueAsNumber: true })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {errorsBulk.amount && (
                      <p className="text-red-500 text-sm mt-1">{errorsBulk.amount.message}</p>
                    )}
                    {selectedBills.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Total: {formatCurrency((formValuesBulk.amount * selectedBills.length).toString())}
                        {' '}for {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method *
                    </label>
                    <select
                      {...registerBulk("payment_method")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Card</option>
                    </select>
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                    <input
                      {...registerBulk("reference_number")}
                      placeholder="Transaction reference"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    {...registerBulk("notes")}
                    rows={3}
                    placeholder="Additional payment notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={button_clicked || selectedBills.length === 0}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {button_clicked ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing {selectedBills.length} Payments...
                    </div>
                  ) : (
                    `Pay ${selectedBills.length} Bill${selectedBills.length !== 1 ? 's' : ''}`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}