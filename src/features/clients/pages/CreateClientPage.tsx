import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateClientMutation } from "@/features/clients/api/clientMutations";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { emptyClientFormValues, toClientRequest } from "@/features/clients/schemas/clientSchema";
import { Card, CardContent } from "@/shared/ui/card";
import { PageTitle } from "@/shared/ui/PageTitle";

export function CreateClientPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createClientMutation = useCreateClientMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageTitle title={t("clients.create.title")} />
      <h1 className="text-2xl font-semibold tracking-tight">{t("clients.create.title")}</h1>
      <Card>
        <CardContent>
          <ClientForm
            defaultValues={emptyClientFormValues}
            submitLabel={t("clients.create.submit")}
            cancelTo="/clients"
            onSubmit={async (values) => {
              const client = await createClientMutation.mutateAsync(toClientRequest(values));
              toast.success(t("clients.create.created", { name: client.name }));
              await navigate(`/clients/${client.id}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
