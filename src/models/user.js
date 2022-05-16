const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
	Role: {
        type: String,
        default: 'Basic',
        trim: true
    },
	isSubmitted: {
        type: Boolean,
        default: false 
    },
    mobile:{
        type:String,
        default:""
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid email address')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    return userObject
}
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})
userSchema.methods.generateAuthToken = async function () {
    const user = this
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);
    const token = jwt.sign(
        { _id: user._id.toString() ,
            email:user.email,
			role:user.Role,
            mobile:user.mobile,
            expire: parseInt(expireDate / 1000)
    }, process.env.Secret_key)

    user.tokens = { token }
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('أسم ألمستخدم أو كلمة ألمرور غير صحيحه')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('كلمة المرور غير صحيحه')
    }
    return user
}
const User = mongoose.model('User', userSchema)
module.exports = User