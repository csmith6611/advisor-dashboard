import z from "zod";

/*
SAMPLE DATA - Advisor
    "id": "4",
    "name": "Randall",
    "custodians": [
    { "name": "Schwab", "repId": "1271" },
    { "name": "Fidelity", "repId": "8996" }
    ]

*/

//@ASSUMPTION the json would indicate that the id and repId are strings, so that is the assumption I am going with

export const advisor_schema = z.object({
  id: z.string(),
  name: z.string(),
  custodians: z.object({ name: z.string(), repId: z.string() }).array(),
});

export type Advisor = z.infer<typeof advisor_schema>;

/*
SAMPLE DATA - Account
 {
    "name": "Bradley Green - 401k",
    "number": "21889645",
    "repId": "9883",
    "holdings": [
    { "ticker": "HEMCX", "units": 77, "unitPrice": 398.63 }
    ],
    "custodian": "Schwab"
    },

*/

export const account_schema = z.object({
  name: z.string(),
  number: z.string(),
  repId: z.string(),
  holdings: z
    .object({ ticker: z.string(), units: z.number(), unitPrice: z.number() })
    .array(),
  custodian: z.string(),
});

export type Account = z.infer<typeof account_schema>;

/*
SAMPLE DATA - Security:
{
"id": "2e5012db-3a39-415d-93b4-8b1e3b453c6c",
"ticker": "ICKAX",
"name": "Delaware Ivy Crossover Credit Fund Class A",
"dateAdded": "2001-06-07T11:12:56.205Z"
}
*/

export const security_schema = z.object({
  id: z.string(),
  ticker: z.string(),
  name: z.string(),
  dateAdded: z.string(),
});

export type Security = z.infer<typeof security_schema>;
