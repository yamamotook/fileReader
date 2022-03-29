const express = require('express');
const http = require('http');
const cors = require('cors')
const errorMiddleWare = require('./middleWare/errorMiddleWare')
const bodyParser = require('body-parser')
const port = 10086;
const app = express();
const server = http.createServer(app)

// handle static source
app.use(express.static('public'))
app.use(bodyParser.json());
// handle cross origin
app.use(cors())

//handle websocket
require('./router/ws')(server);

const fileRouter = require('./router/file');
app.use('/fs', fileRouter)
app.use(errorMiddleWare)

server.listen(port, ()=>{
    console.log(`server started on ${port}`)
})
