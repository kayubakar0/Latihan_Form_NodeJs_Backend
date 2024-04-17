import user from "../models/user.js";

const emailExist = async (email) => {
    const userMail = await user.findOne({ email: email })
    if(userMail) {return true}
    return false
}

export default emailExist