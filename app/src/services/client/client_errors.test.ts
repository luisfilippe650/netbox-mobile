import { describe, expect, it } from "vitest";
import { z } from "zod";
import { apiErrorMessage, parseWithSchema } from "./client_errors";

describe("parseWithSchema", () => {
  it("informa contexto, campo, requisito e valor recebido", () => {
    expect(() =>
      parseWithSchema(
        z.object({ width: z.number() }),
        { width: { value: 19, label: "19 inches" } },
        "resposta de POST /api/dcim/racks/",
      ),
    ).toThrow(
      'Falha de validação em resposta de POST /api/dcim/racks/: campo "width": esperado número; recebido objeto {"value":19,"label":"19 inches"}',
    );
  });

  it("não inclui valores sensíveis na mensagem", () => {
    expect(() =>
      parseWithSchema(
        z.object({ password: z.string().min(8) }),
        { password: "123" },
        "credenciais",
      ),
    ).toThrow("recebido [valor oculto]");
  });
});

describe("apiErrorMessage", () => {
  it("detalha campos aninhados devolvidos pela API", () => {
    expect(
      apiErrorMessage(
        {
          name: ["Já existe um objeto com este nome."],
          custom_fields: { owner: ["Seleção inválida."] },
        },
        "Erro desconhecido.",
      ),
    ).toBe(
      "name: Já existe um objeto com este nome. · custom_fields.owner: Seleção inválida.",
    );
  });

  it("usa a mensagem alternativa quando a API não envia detalhes", () => {
    expect(apiErrorMessage(null, "Erro desconhecido.")).toBe(
      "Erro desconhecido.",
    );
  });
});
