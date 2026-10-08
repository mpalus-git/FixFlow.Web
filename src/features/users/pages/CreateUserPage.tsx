import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useCreateUserMutation } from "@/features/users/api/userMutations";
import { CreateUserForm } from "@/features/users/components/CreateUserForm";
import { toCreateUserRequest } from "@/features/users/schemas/createUserSchema";
import { Card, CardContent } from "@/shared/ui/card";
import { PageHeader } from "@/shared/ui/PageHeader";

export function CreateUserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createUserMutation = useCreateUserMutation();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader title={t("users.create.title")} description={t("users.create.description")} />
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
