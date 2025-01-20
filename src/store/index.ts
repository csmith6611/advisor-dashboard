import { Account, Security, Advisor, advisor_schema, security_schema, account_schema } from "../schemas/base_data";

import advisor_data from '../../data/advisor_data.json'

import securities_data from '../../data/securities_data.json'
import account_data from '../../data/account_data.json'

class Store {
    advisor_data: Advisor[] = []
    security_data: Security[] = []
    account_data: Account[] = []
    holdings_map: Map<string, number> = new Map<string, number>()
    custodians_map: Map<string, {advisor: string, count: number, rep_ids: number[]}> = new Map<string, {advisor: string, count: number, rep_ids: number[]}>()

    constructor(){
        
        const parsed_account = account_schema.array().safeParse(account_data)
        const parsed_securities = security_schema.array().safeParse(securities_data)
        const parsed_advisor = advisor_schema.array().safeParse(advisor_data)


        if(parsed_account.error || parsed_securities.error || parsed_advisor.error){
            throw new Error("The data passed via JSON is not structured in line with the assumptions highlighted in the README" + parsed_account.error + parsed_advisor.error + parsed_securities.error)
        }

        this.account_data = parsed_account.data
        this.security_data = parsed_securities.data
        this.advisor_data = parsed_advisor.data


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

    get_global_holdings_value(){
      return format_number_to_currency(Array.from(this.holdings_map.values()).reduce((sum, value) => sum + value, 0))
     }

    get_account_holdings_value(): {account_name: string, account_number: string, holdings_value: string }[] {

        
        //return the holdings array by creating a new array with the totaled holdings value for each account
        const holdings_array: {account_name: string, account_number: string, holdings_value: string}[] = []

        this.account_data.forEach((account)=>{

            const total_value = account.holdings.reduce((accumulator, current) => {
                accumulator += (current.unitPrice * current.units)

                return accumulator
            }, 0)



            holdings_array.push({account_name: account.name, account_number: account.number, holdings_value: format_number_to_currency(total_value)})
        })


        return holdings_array

    }
    
    get_top_10_securities(){
        const sorted_array = Array.from(this.holdings_map.entries()).sort(([_ticket1, holding1], [_ticket2, holding2]) => holding1 - holding2).map(([ticker, value])=>({[ticker]: value}))

        return sorted_array.slice(0, 10)
    }
}

export const server_store = new Store()


function format_number_to_currency(raw_number: number): string {
    return  raw_number.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      }); 
}