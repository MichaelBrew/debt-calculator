import formatPayoffData from "./AccountsPayoffData";
import { DebtAccountsPayoff } from "../interfaces";

describe("AccountsPayoffData", () => {
  test("formats DebtAccountsPayoff correctly", () => {
    const payoff: DebtAccountsPayoff = {
      totalPrincipalPaidCents: 250045,
      totalInterestPaidCents: 10050,
      payoffDate: new Date("2019-01-01"),
    };
    expect(formatPayoffData(payoff)).toMatchObject({
      totalPrincipalPaid: "$2,500.45",
      totalInterestPaid: "$100.50",
      payoffDate: "January 1st, 2019",
    });
  });
});