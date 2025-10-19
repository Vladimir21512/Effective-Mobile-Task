import { useExpressServer } from 'routing-controllers';
import path from 'path';
import bodyParser from 'body-parser';
import 'reflect-metadata';
import express from 'express'




const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
useExpressServer(app, {
  controllers: [path.join(__dirname + '/controller/*.js')]
});


app.listen(process.env.PORT);
// [path.join(__dirname + '/controller/*.js')]