const mongoose = require('mongoose')

const datafileSchema = new mongoose.Schema({  
    filetype: {
        type: String
    },
    filename: {
        type:String
    },
    data: {
        type:Buffer
    },
    filepath:{
        type:String
    },
    size:{
        type:Number,
        default:0

    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }  
})

const DataFile = mongoose.model('DataFile', datafileSchema)
module.exports = DataFile