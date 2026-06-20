import { EventType } from "@/types/api.type";
import EventCard from "./event-card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventMutationFn, toggleEventVisibilityMutationFn } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

const EventListSection = (props: { events: EventType[]; username: string }) => {
  const { events, username } = props;
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: toggleEventVisibilityMutationFn,
  });

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation({
    mutationFn: deleteEventMutationFn,
  });

  const toggleEventVisibility = (eventId: string) => {
    setPendingEventId(eventId);
    mutate(
      {
        eventId: eventId,
      },
      {
        onSuccess: (response) => {
          queryClient.invalidateQueries({
            queryKey: ["event_list"],
          });
          setPendingEventId(null);
          toast.success(`${response.message}`);
        },
        onError: () => {
          setPendingEventId(null);
          toast.error("Failed to switch event");
        },
      }
    );
  };

  const handleDeleteEvent = (eventId: string) => {
    setDeletingEventId(eventId);
    deleteEvent(eventId, {
      onSuccess: (response) => {
        queryClient.invalidateQueries({
          queryKey: ["event_list"],
        });
        setDeletingEventId(null);
        toast.success(response?.message || "Event deleted successfully");
      },
      onError: (error) => {
        setDeletingEventId(null);
        toast.error(error?.message || "Failed to delete event");
      },
    });
  };
  return (
    <div className="w-full">
      <div
        className="
        grid grid-cols-[repeat(auto-fill,minmax(min(calc(100%/3-24px),max(280px,calc(100%-48px)/3)),1fr))]
         gap-6 py-[10px] pb-[25px]
        "
      >
        {events?.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            slug={event.slug}
            duration={event.duration}
            isPrivate={event.isPrivate}
            username={username}
            isPending={pendingEventId === event.id ? isPending : false}
            onToggle={() => toggleEventVisibility(event.id)}
            isDeleting={deletingEventId === event.id ? isDeleting : false}
            onDelete={() => handleDeleteEvent(event.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default EventListSection;
