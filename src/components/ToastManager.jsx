import React, { useEffect } from 'react';
import { ToastProvider, addToast } from "@heroui/react";

// Custom event name
export const TOAST_EVENT_NAME = 'realstate:show-toast';

// Helper to dispatch toast event from anywhere
export const showToast = (props) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: props }));
    }
};

const ToastManager = () => {
    useEffect(() => {
        const handleToast = (event) => {
            const props = event.detail;
            addToast(props);
        };

        window.addEventListener(TOAST_EVENT_NAME, handleToast);
        return () => window.removeEventListener(TOAST_EVENT_NAME, handleToast);
    }, []);

    return (
        <div className="relative z-[9999]">
            <ToastProvider placement="top-center" />
        </div>
    );
};

export default ToastManager;
