import { centsToDollars } from "./currency";

describe("currency", () => {
  describe("centsToDollars", () => {
    test("returns correctly formatted strings", () => {
      const numbers: Array<Array<number | string>> = [
        [1, "$0.01"],
        [10, "$0.10"],
        [100, "$1.00"],
        [1000, "$10.00"],
        [10000, "$100.00"],
        [100000, "$1,000.00"],
        [100010, "$1,000.10"],
        [573823, "$5,738.23"],
      ];
      numbers.forEach(([cents, centsFormatted]) => {
        expect(centsToDollars(cents as number)).toBe(centsFormatted);
      });
    });
  });
});
