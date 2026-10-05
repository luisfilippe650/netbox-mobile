import { t } from "../../i18n/language";
export type AppIconName = "device" | "rack" | "organization" | "search" | "connection";

export function AppIcon({ name }: { name: AppIconName }) {
  const paths = {
    device: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" />
        <circle cx="16.5" cy="16" r=".5" fill="currentColor" stroke="none" />
      </>
    ),
    rack: (
      <>
        <rect x="4" y="2.5" width="16" height="19" rx="2" />
        <path d="M7 7h10M7 12h10M7 17h10" />
        <path d="M9 5.5v3M9 10.5v3M9 15.5v3" />
      </>
    ),
    organization: (
      <>
        <rect x="9" y="2.5" width="6" height="5" rx="1" />
        <rect x="2.5" y="16.5" width="6" height="5" rx="1" />
        <rect x="15.5" y="16.5" width="6" height="5" rx="1" />
        <path d="M12 7.5v4M5.5 16.5v-5h13v5" />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m16 16 4.2 4.2" />
      </>
    ),
    connection: (
      <>
        <path d="M8.5 8.5 6.8 6.8a3 3 0 0 0-4.2 4.2l2.8 2.8a3 3 0 0 0 4.2 0l1.1-1.1" />
        <path d="m15.5 15.5 1.7 1.7a3 3 0 0 0 4.2-4.2l-2.8-2.8a3 3 0 0 0-4.2 0l-1.1 1.1M8.5 15.5l7-7" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {t(paths[name])}
    </svg>
  );
}
