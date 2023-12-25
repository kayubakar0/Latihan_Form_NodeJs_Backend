import express from "express";

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/', (request, response) => {
    response.json({title : `Hello world ${request.query.nama}, umur ${request.body.umur}`})
})

app.post('/', (request, response) => {
    response.json({title : `Hello world ${request.body.orang.nama}, umur ${request.body.orang.umur}`})
})

app.listen(3000, () => {
    console.log('Server started on port 3000')
})