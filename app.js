const express = require('express')
 const axios = require('axios')
 const cors = require('cors')
 const redis = require('redis')
const { json } = require('express')

 const redisClient = redis.createClient()
 const DEFAULT_EXPIRATION = 3600

 const app = express()
 app.use(express.urlencoded({extended: true}))
 app.use(cors())

 app.get('/photos',async(req,res) => {
    const albumId = req.query.albumId
    redisClient.get(`photos?albumId=${albumId}`, async (error,photos)=>{
        if(error) console.error(error)
        if(photos != null){
            console.log('cache hit')
            return res.json(JSON.parse(photos))
        }
        else{
            console.log('cache miss')
            const {data} = await axios.get(
                "https://jsonplaceholder.typicode.com/photos",
                {params:{albumId} }
            )
            redisClient.setex(
                `photos?albumId=${albumId}`, 
                DEFAULT_EXPIRATION,
                JSON.stringify(data)
            )
            res.json(data) 
        }

    })
})

app.listen(3000)
