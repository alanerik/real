import { useState, useEffect } from 'react';
import { Card, CardBody, Spinner } from "@heroui/react";
import { getActivitiesByRental, groupActivitiesByDate, getActivityIcon, getRelativeTime } from '../../lib/activity';
import { showToast } from '../ToastManager';

export default function ActivityTimeline({ rentalId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [rentalId]);

    const loadActivities = async () => {
        try {
            const data = await getActivitiesByRental(rentalId);
            setActivities(data || []);
        } catch (error) {
            showToast({
                title: 'Error al cargar actividad',
                description: error.message,
                color: 'danger'
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner size="lg" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <Card>
                <CardBody className="text-center py-8">
                    <p className="text-gray-600">No hay actividad registrada aún</p>
                </CardBody>
            </Card>
        );
    }

    const groupedActivities = groupActivitiesByDate(activities);

    return (
        <div className="space-y-6">
            {groupedActivities.map((group, groupIndex) => (
                <div key={groupIndex}>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase">
                        📅 {group.label}
                    </h3>
                    <div className="space-y-3">
                        {group.activities.map((activity) => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function ActivityItem({ activity }) {
    const icon = getActivityIcon(activity.activity_type);
    const relativeTime = getRelativeTime(activity.created_at);

    return (
        <Card className="hover:bg-gray-50 transition-colors">
            <CardBody className="p-4">
                <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            {relativeTime}
                        </p>
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                {activity.metadata.file_name && (
                                    <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                                        📎 {activity.metadata.file_name}
                                    </span>
                                )}
                                {activity.metadata.amount && (
                                    <span className="inline-block bg-gray-100 px-2 py-1 rounded ml-2">
                                        💵 ${activity.metadata.amount?.toLocaleString()}
                                    </span>
                                )}
                                {activity.metadata.priority && (
                                    <span className={`inline-block px-2 py-1 rounded ml-2 ${activity.metadata.priority === 'urgent' || activity.metadata.priority === 'high'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        ⚡ {activity.metadata.priority}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
