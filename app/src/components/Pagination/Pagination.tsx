import { t } from "../../i18n/language";
type PaginationProps = {
  disabled?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  disabled = false,
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="page-pagination" aria-label={t("Paginação dos resultados")}>
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >{t("Anterior")}</button>
      <span>{t("Página ")}{page}{t(" de ")}{totalPages}
      </span>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >{t("Próxima")}</button>
    </nav>
  );
}
