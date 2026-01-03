import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPills, FaPrescriptionBottle, FaQuoteRight, FaShoppingCart, 
  FaClinicMedical, FaPalette, FaMoneyCheckAlt, FaWarehouse, 
  FaHeadset, FaUsers, FaClipboardList, FaChartLine, FaBoxOpen,
  FaArrowUp, FaArrowDown, FaDollarSign
} from 'react-icons/fa';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import ReactApexChart from 'react-apexcharts';
import { useStock } from '../context/stockContext';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const { 
    products = [],
    purchases = [],
    sales = [],
    dispenses = [],
    loading: stockLoading = false,
    getTotalPurchases,
    getTotalSales,
    getTotalClosingStockValue,
  } = useStock() || {};

  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products?.length || 0;
    const totalSales = sales?.length || 0;
    const totalPurchases = purchases?.length || 0;
    const totalDispenses = dispenses?.length || 0;
    
    // Calculate revenue and costs
    // getTotalSales() and getTotalPurchases() return { totalQty, totalValue }
    const salesResult = (getTotalSales && typeof getTotalSales === 'function') ? getTotalSales() : { totalQty: 0, totalValue: 0 };
    const purchasesResult = (getTotalPurchases && typeof getTotalPurchases === 'function') ? getTotalPurchases() : { totalQty: 0, totalValue: 0 };
    const totalRevenue = salesResult?.totalValue || 0;
    const totalCost = purchasesResult?.totalValue || 0;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
    
    // Calculate stock value
    const stockValue = (getTotalClosingStockValue && typeof getTotalClosingStockValue === 'function') ? getTotalClosingStockValue() : 0;

    return [
      { 
        title: 'Total Products', 
        value: totalProducts, 
        icon: <FaBoxOpen size={28} />,
        color: '#2196F3',
        change: '+12%',
        trend: 'up'
      },
      { 
        title: 'Total Sales', 
        value: totalSales, 
        icon: <FaShoppingCart size={28} />,
        color: '#4CAF50',
        change: '+8%',
        trend: 'up'
      },
      { 
        title: 'Total Purchases', 
        value: totalPurchases, 
        icon: <FaChartLine size={28} />,
        color: '#FF9800',
        change: '+5%',
        trend: 'up'
      },
      { 
        title: 'Total Dispenses', 
        value: totalDispenses, 
        icon: <FaClipboardList size={28} />,
        color: '#9C27B0',
        change: '-2%',
        trend: 'down'
      },
      { 
        title: 'Total Revenue', 
        value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        icon: <FaDollarSign size={28} />,
        color: '#00BCD4',
        change: `+${profitMargin}%`,
        trend: 'up'
      },
      { 
        title: 'Stock Value', 
        value: `$${stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        icon: <FaWarehouse size={28} />,
        color: '#673AB7',
        change: '+3%',
        trend: 'up'
      },
    ];
  }, [products, sales, purchases, dispenses, getTotalPurchases, getTotalSales, getTotalClosingStockValue]);

  // Prepare chart data for sales trend
  const salesChartData = useMemo(() => {
    const last7Days = [];
    const salesCounts = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Count sales for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySales = sales?.filter(sale => {
        const saleDate = sale.date ? new Date(sale.date) : new Date();
        return saleDate >= dayStart && saleDate <= dayEnd;
      }).length || 0;
      
      salesCounts.push(daySales);
    }
    
    return {
      categories: last7Days,
      series: [
        {
          name: 'Sales',
          data: salesCounts
        }
      ]
    };
  }, [sales]);

  // Prepare chart data for revenue breakdown
  const revenueChartData = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        labels: ['No Data'],
        series: [0]
      };
    }

    // Calculate revenue by product category (if available) or by product
    const revenueByCategory = {};
    
    sales.forEach(sale => {
      const category = sale.productCategory || sale.category || 'Uncategorized';
      const amount = sale.totalAmount || sale.amount || sale.total || 0;
      revenueByCategory[category] = (revenueByCategory[category] || 0) + amount;
    });

    const labels = Object.keys(revenueByCategory);
    const series = Object.values(revenueByCategory);

    return { labels, series };
  }, [sales]);

  // Top products chart data
  const topProductsData = useMemo(() => {
    if (!sales || sales.length === 0) {
      return {
        categories: [],
        series: []
      };
    }

    const productSales = {};
    
    sales.forEach(sale => {
      const productName = sale.productName || sale.name || 'Unknown';
      const quantity = sale.quantity || sale.qty || 1;
      productSales[productName] = (productSales[productName] || 0) + quantity;
    });

    const sorted = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      categories: sorted.map(([name]) => name.length > 15 ? name.substring(0, 15) + '...' : name),
      series: sorted.map(([, qty]) => qty)
    };
  }, [sales]);

  const pages = [
    { path: '/pharmacies', title: 'Doctor: Pharmacies', desc: 'View and manage available pharmacies as a doctor.', icon: <FaPills size={40} />, color: '#4CAF50' },
    { path: '/prescription', title: 'Prescription', desc: 'Create and manage patient prescriptions.', icon: <FaPrescriptionBottle size={40} />, color: '#2196F3' },
    { path: '/quotes', title: 'Quotes', desc: 'Manage price quotes and pharmacy requests.', icon: <FaQuoteRight size={40} />, color: '#FF9800' },
    { path: '/orders', title: 'Orders', desc: 'Track orders and order history.', icon: <FaShoppingCart size={40} />, color: '#9C27B0' },
    { path: '/clinics', title: 'Clinics', desc: 'View and manage clinic information.', icon: <FaClinicMedical size={40} />, color: '#F44336' },
    { path: '/branding', title: 'Branding', desc: 'Manage branding and logos for your organization.', icon: <FaPalette size={40} />, color: '#00BCD4' },
    { path: '/payments', title: 'Payments', desc: 'Manage payments, invoices, and financial transactions.', icon: <FaMoneyCheckAlt size={40} />, color: '#795548' },
    { path: '/pharmacy-rx', title: 'Pharmacy Dashboard', desc: 'Pharmacy view: manage prescriptions, orders, and patients.', icon: <FaWarehouse size={40} />, color: '#8BC34A' },
    { path: '/callcenter', title: 'Call Center', desc: 'Manage call center sessions, patient calls, and support.', icon: <FaHeadset size={40} />, color: '#009688' },
    { path: '/stock', title: 'Stock Management', desc: 'Manage pharmacy inventory, purchases, dispensing, and reports.', icon: <FaClipboardList size={40} />, color: '#673AB7' },
  ];

  // Chart options
  const salesChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    },
    colors: ['#0d9488'],
    xaxis: {
      categories: salesChartData.categories,
      labels: { style: { colors: '#666' } }
    },
    yaxis: {
      labels: { style: { colors: '#666' } }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 3
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (val) => `${val} sales`
      }
    }
  };

  const revenueChartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false }
    },
    labels: revenueChartData.labels,
    colors: ['#0d9488', '#14b8a6', '#5eead4', '#99f6e4', '#ccfbf1'],
    legend: {
      position: 'bottom',
      fontSize: '14px'
    },
    tooltip: {
      y: {
        formatter: (val) => `$${val.toLocaleString()}`
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Revenue',
              formatter: () => {
                const total = revenueChartData.series.reduce((a, b) => a + b, 0);
                return `$${total.toLocaleString()}`;
              }
            }
          }
        }
      }
    }
  };

  const topProductsChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val} units`,
      offsetX: 0,
      style: { fontSize: '12px', colors: ['#666'] }
    },
    colors: ['#0d9488'],
    xaxis: {
      categories: topProductsData.categories,
      labels: { style: { colors: '#666' } }
    },
    yaxis: {
      labels: { style: { colors: '#666' } }
    },
    grid: {
      borderColor: '#e0e0e0',
      strokeDashArray: 3
    }
  };

  if (stockLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading dashboard...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Here's what's happening with your E-Pharmacy today
        </Typography>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #e0e0e0',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }
            }}
          >
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 500 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
                    {stat.value}
                  </Typography>
                  <div className="flex items-center gap-2">
                    {stat.trend === 'up' ? (
                      <FaArrowUp size={12} color="#4CAF50" />
                    ) : (
                      <FaArrowDown size={12} color="#F44336" />
                    )}
                    <Chip 
                      label={stat.change} 
                      size="small" 
                      sx={{
                        height: 20,
                        fontSize: '0.75rem',
                        bgcolor: stat.trend === 'up' ? '#e8f5e9' : '#ffebee',
                        color: stat.trend === 'up' ? '#4CAF50' : '#F44336',
                      }}
                    />
                  </div>
                </div>
                <Avatar 
                  sx={{ 
                    width: 56, 
                    height: 56, 
                    bgcolor: `${stat.color}15`,
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </Avatar>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
              Sales Trend (Last 7 Days)
            </Typography>
            <ReactApexChart
              options={salesChartOptions}
              series={salesChartData.series}
              type="area"
              height={300}
            />
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
              Revenue by Category
            </Typography>
            <ReactApexChart
              options={revenueChartOptions}
              series={revenueChartData.series}
              type="donut"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Products Chart */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', mb: 8 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
            Top 5 Products by Sales
          </Typography>
          <ReactApexChart
            options={topProductsChartOptions}
            series={[{ name: 'Units Sold', data: topProductsData.series }]}
            type="bar"
            height={350}
          />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="mb-6">
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1a1a1a' }}>
          Quick Links
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {pages.map((page, index) => (
            <Link 
              key={index} 
              to={page.path}
              className="block"
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: `0 12px 24px ${page.color}33`,
                    borderColor: page.color,
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <div 
                    className="inline-flex items-center justify-center mb-3"
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: `${page.color}15`,
                      color: page.color
                    }}
                  >
                    {page.icon}
                  </div>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    {page.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                    {page.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
