import { Alert } from "@heroui/react";
import {
    TOTAL_COMMISSION_RATE,
    CAPTURE_AND_SELL_SHARE,
    CAPTURE_ONLY_SHARE,
    SELL_ONLY_SHARE
} from '../../lib/commissions';

export default function CommissionAlert() {
    const captureAndSellPercent = (TOTAL_COMMISSION_RATE * CAPTURE_AND_SELL_SHARE / 100).toFixed(1);
    const captureOnlyPercent = (TOTAL_COMMISSION_RATE * CAPTURE_ONLY_SHARE / 100).toFixed(1);
    const sellOnlyPercent = (TOTAL_COMMISSION_RATE * SELL_ONLY_SHARE / 100).toFixed(1);

    return (
        <Alert
            color="primary"
            variant="faded"
            title="Sistema de Comisiones"
            classNames={{
                base: "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800",
                title: "text-emerald-800 dark:text-emerald-200 font-semibold",
                description: "text-emerald-700 dark:text-emerald-300"
            }}
            description={
                <div className="space-y-3 mt-2">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">
                                Si captás y vendés la propiedad:
                            </p>
                            <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                                {CAPTURE_AND_SELL_SHARE}% del {TOTAL_COMMISSION_RATE}% = {captureAndSellPercent}% del valor de venta
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">
                                Si captás pero otro agente vende:
                            </p>
                            <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">
                                {CAPTURE_ONLY_SHARE}% del {TOTAL_COMMISSION_RATE}% = {captureOnlyPercent}% del valor de venta
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                        <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-200">
                                Si vendés una propiedad de otro agente:
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                                {SELL_ONLY_SHARE}% del {TOTAL_COMMISSION_RATE}% = {sellOnlyPercent}% del valor de venta
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-700">
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">
                            💡 <strong>Ejemplo:</strong> En una venta de $100,000 USD, si captaste y vendiste,
                            tu comisión sería de <strong>${(100000 * Number(captureAndSellPercent) / 100).toLocaleString()} USD</strong>
                        </p>
                    </div>
                </div>
            }
        />
    );
}
