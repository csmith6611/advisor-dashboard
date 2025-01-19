import { Account, Security, Advisor, advisor_schema, security_schema, account_schema } from "../schemas/base_data";
import json from '../../sample_data.json'


class Store {
    raw_data: unknown[]
    advisor_data: Advisor[] = []
    security_data: Security[] = []
    account_data: Account[] = []

    constructor(){
        

        const json_parsed_data = json as (Account | Security | Advisor )[]
        this.raw_data = json_parsed_data

        //@ASSUMPTION: Data will come in exactly as displayed in prompt, JSON object array with any of the three types

        //sort into three lists types - parse via schema and add it to the relevant array
        for( let value of json_parsed_data){
        
            const advisor_parsed = advisor_schema.safeParse(value)

            if(advisor_parsed.success){
                this.advisor_data.push(advisor_parsed.data)
                continue;
            }

            const security_parsed = security_schema.safeParse(value)

            if(security_parsed.success){
                this.security_data.push(security_parsed.data)
                continue;
            }

            const account_parsed = account_schema.safeParse(value)

            if(account_parsed.success){
                this.account_data.push(account_parsed.data)
                continue;
            }
        
        }
    }

}

export const server_store = new Store()