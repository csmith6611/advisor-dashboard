import express, {Request, Response} from 'express';
import dotenv from 'dotenv'
import { server_store } from './store';

dotenv.config()


const app = express();
const port = 3000;



/*supported query params:
    ticker
    sort
*/
app.get("/holding", (req: Request<{}, {}, {}, {ticker: string | undefined, sort: "asc" | "desc" | undefined }>, res) => {
    const ticker = req.query.ticker
    const sort = req.query.sort

    if(ticker){
        res.json(server_store.holdings_map.get(ticker) ?? {message: 'No appropriate ticker found'})
        return
    }

    switch(sort){
        case 'asc':
            res.json(server_store.get_top_securities_sorted().reverse())
            return
        case 'desc':
            res.json(server_store.get_top_securities_sorted())
            return
    }

    res.json(server_store.get_account_holdings_value())

})
app.get("/holding/total", (req, res) => {
    res.json(server_store.get_global_holdings_value())
})


/*supported query params:
    name
    id
    
*/
app.get("/advisor", (req: Request<{}, {}, {}, {name: string | undefined, id: string | undefined}>, res) => {
    const name = req.query.name
    const id = req.query.id
    
    if(!name && !id){
        res.json(server_store.advisor_data)
        return
    }

    const relevant_advisor = server_store.advisor_data.find((advisor) => advisor.id === id || advisor.name === name)
    res.json(relevant_advisor ?? {message: "no relevant advisor found"})
})

/*supported query params:
    accountNumber
    name
    sortValues
    {accountNumber: string | undefined, sortValues: 'asc' | 'desc' | undefined}
*/
app.get("/account", (req: Request<{}, {}, {}, {accountNumber: string | undefined, sortValues: 'asc' | 'desc' | undefined}>, res) => {
    const account_number = req.query.accountNumber
    const sortValues = req.query.sortValues
    
    if(account_number){
        const relevant_account = server_store.account_data.find((account)=>account.number === account_number)
        res.json(relevant_account ?? {message: "no relevant account found"})
        return
    }

    if(sortValues){
        const sorted_accounts_by_total_value = server_store.get_account_holdings_value().sort((account1, account2)=> {
            const value1 = account1.holdings_value
            const value2 = account2.holdings_value

            return Number(value1) - Number(value2)
        })

        switch (sortValues){
            case 'asc': 
                res.json(sorted_accounts_by_total_value.reverse())
                return
            case 'desc': 
                res.json(sorted_accounts_by_total_value)
                return
        }
    }

     res.json(server_store.account_data)
})


/*supported query params:
    name

*/
app.get("/custodian", (req: Request<{}, {}, {}, {name: string, }>, res) => {
    const name = req.query.name
    

    const custodians_object = server_store.get_custodians_map()

    

    if(name){
        
        const return_obj = Object.fromEntries(Object.entries(custodians_object).filter(([custodian, _advisor])=>{
           return custodian === name
        }))
        JSON.stringify(return_obj) === '{}' ? res.json({message: "no custodians found by that name"}) : res.json(return_obj)
        return
    }

    res.json(custodians_object)

  
})


/*supported query params:
    name
    id
    ticker
*/
app.get("/security", (req: Request<{}, {}, {}, {name: string | undefined, id: string | undefined, ticker: string | undefined}>, res) => {
        const name = req.query.name;
        const id = req.query.id;
        const ticker = req.query.ticker

        const securities_data = server_store.security_data

        //if nothing is specified, just return raw data
        if (!name && !id && !ticker) {
            res.json(securities_data);
            return
        }



        const filtered_securities = securities_data.filter((security) => {
            return (name && security.name === name) || (id && security.id === id) || (ticker && security.ticker === ticker);
        });

        res.json(filtered_securities.length > 0 ? filtered_securities : {message: "No relevant securities found"});
    });
    
  





app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});