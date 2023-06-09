
const createError = require('http-errors')

const User = require('../models/user')
const {authSchema} =  require('../helper/validation-schema')
const {signAccessToken,signRefreshToken,verifyRefreshToken} = require('../helper/jwt_helper')


module.exports = {
    register: async(req,res,next) => {
        try {
         //   const {email,password} = req.body
        //    if(!email || !password){
         //       throw createError.BadRequest()
          //  }
    
           const result = await authSchema.validateAsync(req.body)
            
    
            const doesExist = await User.findOne({email:result.email})
            if(doesExist)
            throw createError.Conflict(`${email} is alredy been register`)
    
            const user = new User(result)
            const savedUser = await  user.save()
            const accessToken = await signAccessToken(savedUser.id)
            const refreshToken = await signRefreshToken(savedUser.id)
            res.send({accessToken, refreshToken})
        } catch (error) {
            if(error.isJoe === true)
            error.status = 422
            next(error)
        }
     },

     login: async(req,res,next) => {
        try {
           const result = await authSchema.validateAsync(req.body)
           const user =  await User.findOne({email:result.email})
           if(!user) throw createError.NotFound('user not registered')
   
           const isMatch = await user.isValidPassword(result.password)
           if(!isMatch) throw createError.Unauthorized('UserName/password not valid')
   
           const accessToken = await signAccessToken(user.id)
           const refreshToken = await signRefreshToken(user.id)
   
           res.send({accessToken,refreshToken})
   
        } catch (error) {
           if(error.isJoe === true) 
           return next(createError.BadRequest('Invalide Username/Password'))
           next(error)
        }
   },

   refreshToken: async(req,res,next) => {
    try {
        const { refreshToken } = req.body
        if(!refreshToken) throw createError.BadRequest()
       const userId =  await verifyRefreshToken(refreshToken)

       const accessToken = await signAccessToken(userId)
       const refToken = await signRefreshToken(userId)
       res.send({accessToken:accessToken, refreshToken: refToken})
    } catch (error) {
        next(error)
    }
},
}