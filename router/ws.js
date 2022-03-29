const { Server } = require("socket.io");
const Cwd = require('../service/cwd')

module.exports = server => {
    const io = new Server(server,  {
        cors : {
            origin : '*'
        }
    })
    io.on('connection', socket => {
        console.log('客户端连接')
        //每个客户端都有一个 cwd实例 ,处理访问路径
        let cwd = new Cwd(socket);
        socket.on("disconnect", (reason) => {
            console.log('客户端断开')
            cwd = null 
        });
    });
}
