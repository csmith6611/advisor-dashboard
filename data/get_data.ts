import { server_store } from "../src/store";

import * as fs from 'fs/promises';
import * as path from 'path';

// Define the path to your JSON file
const filePath = path.join(__dirname, 'final_data.json');


function get_aggregated_data(){

    const total_value_globally = server_store.get_global_holdings_value()
    const total_value_per_account = server_store.get_account_holdings_value()
    const top_ten_securities = server_store.get_top_10_securities()
    const advisor_count_per_custodian = server_store.get_custodians_map()


    const json_data = JSON.stringify({
        total_value: total_value_globally,
        value_per_account: total_value_per_account,
        top_ten_securities: top_ten_securities,
        advisor_custodian_count: advisor_count_per_custodian
    })


    console.log(`
        Total Value Globally: ${total_value_globally}

        Total Value Per Account: ${JSON.stringify(total_value_per_account)}

        Top Ten Securities: ${JSON.stringify(top_ten_securities)}

        Advisor Count Per Custodian: ${JSON.stringify(advisor_count_per_custodian)}
        
        `)


    fs.writeFile(filePath, json_data, 'utf8');


}

get_aggregated_data()