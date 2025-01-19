import express from 'express';
import dotenv from 'dotenv'
import { server_store } from './store';

dotenv.config()


const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send(JSON.stringify(server_store.raw_data))

});

app.get('/account', (req,res) => {
    res.send(JSON.stringify(server_store.account_data))
})


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});