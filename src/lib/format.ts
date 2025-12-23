import { format } from "date-fns";

export function formatDateTimeValue(date: Date, time?: string): string {
    const dateStr = format(date, "dd-MM-yyyy");
    return time ? `${dateStr}T${time}` : dateStr;
}

// Utilities
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(price);
};
