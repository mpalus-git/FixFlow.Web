import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateUserMutation } from "@/features/users/api/userMutations";
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { toCreateUserRequest } from "@/features/users/schemas/createUserSchema";
import { Card, CardContent } from "@/shared/ui/card";
import { PageTitle } from "@/shared/ui/PageTitle";

export function CreateUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createUserMutation = useCreateUserMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageTitle title={t("users.create.title")} />
        <h1 className="text-2xl font-semibold tracking-tight">{t("users.create.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("users.create.description")}</p>
      </div>
      <Card>
        <CardContent>
          <CreateUserForm
            onSubmit={async (values) => {
              const user = await createUserMutation.mutateAsync(toCreateUserRequest(values));
              toast.success(t("users.create.created", { email: user.email }));
              await navigate("/users");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
