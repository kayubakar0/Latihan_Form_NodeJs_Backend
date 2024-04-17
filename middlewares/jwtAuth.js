import jsonwebtoken from 'jsonwebtoken'
import dotenv from 'dotenv'

const env = dotenv.config().parsed

const jwtAuth = () => {
    return async (req, res, next) => {
        try {
            if(!req.headers.authorization) { throw { code: 401, message: 'UNAUTHORIZED'}}

            const token = req.headers.authorization.split(' ')[1] // SPLIT request to array and GET access TOKEN ONLY in array 1
            const verify = jsonwebtoken.verify(token, env.ACCESS_TOKEN_SECRET)
            req.jwt = verify
            next() // Continue to next middleware or next controller
        }
        catch (error) {
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

export default jwtAuth