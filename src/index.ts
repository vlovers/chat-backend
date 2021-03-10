import {createServer} from 'http';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

import {createRoutes, createSocket} from './core'
import "./core/db";

const app = express();
const http = createServer(app);
const io = createSocket(http);

createRoutes(app, io);

http.listen(process.env.PORT, function() {
    console.log(`Server http://localhost:${process.env.PORT}`);
});
