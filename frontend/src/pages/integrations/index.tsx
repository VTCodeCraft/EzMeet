import PageTitle from "@/components/PageTitle";
import IntegrationCard from "./_components/integration-card";
import { useQuery } from "@tanstack/react-query";
import { getAllIntegrationQueryFn } from "@/lib/api";
import { Loader } from "@/components/loader";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const Integrations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");

    if (error) {
      toast.error(error);
      navigate("/app/integrations", { replace: true });
    } else if (success) {
      toast.success("Integration connected successfully!");
      navigate("/app/integrations", { replace: true });
    }
  }, [searchParams, navigate]);

  const { data, isFetching, isError, error: queryError } = useQuery({
    queryKey: ["integration_list"],
    queryFn: getAllIntegrationQueryFn,
  });

  const integrations = data?.data || [];

  return (
    <div className="flex flex-col !gap-5">
      <PageTitle
        title="Integrations & apps"
        subtitle="Connect all your apps directly from here. You need to connect these apps"
      />

      <ErrorAlert isError={isError} error={queryError} />

      <div className="relative flex flex-col gap-4">
        <section className="flex flex-col gap-4 text-muted-foreground">
          {isFetching || isError ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <Loader size="lg" color="black" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.app_type}
                    isDisabled={
                      integration.app_type === "GOOGLE_MEET_AND_CALENDAR"
                        ? false
                        : false
                    }
                    appType={integration.app_type}
                    title={integration.title}
                    isConnected={integration.isConnected}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Integrations;
