const mongoose = require('mongoose')
const DataFile=require('./datafile')
const jobsSchema = new mongoose.Schema({
    title:String,
    degree:String,
    JobsNumber:String,
    notes:String,
    profession:String,
    availability:{
        type:String,
        default:"open"
    }

})

const Job = mongoose.model('Job', jobsSchema)
module.exports = Job