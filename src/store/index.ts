import {
  Account,
  Security,
  Advisor,
  advisor_schema,
  security_schema,
  account_schema,
} from "../schemas/base_data";

import advisor_data from "../../data/advisor_data.json";

import securities_data from "../../data/securities_data.json";
import account_data from "../../data/account_data.json";

class Store {
  advisor_data: Advisor[] = [];
  security_data: Security[] = [];
  account_data: Account[] = [];
  holdings_map: Map<string, number> = new Map<string, number>();
  custodians_map: Map<
    string,
    { advisor: string; count: number; rep_ids: string[] }[]
  > = new Map<
    string,
    { advisor: string; count: number; rep_ids: string[] }[]
  >();

  constructor() {
    const parsed_account = account_schema.array().safeParse(account_data);
    const parsed_securities = security_schema
      .array()
      .safeParse(securities_data);
    const parsed_advisor = advisor_schema.array().safeParse(advisor_data);

    if (
      parsed_account.error ||
      parsed_securities.error ||
      parsed_advisor.error
    ) {
      throw new Error(
        "The data passed via JSON is not structured in line with the assumptions highlighted in the README" +
          parsed_account.error +
          parsed_advisor.error +
          parsed_securities.error
      );
    }

    this.account_data = parsed_account.data;
    this.security_data = parsed_securities.data;
    this.advisor_data = parsed_advisor.data;

    this.aggregate_holdings();
    this.aggregate_advisors_per_custodians_map();
  }

  aggregate_holdings() {
    //populate the holdings map with the structure {ticket: $$$} so we can quickly aggregate the holdings data

    this.account_data.forEach((account) => {
      account.holdings.forEach((holding) => {
        //ticker is the key, if it doesn't exist initialize it at zero and crunch the numbers

        const running_total = this.holdings_map.get(holding.ticker);

        const dollar_amount = holding.units * holding.unitPrice;

        this.holdings_map.set(
          holding.ticker,
          (running_total ?? 0) + dollar_amount
        );
      });
    });
  }

  get_global_holdings_value() {
    return format_number_to_currency(
      Array.from(this.holdings_map.values()).reduce(
        (sum, value) => sum + value,
        0
      )
    );
  }

  get_account_holdings_value(): {
    account_name: string;
    account_number: string;
    holdings_value: string;
  }[] {
    //return the holdings array by creating a new array with the totaled holdings value for each account
    const holdings_array: {
      account_name: string;
      account_number: string;
      holdings_value: string;
    }[] = [];

    this.account_data.forEach((account) => {
      const total_value = account.holdings.reduce((accumulator, current) => {
        accumulator += current.unitPrice * current.units;

        return accumulator;
      }, 0);

      holdings_array.push({
        account_name: account.name,
        account_number: account.number,
        holdings_value: format_number_to_currency(total_value),
      });
    });

    return holdings_array;
  }

  get_top_securities_sorted() {
    return Array.from(this.holdings_map.entries())
      .sort(([_ticket1, holding1], [_ticket2, holding2]) => holding1 - holding2)
      .map(([ticker, value]) => ({ [ticker]: value }));
  }

  aggregate_advisors_per_custodians_map() {
    //for all of the advisors and the custodians contained within them:
    this.advisor_data.forEach((advisor) => {
      advisor.custodians.forEach((custodian) => {
        const custodian_name = custodian.name;
        const rep_id = custodian.repId;
        const advisor_name = advisor.name;

        //check if custodian info exists
        const custodian_information = this.custodians_map.get(custodian.name);

        //if not, make a new one
        if (!custodian_information) {
          this.custodians_map.set(custodian_name, [
            { advisor: advisor_name, count: 1, rep_ids: [rep_id] },
          ]);
          return;
        }

        //if so, look for the advisor, and if its not there make a new one, if it is increment the count and push the rep_ids
        const advisor_index = custodian_information.findIndex(
          (info) => info.advisor === advisor_name
        );

        if (advisor_index === -1) {
          custodian_information.push({
            advisor: advisor_name,
            count: 1,
            rep_ids: [rep_id],
          });
        } else {
          // Update existing advisor information
          const advisor_info = custodian_information[advisor_index];
          custodian_information[advisor_index] = {
            ...advisor_info,
            count: advisor_info.count + 1,
            rep_ids: [...advisor_info.rep_ids, rep_id],
          };
        }
        this.custodians_map.set(custodian.name, custodian_information);
      });
    });

    //then we order the array via count, it will modify in place
    this.custodians_map.forEach((value, _key) => {
      value.sort((a, b) => b.count - a.count);
    });
  }

  get_custodians_map() {
    return Object.fromEntries(this.custodians_map.entries());
  }
}

export const server_store = new Store();

export function format_number_to_currency(raw_number: number): string {
  return raw_number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
