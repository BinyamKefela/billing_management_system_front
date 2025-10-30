"use client";

import { useEffect, useState } from "react";
import { getAuthToken } from "@/app/auth/login/api";
import { toast } from "react-toastify";
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  Bell,
  Building,
  UserCheck,
  Receipt
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type CustomerReportData = {
  total_spent: number;
  biller_spending: Array<{ bill__biller__company_name: string; total: number }>;
  monthly_spending: Array<{ month: string; total: number }>;
  outstanding_payments: {
    total_due: number;
    overdue_count: number;
  };
};

type BillerReportData = {
  total_revenue: number;
  revenue_by_customer: Array<{
    payment__customer__email: string;
    payment__customer__first_name: string;
    payment__customer__last_name: string;
    total_paid: number;
  }>;
  monthly_revenue: Array<{ month: string; total_revenue: number }>;
  outstanding_invoices: {
    total_outstanding: number;
    overdue_invoices: number;
    pending_invoices: number;
    total_unpaid_invoices: number;
  };
  customer_statistics: {
    total_customers: number;
    active_customers: number;
    inactive_customers: number;
  };
  payment_methods: Array<{
    payment__payment_method: string;
    total_amount: number;
    payment_count: number;
  }>;
};

type UserRole = 'customer' | 'biller' | null;

export default function DashboardPage() {
  const [customerData, setCustomerData] = useState<CustomerReportData>({
    total_spent: 0,
    biller_spending: [],
    monthly_spending: [],
    outstanding_payments: { total_due: 0, overdue_count: 0 }
  });
  
  const [billerData, setBillerData] = useState<BillerReportData>({
    total_revenue: 0,
    revenue_by_customer: [],
    monthly_revenue: [],
    outstanding_invoices: {
      total_outstanding: 0,
      overdue_invoices: 0,
      pending_invoices: 0,
      total_unpaid_invoices: 0
    },
    customer_statistics: {
      total_customers: 0,
      active_customers: 0,
      inactive_customers: 0
    },
    payment_methods: []
  });
  
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  const BILLER_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    setIsClient(true);
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    
    if(Cookies.get('is_biller') === 'true'){
      setUserRole('biller');
      fetchBillerData();
    }
    else if(Cookies.get('is_customer') === 'true'){
      setUserRole('customer');
      fetchCustomerData();
    }
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [totalSpendingRes, billerSpendingRes, monthlySpendingRes, outstandingRes] = await Promise.all([
        fetch(`${BASE_URL}/total_spending`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/spending_by_biller`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/monthly_spending`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/outstanding_payments`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        })
      ]);

      const totalSpending = await totalSpendingRes.json();
      const billerSpending = await billerSpendingRes.json();
      const monthlySpending = await monthlySpendingRes.json();
      const outstanding = await outstandingRes.json();

      setCustomerData({
        total_spent: totalSpending.total_spent || 0,
        biller_spending: billerSpending || [],
        monthly_spending: monthlySpending || [],
        outstanding_payments: outstanding || { total_due: 0, overdue_count: 0 }
      });

    } catch (error) {
      toast.error("Failed to load customer dashboard data");
      console.error("Customer dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillerData = async () => {
    setLoading(true);
    try {
      const [
        totalRevenueRes,
        revenueByCustomerRes,
        monthlyRevenueRes,
        outstandingInvoicesRes,
        customerStatsRes,
        paymentMethodsRes
      ] = await Promise.all([
        fetch(`${BASE_URL}/biller/total_revenue`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/biller/revenue_by_customer`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/biller/monthly_revenue`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/biller/outstanding_invoices`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/biller/customer_statistics`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        }),
        fetch(`${BASE_URL}/biller/payment_methods`, {
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${getAuthToken()}` 
          },
        })
      ]);

      const totalRevenue = await totalRevenueRes.json();
      const revenueByCustomer = await revenueByCustomerRes.json();
      const monthlyRevenue = await monthlyRevenueRes.json();
      const outstandingInvoices = await outstandingInvoicesRes.json();
      const customerStats = await customerStatsRes.json();
      const paymentMethods = await paymentMethodsRes.json();

      setBillerData({
        total_revenue: totalRevenue.total_revenue || 0,
        revenue_by_customer: revenueByCustomer || [],
        monthly_revenue: monthlyRevenue || [],
        outstanding_invoices: outstandingInvoices || {
          total_outstanding: 0,
          overdue_invoices: 0,
          pending_invoices: 0,
          total_unpaid_invoices: 0
        },
        customer_statistics: customerStats || {
          total_customers: 0,
          active_customers: 0,
          inactive_customers: 0
        },
        payment_methods: paymentMethods || []
      });

    } catch (error) {
      toast.error("Failed to load biller dashboard data");
      console.error("Biller dashboard data error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format data for customer charts
  const customerBillerChartData = customerData.biller_spending.map((item, index) => ({
    name: item.bill__biller__company_name || 'Unknown Biller',
    value: Number(item.total),
    fill: BILLER_COLORS[index % BILLER_COLORS.length]
  }));

  const customerMonthlyChartData = customerData.monthly_spending.map(item => ({
    month: item.month,
    amount: Number(item.total)
  }));

  const customerSpendingDistributionData = [
    { name: 'Paid', value: Number(customerData.total_spent), fill: '#10B981' },
    { name: 'Due', value: Number(customerData.outstanding_payments.total_due), fill: '#EF4444' }
  ].filter(item => item.value > 0);

  // Format data for biller charts
  const billerRevenueByCustomerData = billerData.revenue_by_customer.slice(0, 6).map((item, index) => ({
    name: item.payment__customer__first_name && item.payment__customer__last_name 
      ? `${item.payment__customer__first_name} ${item.payment__customer__last_name}`
      : item.payment__customer__email,
    value: Number(item.total_paid),
    fill: COLORS[index % COLORS.length]
  }));

  const billerMonthlyRevenueData = billerData.monthly_revenue.map(item => ({
    month: item.month,
    revenue: Number(item.total_revenue)
  }));

  const billerPaymentMethodsData = billerData.payment_methods.map((item, index) => ({
    name: item.payment__payment_method?.replace('_', ' ').toUpperCase() || 'Unknown',
    value: Number(item.total_amount),
    count: item.payment_count,
    fill: COLORS[index % COLORS.length]
  }));

  const billerCustomerStatsData = [
    { name: 'Active', value: billerData.customer_statistics.active_customers, fill: '#10B981' },
    { name: 'Inactive', value: billerData.customer_statistics.inactive_customers, fill: '#6B7280' }
  ].filter(item => item.value > 0);

  const billerOutstandingData = [
    { name: 'Overdue', value: billerData.outstanding_invoices.overdue_invoices, fill: '#EF4444' },
    { name: 'Pending', value: billerData.outstanding_invoices.pending_invoices, fill: '#F59E0B' }
  ].filter(item => item.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const getPaymentMethodDisplay = (method: string) => {
    const methods: { [key: string]: string } = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      mobile_money: "Mobile Money",
      card: "Card",
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2">Welcome to your billing management dashboard</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  if (userRole === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your billing and payments</p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Spending Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Spending
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customerData.total_spent)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All time payments
                </p>
              </CardContent>
            </Card>

            {/* Outstanding Payments Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Outstanding Balance
                </CardTitle>
                <CreditCard className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customerData.outstanding_payments.total_due)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {customerData.outstanding_payments.overdue_count} overdue bills
                </p>
              </CardContent>
            </Card>

            {/* Overdue Bills Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Overdue Bills
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {customerData.outstanding_payments.overdue_count}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            {/* Active Billers Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Billers
                </CardTitle>
                <Building className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {customerData.biller_spending.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Service providers
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Spending Trend */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Monthly Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customerMonthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickFormatter={(value) => `ETB ${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Amount']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill="#4F46E5" 
                        radius={[4, 4, 0, 0]}
                        name="Spending"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Spending by Biller */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Spending by Biller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerBillerChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerBillerChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Distribution */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Payment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSpendingDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerSpendingDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Biller Dashboard
  if (userRole === 'biller') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Biller Dashboard</h1>
            <p className="text-gray-600 mt-2">Business overview and revenue analytics</p>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billerData.total_revenue)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All time collected
                </p>
              </CardContent>
            </Card>

            {/* Outstanding Invoices Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Outstanding Invoices
                </CardTitle>
                <Receipt className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billerData.outstanding_invoices.total_outstanding)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {billerData.outstanding_invoices.total_unpaid_invoices} unpaid invoices
                </p>
              </CardContent>
            </Card>

            {/* Overdue Invoices Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Overdue Invoices
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {billerData.outstanding_invoices.overdue_invoices}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Require immediate attention
                </p>
              </CardContent>
            </Card>

            {/* Total Customers Card */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {billerData.customer_statistics.total_customers}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {billerData.customer_statistics.active_customers} active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Revenue Trend */}
            <Card className="bg-white rounded-2xl shadow-sm border-0 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={billerMonthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickFormatter={(value) => `ETB ${value}`}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                        contentStyle={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4F46E5" 
                        strokeWidth={2}
                        dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#4F46E5' }}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Customer */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Top Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={billerRevenueByCustomerData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" horizontal={false} />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        tickFormatter={(value) => `ETB ${value}`}
                      />
                      <YAxis 
                        type="category"
                        dataKey="name"
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        width={100}
                      />
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Revenue']}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#10B981" 
                        radius={[0, 4, 4, 0]}
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods Distribution */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={billerPaymentMethodsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {billerPaymentMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`ETB ${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Activity */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  Customer Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={billerCustomerStatsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {billerCustomerStatsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Invoices Breakdown */}
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  Outstanding Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={billerOutstandingData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <Tooltip />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        name="Number of Invoices"
                      >
                        {billerOutstandingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Invoice Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {billerData.revenue_by_customer.length > 0 
                    ? formatCurrency(
                        billerData.total_revenue / 
                        billerData.revenue_by_customer.reduce((sum, item) => sum + (item.total_paid > 0 ? 1 : 0), 0)
                      )
                    : formatCurrency(0)
                  }
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {billerData.total_revenue + billerData.outstanding_invoices.total_outstanding > 0
                    ? `${Math.round((billerData.total_revenue / (billerData.total_revenue + billerData.outstanding_invoices.total_outstanding)) * 100)}%`
                    : '100%'
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Of total invoices collected
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-2xl shadow-sm border-0">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Most Popular Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {billerData.payment_methods.length > 0 
                    ? getPaymentMethodDisplay(billerData.payment_methods[0].payment__payment_method)
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {billerData.payment_methods.length > 0 
                    ? `${billerData.payment_methods[0].payment_count} payments`
                    : ''
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return null;
}