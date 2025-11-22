export type AvailabilityResponseType = {
  timezone: any;
  timeGap: number;
  days: {
    day: string;
    timeSlots: { startTime: string; endTime: string }[];
    breaks: { start: string; end: string }[];
    isAvailable: boolean;
  }[];
};
