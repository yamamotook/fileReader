module.exports = {
    getSuccessRespBody(payload){
        return {
            code : 0,
            data : payload
        }
    },
    checkNotNull(query, property){
        const nulls = property.filter(p => query[p] === null || query[p]== undefined)
        if(nulls.length) {
            throw Error(`query ${nulls} required`)
        }
    }
}