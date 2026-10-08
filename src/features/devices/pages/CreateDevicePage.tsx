import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { ClientNameLink } from "@/features/clients";
import { useCreateDeviceMutation } from "@/features/devices/api/deviceMutations";
import { DeviceForm } from "@/features/devices/components/DeviceForm";
import { emptyDeviceFormValues, toDeviceRequest } from "@/features/devices/schemas/deviceSchema";
import { Card, CardContent } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/PageHeader";

export function CreateDevicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { clientId = "" } = useParams();
  const createDeviceMutation = useCreateDeviceMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={t("devices.create.title")}
        description={
          <>
            {t("devices.create.forClient")} <ClientNameLink clientId={clientId} />
          </>
        }
      />
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
