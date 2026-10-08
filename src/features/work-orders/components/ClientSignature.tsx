import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiBaseUrl } from "@/shared/api/baseClient";

function photoUrl(photoId: string): string {
  return `${apiBaseUrl}/api/v1/photos/${photoId}`;
}

export type ClientSignatureProps = {
  photoId: string;
};

export function ClientSignature({ photoId }: ClientSignatureProps) {
  const { t } = useTranslation();
  const [hasFailed, setHasFailed] = useState(false);
  const url = photoUrl(photoId);

  if (hasFailed) {
    return <span className="text-muted-foreground">{t("workOrders.signature.loadError")}</span>;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block w-fit">
      <img
        src={url}
        alt={t("workOrders.signature.image")}
        loading="lazy"
        className="h-28 max-w-full rounded-lg border bg-white object-contain"
        onError={() => {
          setHasFailed(true);
        }}
      />
    </a>
  );
}
