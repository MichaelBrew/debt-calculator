import * as moment from "moment";

import { centsToDollars } from "./currency";
import { DebtAccountsPayoff, DebtAccountsPayoffFormatted } from "../interfaces";

export default function formatPayoffData(data: DebtAccountsPayoff): DebtAccountsPayoffFormatted {
  return {
    totalPrincipalPaid: centsToDollars(data.totalPrincipalPaidCents),
    totalInterestPaid: centsToDollars(data.totalInterestPaidCents),
    payoffDate: data.payoffDate ? moment.utc(data.payoffDate).format("MMMM Do, YYYY") : null,
  };
}
