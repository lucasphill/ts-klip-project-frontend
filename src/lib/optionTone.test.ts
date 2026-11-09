import { describe, expect, it } from "vitest";
import { getOptionTone } from "./optionTone";

describe("getOptionTone", () => {
  it("maps priority words to semantic colors regardless of case and accents", () => {
    expect(getOptionTone("Alta", 0)).toBe("red");
    expect(getOptionTone("Média", 1)).toBe("amber");
    expect(getOptionTone("media", 1)).toBe("amber");
    expect(getOptionTone(" Baixa ", 2)).toBe("emerald");
  });

  it("falls back to a stable palette by position for other options", () => {
    expect(getOptionTone("Backend", 0)).toBe("sky");
    expect(getOptionTone("Frontend", 1)).toBe("violet");
    expect(getOptionTone("Infra", 6)).toBe("sky");
  });
});
