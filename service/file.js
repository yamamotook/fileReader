const { access, stat } =require('fs/promises')
const { constants, createReadStream } = require('fs');

module.exports = {
    //能不能读某个文件
    async canIRead(url){
        try{
            await access(url, constants.R_OK);
            const statInfo = await stat(url);
            return {
                flag : statInfo.isFile(),
                msg :  !statInfo.isFile() ? `${url} isnt type of file` : ''
            }
        }catch(e){
            return {
                flag : false,
                msg : e.message
            }
        }
    },
    //读取文件
    async readFile(url ,encoding, next){
        try{
            await access(url, constants.R_OK)
            const stream = createReadStream(url, {
                encoding
            });
            return stream
        }catch(e){
            next(e)
        }
    }
}