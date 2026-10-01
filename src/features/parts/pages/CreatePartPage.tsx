import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreatePartMutation } from "@/features/parts/api/partMutations";
import { PartForm } from "@/features/parts/components/PartForm";
import { emptyPartFormValues, toCreatePartRequest } from "@/features/parts/schemas/partSchema";
import { Card, CardContent } from "@/shared/ui/card";

export function CreatePartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createPartMutation = useCreatePartMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("parts.create.title")}</h1>
      <Card>
        <CardContent>
          <PartForm
            mode="create"
            defaultValues={emptyPartFormValues}
            submitLabel={t("parts.create.submit")}
            onSubmit={async (values) => {
              const { data: part } = await createPartMutation.mutateAsync(
                toCreatePartRequest(values),
              );
              toast.success(t("parts.create.created", { name: part.name }));
              await navigate(`/parts?search=${encodeURIComponent(part.catalogNumber)}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
