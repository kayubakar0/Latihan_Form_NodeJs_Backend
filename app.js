import express from "express"
import dotenv from 'dotenv'
import apiRouter from './routes/api.js'
import connection from "./connection.js"

const env = dotenv.config().parsed

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', apiRouter)

// Catch error 404
app.use((req, res) => {
    res.status(404).json({message : '404_NOT_FOUND'})
})

//Mongodb Connection
connection()

app.listen(env.APP_PORT, () => {
    console.log(`Server started on port ${env.APP_PORT}`)
})