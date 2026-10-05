import { useEffect, useRef } from "react";

export function useFormErrorFocus(error: string) {
  const errorRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!error) return;
    errorRef.current?.focus();
    errorRef.current?.scrollIntoView?.({ block: "center", behavior: "smooth" });
  }, [error]);
  return errorRef;
}
