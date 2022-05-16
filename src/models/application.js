const mongoose = require('mongoose')
const DataFile=require('./datafile')
const applicationSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    job:{
        owner:{
            type:mongoose.Schema.Types.ObjectId,
        },
        title:{
            type:String
        }
    },
    Gender:String,
    BirthDate:String,
    idNumber:String,
    address:String,

    MaritialStatus:String,
    NumberOfChilderen:Number,
    DateOfMarriage:String,
    IsPartenerEmployeed:String,

    degree:String,
    degreeDate:String,
    degreeGPA:Number,
    degreeRank:Number,
    isOfSpecialCareNeeds:String,
    isOfThreeCollegeRanks:String,
    degreeCountry:String,
    degreeUnivercity:String,
    degreeCollege:String,
    degreeDepartment:String,
    degreeBranch:String,
    degreeProfession:String,
    dailyContract:{
        isAvailable:String,
        office:String,
        startDate:String,
        endDate:String
    },
    permanentContract:{
        isAvailable:String,
        office:String,
        startDate:String,
        endDate:String
    },
    mobile:String,
    email:String,
    isPpoliticalPrisonerssRelatives:String,
    isMartyrRelatives:String,
    isMinority:{
        isFromMinority:String,
        minorityKind:String
    },
    uploader:{
        type:String
    },
    lastupdate:{
        type:Date,
        default:new Date()
    },
    FilePath: {
        type: String
    },
    applicationScore:{
        graduationYearScore:{type:Number,default:0},
        graduationGPAScore:{type:Number,default:0},
        maritialScore:{type:Number,default:0},
        contractScore:{type:Number,default:0},
    },
    finalScore:{
        type:Number,
        default:0
    },
    interviewScore:{
        type:Number,
        default:0
    },
    acceptance:{
        type:String,
        default:""
    }
})
applicationSchema.virtual('file', {
    ref: 'DataFile',
    localField: '_id',
    foreignField: 'owner'
})

const ApplicationForm = mongoose.model('ApplicationForm', applicationSchema)

module.exports = ApplicationForm