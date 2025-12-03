import React, { useEffect, useState } from "react";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { supabase } from "../../lib/supabase";
import KpiStat from "./charts/KpiStat";
import CircleChart from "./charts/CircleChart";

interface DashboardStats {
    totalInventoryValue: number;
    totalReceived: number;
    pendingPayments: number;
    availableProperties: number;
    paymentStatus: { name: string; value: number; count: number }[];
    availability: { name: string; value: number }[];
    listingTypeDistribution: { name: string; value: number }[];
    monthlyRevenue: { month: string; amount: number }[];
    revenueChange?: string;
    revenueChangeType?: "positive" | "neutral" | "negative";
    revenueTrendType?: "up" | "neutral" | "down";
}

const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#10b981',
    tertiary: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
};

export default function DailySummary() {
    const [stats, setStats] = useState<DashboardStats>({
        totalInventoryValue: 0,
        totalReceived: 0,
        pendingPayments: 0,
        availableProperties: 0,
        paymentStatus: [],
        availability: [],
        listingTypeDistribution: [],
        monthlyRevenue: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [propertiesRes, rentalsRes, paymentsRes] = await Promise.all([
                supabase.from('properties').select('*'),
                supabase.from('rentals').select('*'),
                supabase.from('payments').select('*'),
            ]);

            const properties = propertiesRes.data || [];
            const rentals = rentalsRes.data || [];
            const payments = paymentsRes.data || [];

            // KPI Stats
            const totalInventoryValue = properties
                .filter(p => p.operation === 'venta')
                .reduce((sum, p) => sum + (p.price || 0), 0);

            const totalReceived = payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + (p.amount || 0), 0);

            const pendingPayments = payments.filter(p => p.status === 'pending').length;

            const availableProperties = properties.filter(p => p.status === 'available').length;

            // Calculate revenue change (current month vs previous month)
            const now = new Date();
            const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            const currentMonthRevenue = payments.filter(p => {
                const dateToCheck = p.payment_date || p.created_at;
                if (!dateToCheck || p.status !== 'paid') return false;
                const paymentDate = new Date(dateToCheck);
                return paymentDate >= currentMonthStart;
            }).reduce((sum, p) => sum + (p.amount || 0), 0);

            const previousMonthRevenue = payments.filter(p => {
                const dateToCheck = p.payment_date || p.created_at;
                if (!dateToCheck || p.status !== 'paid') return false;
                const paymentDate = new Date(dateToCheck);
                return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
            }).reduce((sum, p) => sum + (p.amount || 0), 0);

            const revenueChange = previousMonthRevenue > 0
                ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
                : null;

            const revenueChangeType = revenueChange
                ? (parseFloat(revenueChange) > 0 ? 'positive' : parseFloat(revenueChange) < 0 ? 'negative' : 'neutral')
                : 'neutral';

            const revenueTrendType = revenueChange
                ? (parseFloat(revenueChange) > 0 ? 'up' : parseFloat(revenueChange) < 0 ? 'down' : 'neutral')
                : 'neutral';

            // Payment Status for Circle Chart
            const paidAmount = payments
                .filter(p => p.status === 'paid')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            const paidCount = payments.filter(p => p.status === 'paid').length;

            const pendingAmount = payments
                .filter(p => p.status === 'pending')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            const pendingCount = payments.filter(p => p.status === 'pending').length;

            const overdueAmount = payments
                .filter(p => p.status === 'overdue')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            const overdueCount = payments.filter(p => p.status === 'overdue').length;

            const paymentStatusData = [
                { name: 'Pagados', value: paidAmount, count: paidCount },
                { name: 'Pendientes', value: pendingAmount, count: pendingCount },
                { name: 'Atrasados', value: overdueAmount, count: overdueCount },
            ].filter(item => item.count > 0);

            // Availability for Circle Chart
            const available = properties.filter(p => p.status === 'available').length;
            const occupied = properties.filter(p => p.status === 'reserved' || p.status === 'sold').length;

            const availabilityData = [
                { name: 'Disponibles', value: available },
                { name: 'Ocupadas', value: occupied },
            ].filter(item => item.value > 0);

            // Listing Type Distribution
            const saleProperties = properties.filter(p => p.operation === 'venta').length;
            const rentProperties = properties.filter(p => p.operation === 'renta' || p.operation === 'alquiler').length;

            const listingTypeData = [
                { name: 'Venta', value: saleProperties },
                { name: 'Alquiler', value: rentProperties },
            ].filter(item => item.value > 0);

            // Monthly Revenue
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            const monthlyRevenueData = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

                const monthPayments = payments.filter(p => {
                    const dateToCheck = p.payment_date || p.created_at;
                    if (!dateToCheck || p.status !== 'paid') return false;

                    const paymentDate = new Date(dateToCheck);
                    return paymentDate.getFullYear() === date.getFullYear() &&
                        paymentDate.getMonth() === date.getMonth();
                });

                const amount = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                monthlyRevenueData.push({
                    month: monthNames[date.getMonth()],
                    amount
                });
            }

            setStats({
                totalInventoryValue,
                totalReceived,
                pendingPayments,
                availableProperties,
                paymentStatus: paymentStatusData,
                availability: availabilityData,
                listingTypeDistribution: listingTypeData,
                monthlyRevenue: monthlyRevenueData,
                revenueChange: revenueChange ? `${parseFloat(revenueChange) > 0 ? '+' : ''}${revenueChange}%` : undefined,
                revenueChangeType,
                revenueTrendType,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Resumen Diario</h1>
                <Button
                    color="default"
                    variant="light"
                    onPress={() => window.location.href = '/admin/dashboard'}
                    className="w-full sm:w-auto"
                >
                    <span className="hidden sm:inline">Volver al Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                </Button>
            </div>

            {/* KPI Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiStat
                    title="Inventario en Venta"
                    value={`$${stats.totalInventoryValue.toLocaleString()}`}
                />
                <KpiStat
                    title="Total Recaudado"
                    value={`$${stats.totalReceived.toLocaleString()}`}
                    change={stats.revenueChange}
                    changeType={stats.revenueChangeType}
                    trendType={stats.revenueTrendType}
                />
                <KpiStat
                    title="Pagos Pendientes"
                    value={stats.pendingPayments.toString()}
                />
                <KpiStat
                    title="Propiedades Disponibles"
                    value={stats.availableProperties.toString()}
                />
            </div>

            {/* Circle Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {stats.paymentStatus.length > 0 && (
                    <CircleChart
                        title="Estado de Pagos"
                        data={stats.paymentStatus}
                        dataKey="value"
                        colors={[CHART_COLORS.secondary, CHART_COLORS.tertiary, CHART_COLORS.danger]}
                        showDropdown={true}
                        showOptions={true}
                    />
                )}

                {stats.availability.length > 0 && (
                    <CircleChart
                        title="Disponibilidad de Propiedades"
                        data={stats.availability}
                        dataKey="value"
                        colors={[CHART_COLORS.primary, CHART_COLORS.danger]}
                        showDropdown={true}
                        showOptions={true}
                    />
                )}

                <CircleChart
                    title="Tipo de Operación"
                    data={stats.listingTypeDistribution}
                    dataKey="value"
                    colors={[CHART_COLORS.purple, CHART_COLORS.tertiary]}
                    showDropdown={true}
                    showOptions={true}
                />
            </div>

            {/* Monthly Revenue Line Chart */}
            {stats.monthlyRevenue.length > 0 && (
                <Card className="bg-white dark:bg-gray-800">
                    <CardBody className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                            Ingresos Mensuales
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Últimos 6 meses
                        </p>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value: any) => `$${value.toLocaleString()}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke={CHART_COLORS.primary}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    name="Ingresos"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}
