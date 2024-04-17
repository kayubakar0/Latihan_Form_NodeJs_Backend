import User from "../models/user.js"
import emailExist from "../libraries/emailExist.js"
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken"
import dotenv from "dotenv"

//import env
const env = dotenv.config().parsed

//Function to generate token JWT
const generateAccessToken = (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRATION_TIME}
        )
}

const generateRefleshToken = (payload) => {
    return jsonwebtoken.sign(
        payload,
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: env.REFRESH_TOKEN_EXPIRATION_TIME}
        )
}

class AuthController {
    async register(req, res) {
        try {
            //Check form required fill or not
            if(!req.body.fullname) { throw { code: 400, message: 'FULLNAME_IS_REQUIRED'}}
            if(!req.body.email) { throw { code: 400, message: 'EMAIL_IS_REQUIRED'}}
            if(!req.body.password) { throw { code: 400, message: 'PASSWORD_IS_REQUIRED'}}

            //Check password more than 6
            if(req.body.password.length < 6) { throw { code: 400, message: 'PASSWORD_MINIMUM_6_CHARACTERS'} }

            //Check email exist or not
            const isEmailExist = await emailExist(req.body.email)
            if(isEmailExist){ throw { code: 409, message: 'EMAIL_ALREADY_EXIST' } }

            //Hash Password
            const salt = await bcrypt.genSalt(10)
            const hashPw = await bcrypt.hash(req.body.password, salt)

            //Add to database
            const user = await User.create({
                fullname: req.body.fullname,
                email: req.body.email,
                password: hashPw
            })

            if(!User) {
                throw{
                    code: 500,
                    message: 'USER_REGISTER_FAILED'
                }
            }

            return res.status(200)
            .json({
                status: true,
                message: 'USER_REGISTER_SUCCES',
                user
            })
        } catch (error) {
            return res.status(error.code || 500)
            .json({
                status: false,
                message: error.message
            })
        }
    }

    async login(req, res) {
        try{
            if(!req.body.email) { throw { code: 400, message: 'EMAIL_IS_REQUIRED'}}
            if(!req.body.password) { throw { code: 400, message: 'PASSWORD_IS_REQUIRED'}}

            const user = await User.findOne({ email: req.body.email })
            if(!user) { throw { code:404, message:'USER_NOT_FOUND'}}

            const isPasswordValid = await bcrypt.compareSync(req.body.password, user.password)
            if(!isPasswordValid) { throw { code:403, message:'INVALID_PASSWORDD'}}

            //generate token JWT
            let payload = { id: user._id}
            const accesToken = await generateAccessToken(payload)
            const refleshToken = await generateRefleshToken(payload)

            return res.status(200)
            .json({
                status: true,
                message: 'USER_LOGIN_SUCCES',
                fullname: user.fullname,
                accesToken,
                refleshToken
            })
        }
        catch(error) {
            return res.status(error.code || 500)
            .json({
                status: false,
                message: error.message
            })
        }
    }

    async refleshToken(req, res) {
        try{
            if(!req.body.refreshToken) { throw { code: 400, message: 'REFLESH_TOKEN_IS_REQUIRED' } }

            //verify reflesh token
            const verify = await jsonwebtoken.verify(req.body.refreshToken, env.REFRESH_TOKEN_SECRET)

            //generate token JWT
            let payload = { id: verify.id}
            const accesToken = await generateAccessToken(payload)
            const refleshToken = await generateRefleshToken(payload)

            return res.status(200).json({
                status: true,
                message: 'REFLESH_TOKEN_SUCCES',
                accesToken,
                refleshToken
            })
        }

        catch(error) {
            //Console log error from JWT
            const errorInvalidJwt = ['invalid signature', 'jwt malformed', 'invalid token', 'jwt must be provided']

            if(error.message == 'jwt expired') {
                error.message = 'REFRESH_TOKEN_EXPIRED'
            } 
            else if(errorInvalidJwt.includes(error.message)) {
                error.message = 'INVALID_REFRESH_TOKEN'
            }

            //console log another error
            return res.status(error.code || 500)
            .json({
                status: false,
                message: error.message
            })
        }
    }
}

export default new AuthController()