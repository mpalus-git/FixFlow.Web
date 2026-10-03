import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ClientNameLink } from "@/features/clients";
import { useCreateDeviceMutation } from "@/features/devices/api/deviceMutations";
import { DeviceForm } from "@/features/devices/components/DeviceForm";
import { emptyDeviceFormValues, toDeviceRequest } from "@/features/devices/schemas/deviceSchema";
import { Card, CardContent } from "@/shared/ui/card";
import { PageTitle } from "@/shared/ui/PageTitle";

export function CreateDevicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId = "" } = useParams();
  const createDeviceMutation = useCreateDeviceMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle title={t("devices.create.title")} />
        <h1 className="text-2xl font-semibold tracking-tight">{t("devices.create.title")}</h1>
        <p className="flex flex-wrap gap-1 text-muted-foreground">
          {t("devices.create.forClient")} <ClientNameLink clientId={clientId} />
        </p>
      </div>
      <Card>
        <CardContent>
          <DeviceForm
            defaultValues={emptyDeviceFormValues}
            submitLabel={t("devices.create.submit")}
            cancelTo={`/clients/${clientId}`}
            onSubmit={async (values) => {
              const { data: device } = await createDeviceMutation.mutateAsync({
                clientId,
                ...toDeviceRequest(values),
              });
              toast.success(t("devices.create.created", { serialNumber: device.serialNumber }));
              await navigate(`/devices/${device.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
