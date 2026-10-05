import { describe, expect, it } from "vitest";
import { rackSchema } from "./racks_dto";

const rackResponse = {
  id: 42,
  display: "Rack 42",
  name: "Rack 42",
  site: { id: 1, display: "INPE", name: "INPE" },
  location: null,
  group: null,
  role: null,
  width: 19,
  u_height: 42,
  starting_unit: 1,
  description: "",
  status: { value: "active", label: "Active" },
  device_count: 0,
};

describe("rackSchema", () => {
  it("mantém a largura quando o NetBox devolve um número", () => {
    expect(rackSchema.parse(rackResponse).width).toBe(19);
  });

  it("normaliza a largura quando o NetBox devolve um objeto de escolha", () => {
    const parsed = rackSchema.parse({
      ...rackResponse,
      width: { value: 19, label: "19 inches" },
    });

    expect(parsed.width).toBe(19);
  });
});
