const { validationResult, matchedData } = require('express-validator');

const validate=(validations)=>{
    const validateArray=Array.isArray(validations)?validations:[validations];
    return async (req,res,next)=>{
        await Promise.all(validateArray.map(v=>v.run(req)));
    
        const errors=validationResult(req);
        if(errors.isEmpty()){
            req.validatedData = matchedData(req, { locations: ['body', 'params', 'query'], includeOptionals: true });
            return next();
        }  
        
        const formattedErrors=errors.array().map(err=>({
            field:err.path,
            message:err.msg,
            value:err.value
        }));
        
        return res.status(400).json({
            success:false,
            message:'Validation échouée',
            errors:formattedErrors
        });
    }
};

module.exports=validate;