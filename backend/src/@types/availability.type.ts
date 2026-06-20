export type AvailabilityResponseType = {
  timezone?: string;
  timeGap: number;
  days: {
    day: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
};
