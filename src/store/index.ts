import { Account, Security, Advisor, advisor_schema, security_schema, account_schema } from "../schemas/base_data";
import json from '../../sample_data.json'


class Store {
    raw_data: unknown[]
    advisor_data: Advisor[] = []
    security_data: Security[] = []
    account_data: Account[] = []
    holdings_map: Map<string, number> = new Map<string, number>()

    constructor(){
        

        const json_parsed_data = json as (Account | Security | Advisor )[]
        this.raw_data = json_parsed_data

        //@ASSUMPTION: Data will come in exactly as displayed in prompt, JSON object array with any of the three types

        //sort into three lists types - parse via schema and add it to the relevant array
        for( let data_entry of json_parsed_data){
        
            const advisor_parsed = advisor_schema.safeParse(data_entry)

            if(advisor_parsed.success){
                this.advisor_data.push(advisor_parsed.data)
                continue;
            }

            const security_parsed = security_schema.safeParse(data_entry)

            if(security_parsed.success){
                this.security_data.push(security_parsed.data)
                continue;
            }

            const account_parsed = account_schema.safeParse(data_entry)

            if(account_parsed.success){
                this.account_data.push(account_parsed.data)
                continue;
            }
        
        }

        this.aggregate_holdings()
    }


    aggregate_holdings(){
        //populate the holdings map with the structure {ticket: $$$} so we can quickly aggregate the holdings data

        this.account_data.forEach((account)=>{

            account.holdings.forEach((holding) =>{

                //ticker is the key, if it doesn't exist initialize it at zero and crunch the numbers

                let running_total = this.holdings_map.get(holding.ticker)

                const dollar_amount = holding.units * holding.unitPrice

                this.holdings_map.set(holding.ticker, (running_total ?? 0) + dollar_amount)
                
            })


        })
       
    }

    get_total_account_holdings_value(){
      return Array.from(this.holdings_map.values()).reduce((sum, value) => sum + value, 0)   
     }

}

export const server_store = new Store()