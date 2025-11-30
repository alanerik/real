import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Spinner } from "@heroui/react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { supabase } from "../../lib/supabase";

interface DashboardStats {
    messaging: { name: string; count: number }[];
    totalValue: { month: string; properties: number; income: number }[];
    occupancy: { name: string; value: number }[];
    activeRentals: { month: string; active: number; expiring: number }[];
    maintenance: { name: string; count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DailySummary() {
    const [stats, setStats] = useState<DashboardStats>({
        messaging: [],
        totalValue: [],
        occupancy: [],
        activeRentals: [],
        maintenance: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Fetch data from Supabase
            const [propertiesRes, rentalsRes, maintenanceRes] = await Promise.all([
                supabase.from('properties').select('*'),
                supabase.from('rentals').select('*'),
                supabase.from('maintenance_tickets').select('*'),
            ]);

            const properties = propertiesRes.data || [];
            const rentals = rentalsRes.data || [];
            const tickets = maintenanceRes.data || [];

            // 1. Messaging/Alerts
            const nearExpiration = rentals.filter(r => r.status === 'near_expiration').length;
            const expired = rentals.filter(r => r.status === 'expired').length;
            const messagingData = [
                { name: 'Próximos a vencer', count: nearExpiration },
                { name: 'Vencidos', count: expired },
                { name: 'Tickets Pendientes', count: tickets.filter(t => t.status === 'pending').length },
            ];

            // 2. Total Value (mock data for trend - you can calculate real values)
            const totalValueData = [
                { month: 'Ene', properties: 150000, income: 25000 },
                { month: 'Feb', properties: 160000, income: 27000 },
                { month: 'Mar', properties: 155000, income: 26000 },
                { month: 'Abr', properties: 170000, income: 29000 },
                { month: 'May', properties: 180000, income: 31000 },
                { month: 'Jun', properties: 190000, income: 33000 },
            ];

            // 3. Occupancy
            const occupied = properties.filter(p => p.status === 'reserved' || p.status === 'sold').length;
            const available = properties.filter(p => p.status === 'available' || !p.status).length;
            const occupancyData = [
                { name: 'Ocupadas', value: occupied },
                { name: 'Disponibles', value: available },
            ];

            // 4. Active Rentals (mock monthly data)
            const activeRentalsData = [
                { month: 'Ene', active: 12, expiring: 2 },
                { month: 'Feb', active: 14, expiring: 1 },
                { month: 'Mar', active: 13, expiring: 3 },
                { month: 'Abr', active: 15, expiring: 2 },
                { month: 'May', active: 16, expiring: 1 },
                { month: 'Jun', active: rentals.filter(r => r.status === 'active').length, expiring: nearExpiration },
            ];

            // 5. Maintenance Status
            const maintenanceData = [
                { name: 'Pendientes', count: tickets.filter(t => t.status === 'pending').length },
                { name: 'En Progreso', count: tickets.filter(t => t.status === 'in_progress').length },
                { name: 'Completados', count: tickets.filter(t => t.status === 'completed').length },
            ];

            setStats({
                messaging: messagingData,
                totalValue: totalValueData,
                occupancy: occupancyData,
                activeRentals: activeRentalsData,
                maintenance: maintenanceData,
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

    const hasData = stats.messaging.length > 0 || stats.occupancy.length > 0;

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

            {!hasData ? (
                <Card className="bg-white dark:bg-gray-800">
                    <CardBody className="text-center py-12">
                        <div className="text-default-400">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">No hay datos para mostrar</p>
                            <p className="text-sm">Comienza agregando propiedades, alquileres o tickets de mantenimiento</p>
                        </div>
                    </CardBody>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Messaging/Alerts - Radial Bar Chart */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Mensajería y Alertas
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={stats.messaging}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="url(#colorCount)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* 2. Total Value - Composed Chart (Area + Line) */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Tendencia de Ingresos
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={stats.totalValue}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="income"
                                        stroke="#82ca9d"
                                        fill="url(#colorIncome)"
                                        strokeWidth={2}
                                        name="Ingresos ($)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* 3. Occupancy - Enhanced Pie Chart */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Ocupación de Propiedades
                            </h3>
                        </CardHeader>
                        <CardBody className="flex justify-center">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={stats.occupancy}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    >
                                        {stats.occupancy.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* 4. Active Rentals - Smooth Line Chart */}
                    <Card className="bg-white dark:bg-gray-800">
                        <CardHeader className="pb-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Alquileres - Tendencia
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={stats.activeRentals}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpiring" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff7300" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ff7300" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="active"
                                        stroke="#8884d8"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#8884d8' }}
                                        activeDot={{ r: 7 }}
                                        name="Activos"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expiring"
                                        stroke="#ff7300"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#ff7300' }}
                                        activeDot={{ r: 7 }}
                                        strokeDasharray="5 5"
                                        name="Por Vencer"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>

                    {/* 5. Maintenance Status - Stacked Bar Chart */}
                    <Card className="bg-white dark:bg-gray-800 lg:col-span-2">
                        <CardHeader className="pb-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                Estado de Mantenimiento
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={stats.maintenance}>
                                    <defs>
                                        <linearGradient id="colorMaintenance" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="url(#colorMaintenance)"
                                        radius={[8, 8, 0, 0]}
                                        maxBarSize={100}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardBody>
                    </Card>
                </div>
            )}
        </div>
    );
}
