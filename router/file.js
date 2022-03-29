const express = require('express');
const router = express.Router();
const { readFile, canIRead } = require('../service/file')
const { checkNotNull, getSuccessRespBody } = require('../util/index')


router.post('/canIRead', async(res, req, next)=>{
    try{
        checkNotNull(res.body, ['url'])
        const result = await canIRead(res.body.url, next);
        req.send(getSuccessRespBody(result))
    }catch(e){
        req.send(getSuccessRespBody({
            flag : false,
            msg : e.message
        }))
    }
});

router.get('/read',  async (res , req, next)=>{
    const { url, encoding } = res.query;
    if(url){
        try{
             const stream = await readFile(url , encoding, next)
             stream.on('data', chunk => {
                 req.write(chunk);
             })
             stream.on('end', ()=>{
                 req.end()
             })
             stream.on('error', err=> {
                 req.end()
             })
        }catch(e){
            console.error(e)
            next(e)
        }
    }else{
        req.send({
            code : 0,
            msg : 'query : url is required'
        })
    }
   
})


module.exports = router
