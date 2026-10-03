import { useTranslation } from "react-i18next";

export type PageTitleProps = {
  title: string;
  subject?: string;
};

export function PageTitle({ title, subject }: PageTitleProps) {
  const { t } = useTranslation();

  return (
    <title>
      {subject === undefined
        ? t("app.pageTitle", { title })
        : t("app.pageTitleWithSubject", { title, subject })}
    </title>
  );
}
