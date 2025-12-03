"use client";

import React from "react";
import { Card, Chip, cn } from "@heroui/react";

type KpiStatProps = {
    title: string;
    value: string;
    change?: string;
    changeType?: "positive" | "neutral" | "negative";
    trendType?: "up" | "neutral" | "down";
    trendChipPosition?: "top" | "bottom";
    trendChipVariant?: "flat" | "light";
};

// SVG icons for trends
const ArrowUpIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M6 18L18 6M18 6H10M18 6V14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M4 12H20M20 12L14 6M20 12L14 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ArrowDownIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18 6L6 18M6 18H14M6 18V10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function KpiStat({
    title,
    value,
    change,
    changeType = "neutral",
    trendType = "neutral",
    trendChipPosition = "top",
    trendChipVariant = "flat",
}: KpiStatProps) {
    const getTrendIcon = () => {
        if (trendType === "up") return <ArrowUpIcon />;
        if (trendType === "down") return <ArrowDownIcon />;
        return <ArrowRightIcon />;
    };

    return (
        <Card className="dark:border-default-100 border border-transparent bg-white dark:bg-gray-800">
            <div className="flex p-4">
                <div className="flex flex-col gap-y-2">
                    <dt className="text-small text-default-500 font-medium">{title}</dt>
                    <dd className="text-default-700 text-2xl font-semibold">{value}</dd>
                </div>
                {change && (
                    <Chip
                        className={cn("absolute right-4", {
                            "top-4": trendChipPosition === "top",
                            "bottom-4": trendChipPosition === "bottom",
                        })}
                        classNames={{
                            content: "font-medium text-[0.65rem]",
                        }}
                        color={
                            changeType === "positive" ? "success" : changeType === "neutral" ? "warning" : "danger"
                        }
                        radius="sm"
                        size="sm"
                        startContent={getTrendIcon()}
                        variant={trendChipVariant}
                    >
                        {change}
                    </Chip>
                )}
            </div>
        </Card>
    );
}
