import { describe, it, expect } from "vitest";
import { sortedHandAfterAdd, makeInitialDeck, restoreDeck, sum } from "../App";

describe("sortedHandAfterAdd", () => {
  it("should add a numeric card to empty hand", () => {
    const result = sortedHandAfterAdd([], "5");
    expect(result).toEqual(["5"]);
  });

  it("should add multiple numeric cards in ascending order", () => {
    const hand = ["12"];
    const result = sortedHandAfterAdd(hand, "3");
    expect(result).toEqual(["3", "12"]);
  });

  it("should keep special cards before numeric cards", () => {
    const hand = ["-2"];
    const result = sortedHandAfterAdd(hand, "5");
    expect(result).toEqual(["-2", "5"]);
  });

  it("should add special card to hand with numeric cards", () => {
    const hand = ["1", "5", "12"];
    const result = sortedHandAfterAdd(hand, "Just One More");
    expect(result).toEqual(["Just One More", "1", "5", "12"]);
  });

  it("should handle adding to hand with multiple special cards", () => {
    const hand = ["-2", "Just One More", "3", "7"];
    const result = sortedHandAfterAdd(hand, "5");
    expect(result).toEqual(["-2", "Just One More", "3", "5", "7"]);
  });

  it("should add numeric card 0 and maintain sort order", () => {
    const hand = ["5", "12"];
    const result = sortedHandAfterAdd(hand, "0");
    expect(result).toEqual(["0", "5", "12"]);
  });

  it("should maintain numeric sort order when adding in middle", () => {
    const hand = ["1", "8"];
    const result = sortedHandAfterAdd(hand, "5");
    expect(result).toEqual(["1", "5", "8"]);
  });

  it("should add duplicate numeric card and sort", () => {
    const hand = ["5", "5", "12"];
    const result = sortedHandAfterAdd(hand, "8");
    expect(result).toEqual(["5", "5", "8", "12"]);
  });

  it("should handle multiple special cards and numeric", () => {
    const hand = ["-2", "-4", "2", "8"];
    const result = sortedHandAfterAdd(hand, "5");
    expect(result).toEqual(["-2", "-4", "2", "5", "8"]);
  });

  it("should add special card to hand with mixed cards", () => {
    const hand = ["-2", "3", "%2", "7"];
    const result = sortedHandAfterAdd(hand, "-6");
    expect(result).toEqual(["-2", "%2", "-6", "3", "7"]);
  });

  it("should handle all special cards", () => {
    let result = [];
    result = sortedHandAfterAdd(result, "Just One More");
    result = sortedHandAfterAdd(result, "-2");
    result = sortedHandAfterAdd(result, "Flip Four");
    expect(result).toEqual(["Just One More", "-2", "Flip Four"]);
  });
});

describe("makeInitialDeck", () => {
  it("should create a deck object with all cards", () => {
    const deck = makeInitialDeck();
    expect(deck).toBeDefined();
    expect(typeof deck).toBe("object");
  });

  it("should have correct count for card 0", () => {
    const deck = makeInitialDeck();
    expect(deck["0"]).toBe(1);
  });

  it("should have correct count for numeric cards", () => {
    const deck = makeInitialDeck();
    expect(deck["1"]).toBe(1);
    expect(deck["2"]).toBe(2);
    expect(deck["3"]).toBe(3);
    expect(deck["5"]).toBe(5);
    expect(deck["7"]).toBe(6);
    expect(deck["12"]).toBe(12);
    expect(deck["13"]).toBe(12);
  });

  it("should have correct count for replacement special cards", () => {
    const deck = makeInitialDeck();
    expect(deck["-2"]).toBe(1);
    expect(deck["-4"]).toBe(1);
    expect(deck["-6"]).toBe(1);
    expect(deck["-8"]).toBe(1);
    expect(deck["-10"]).toBe(1);
    expect(deck["%2"]).toBe(1);
    expect(deck).not.toHaveProperty("+2");
    expect(deck).not.toHaveProperty("+4");
    expect(deck).not.toHaveProperty("+6");
    expect(deck).not.toHaveProperty("+8");
    expect(deck).not.toHaveProperty("+10");
    expect(deck).not.toHaveProperty("x2");
  });

  it("should have correct count for special action cards", () => {
    const deck = makeInitialDeck();
    expect(deck["Just One More"]).toBe(2);
    expect(deck["Flip Four"]).toBe(2);
    expect(deck["Swap"]).toBe(2);
    expect(deck["Steal"]).toBe(2);
    expect(deck["Discard"]).toBe(2);
    expect(deck["Lucky 13"]).toBe(1);
    expect(deck["Unlucky 7"]).toBe(1);
  });

  it("should have all expected keys", () => {
    const deck = makeInitialDeck();
    const expectedKeys = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "-2",
      "-4",
      "-6",
      "-8",
      "-10",
      "%2",
      "Just One More",
      "Flip Four",
      "Swap",
      "Steal",
      "Discard",
      "Lucky 13",
      "Unlucky 7",
    ];
    expectedKeys.forEach((key) => {
      expect(deck).toHaveProperty(key);
    });
  });

  it("should return consistent deck composition", () => {
    const deck1 = makeInitialDeck();
    const deck2 = makeInitialDeck();
    expect(deck1).toEqual(deck2);
  });

  it("should add new cards when restoring a saved deck from the previous version", () => {
    const oldDeck = makeInitialDeck();
    delete oldDeck["13"];
    const restored = restoreDeck(oldDeck);
    expect(restored["13"]).toBe(12);
  });

  it("should preserve saved card counts when restoring a deck", () => {
    const restored = restoreDeck({ ...makeInitialDeck(), "5": 2 });
    expect(restored["5"]).toBe(2);
  });

  it("should migrate an unchanged saved default deck to the new counts", () => {
    const previousDefaultDeck = {
      ...makeInitialDeck(),
      "+2": 1,
      "+4": 1,
      "+6": 1,
      "+8": 1,
      "+10": 1,
      x2: 1,
      "Just One More": 3,
      "Flip Four": 3,
      Swap: 3,
      Steal: 3,
      Discard: 3,
    };
    for (const card of [
      "-2",
      "-4",
      "-6",
      "-8",
      "-10",
      "%2",
      "Lucky 13",
      "Unlucky 7",
    ]) {
      delete previousDefaultDeck[card];
    }

    expect(restoreDeck(previousDefaultDeck)).toEqual(makeInitialDeck());
  });

  it("should migrate a saved default deck missing newly added cards", () => {
    const previousDefaultDeck = {
      ...makeInitialDeck(),
    };
    delete previousDefaultDeck["Lucky 13"];
    delete previousDefaultDeck["Unlucky 7"];

    expect(restoreDeck(previousDefaultDeck)).toEqual(makeInitialDeck());
  });

  it("should migrate an unchanged saved deck to the corrected 13-card count", () => {
    const previousDefaultDeck = {
      ...makeInitialDeck(),
      "13": 13,
    };

    expect(restoreDeck(previousDefaultDeck)).toEqual(makeInitialDeck());
  });

  it("should migrate an unchanged saved deck to the corrected 7-card count", () => {
    const previousDefaultDeck = {
      ...makeInitialDeck(),
      "7": 7,
    };

    expect(restoreDeck(previousDefaultDeck)).toEqual(makeInitialDeck());
  });

  it("should add replacement cards and remove retired cards from saved decks", () => {
    const previousDeck = {
      ...makeInitialDeck(),
      "+2": 0,
      "+4": 1,
      "+6": 0,
      "+8": 1,
      "+10": 1,
      x2: 0,
    };
    delete previousDeck["-2"];
    delete previousDeck["-4"];
    delete previousDeck["-6"];
    delete previousDeck["-8"];
    delete previousDeck["-10"];
    delete previousDeck["%2"];

    const restored = restoreDeck(previousDeck);
    expect(restored["-2"]).toBe(1);
    expect(restored["-4"]).toBe(1);
    expect(restored["-6"]).toBe(1);
    expect(restored["-8"]).toBe(1);
    expect(restored["-10"]).toBe(1);
    expect(restored["%2"]).toBe(1);
    expect(restored).not.toHaveProperty("+2");
    expect(restored).not.toHaveProperty("+4");
    expect(restored).not.toHaveProperty("+6");
    expect(restored).not.toHaveProperty("+8");
    expect(restored).not.toHaveProperty("+10");
    expect(restored).not.toHaveProperty("x2");
  });

  it("should discard cards that are no longer part of the deck", () => {
    const restored = restoreDeck({
      ...makeInitialDeck(),
      freeze: 2,
      "flip three": 1,
      "second chance": 3,
    });
    expect(restored).not.toHaveProperty("freeze");
    expect(restored).not.toHaveProperty("flip three");
    expect(restored).not.toHaveProperty("second chance");
    expect(sum(restored)).toBe(108);
  });
});

describe("sum", () => {
  it("should sum values in an object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(sum(obj)).toBe(6);
  });

  it("should handle empty object", () => {
    expect(sum({})).toBe(0);
  });

  it("should handle object with zero values", () => {
    const obj = { a: 0, b: 5, c: 0 };
    expect(sum(obj)).toBe(5);
  });

  it("should handle object with negative values", () => {
    const obj = { a: 10, b: -3, c: 5 };
    expect(sum(obj)).toBe(12);
  });

  it("should calculate correct total for initial deck", () => {
    const deck = makeInitialDeck();
    const total = sum(deck);
    // 0(1) + 1(1) + 2(2) + 3(3) + ... + 6(6) + 7(6) + 8(8) + ... + 12(12) + 13(12)
    // Numeric cards total 1 + 78 + 12 - 1 = 90
    // Specials: 1 + 1 + 1 + 1 + 1 + 1 + 2 + 2 + 2 + 2 + 2 + 1 + 1 = 18
    // Total: 90 + 18 = 108
    expect(total).toBe(108);
  });

  it("should sum numeric string keys", () => {
    const deck = { 0: 1, 1: 1, 2: 2 };
    expect(sum(deck)).toBe(4);
  });
});
