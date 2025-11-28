import React from "react";
import { Card, CardBody } from "@heroui/react";
import { TEXT_COLOR_CLASSES } from "../../constants/property";

interface StatsCardProps {
    title: string;
    value: number;
    color: keyof typeof TEXT_COLOR_CLASSES;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, color }) => (
    <Card className="w-full border-none shadow-md">
        <CardBody className="flex flex-row items-center justify-between p-4">
            <div>
                <p className="text-xs sm:text-sm text-default-500 font-medium uppercase">
                    {title}
                </p>
                <h4 className={`text-xl sm:text-2xl font-bold ${TEXT_COLOR_CLASSES[color] || TEXT_COLOR_CLASSES.default}`}>
                    {value}
                </h4>
            </div>
        </CardBody>
    </Card>
);

export default React.memo(StatsCard);
