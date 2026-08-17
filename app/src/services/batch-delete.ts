import type { BatchDeleteResult } from "./view_models";

/**
 * Executa exclusões independentes e preserva o resultado de cada ID. Assim, a
 * tela remove da seleção somente o que a API realmente excluiu e permite uma
 * nova tentativa apenas para os itens que falharam.
 */
export async function deleteResources(
  ids: readonly number[],
  remove: (id: number) => Promise<unknown>,
  singularLabel: string,
): Promise<BatchDeleteResult> {
  const results = await Promise.allSettled(ids.map((id) => remove(id)));
  return results.reduce<BatchDeleteResult>(
    (summary, result, index) => {
      if (result.status === "fulfilled") summary.removedIds.push(ids[index]);
      else {
        const reason =
          result.reason instanceof Error ? `: ${result.reason.message}` : "";
        summary.failedMessages.push(
          `Não foi possível excluir ${singularLabel} ${ids[index]}${reason}`,
        );
      }
      return summary;
    },
    { removedIds: [], failedMessages: [] },
  );
}
