import type { Specialist } from "./specialist";

export type DoctorType = "specialist" | "general";

export interface DoctorSchedule {
    day: string; // e.g. "Monday"
    start_time: string; // e.g. "08:00"
    end_time: string; // e.g. "16:00"
}

export interface Doctor {
    id: number;
    name: string;
    title: string;
    image_url: string;
    type: DoctorType;
    schedules: DoctorSchedule[];

    // Relations
    specialist_id: number | null;
    specialist: Specialist | null;

    created_at: string;
    updated_at: string;
}
