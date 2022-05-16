const express=require('express')
require('dotenv').config()
require('./src/db/mongoose')
const bodyparser=require('body-parser')
const fileUpload=require('express-fileupload')
const cors = require('cors')
const http=require('http')
const app=express();
const server = http.createServer(app)
const port=3000;
app.use(cors())

//Use json to parser requests
app.use(express.urlencoded({limit: '1000mb', extended: true}));
app.use(express.json({limit: '1000mb', extended: true}));
app.use(fileUpload({
    limits: { fileSize: 10000 * 1024 * 1024 },
}));
const StaticDirectory=__dirname+"/dist/JobApplicationForm/";

app.use(express.static(StaticDirectory));

const adminRouter = require('./src/routes/admin')
const applicationFormRouter = require('./src/routes/application')
const usersRouter = require('./src/routes/user')
const dataFile = require('./src/routes/datafile')
const jobsRouter = require('./src/routes/jobs')

app.use('/admin/', adminRouter)
app.use('/applicationform/', applicationFormRouter)
app.use('/account/', usersRouter)
app.use('/files/', dataFile)
app.use('/jobs/', jobsRouter)
app.get('/', (req,res) => {
    res.sendFile(StaticDirectory+"index.html")
});
app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});