import { describe, expect, it } from "vitest";
import { getKeyboardViewport } from "./useKeyboardViewport";

describe("getKeyboardViewport", () => {
  it("returns null when the visible area matches the window", () => {
    expect(getKeyboardViewport({ height: 800, offsetTop: 0, scale: 1 }, 800)).toBeNull();
  });

  it("ignores small differences such as collapsing browser bars", () => {
    expect(getKeyboardViewport({ height: 760, offsetTop: 0, scale: 1 }, 800)).toBeNull();
  });

  it("returns the visible area when the keyboard is open", () => {
    expect(getKeyboardViewport({ height: 480, offsetTop: 0, scale: 1 }, 800)).toEqual({
      top: 0,
      height: 480,
    });
  });

  it("keeps the offset when iOS scrolls the page to show the focused field", () => {
    expect(getKeyboardViewport({ height: 480, offsetTop: 60, scale: 1 }, 800)).toEqual({
      top: 60,
      height: 480,
    });
  });

  it("does not treat pinch zoom as a keyboard", () => {
    expect(getKeyboardViewport({ height: 400, offsetTop: 0, scale: 2 }, 800)).toBeNull();
  });
});
