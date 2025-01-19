import express from 'express';
import dotenv from 'dotenv'
import { server_store } from './store';

dotenv.config()


const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(JSON.stringify('hello world'))

});

app.get('/account', (req,res) => {
    res.send(JSON.stringify(server_store.account_data))
})



//@todo add query param to check value of individual holding
app.get("/holdings", (req, res) => {
    res.send(JSON.stringify(server_store.holdings_map.get('HEMCX')))
})

app.get("/holdings/total", (req, res) => {
    res.send(JSON.stringify(server_store.get_top_10_securities()))
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});