import { useEffect, useState } from "react";
import { useNavigation } from "react-router";

const navigationProgressDelayMs = 150;

export function NavigationProgress() {
  const navigation = useNavigation();
  const pendingKey = navigation.state === "loading" ? navigation.location.key : null;
  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  useEffect(() => {
    if (pendingKey === null) {
      return undefined;
    }
    const handle = setTimeout(() => {
      setVisibleKey(pendingKey);
    }, navigationProgressDelayMs);
    return () => {
      clearTimeout(handle);
    };
  }, [pendingKey]);

  if (pendingKey === null || visibleKey !== pendingKey) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden"
    >
      <div className="h-full w-1/3 animate-navigation-progress bg-primary motion-reduce:w-full motion-reduce:animate-none" />
    </div>
  );
}
