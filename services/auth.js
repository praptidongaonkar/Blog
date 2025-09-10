const JWT = require("jsonwebtoken");

const secret = "Pravik@09";

function createTokenForUser(user){
    const payload ={
        _id: user._id,
        email : user.email,
        profileImageURL: user.profileImageURL|| "/images/default.png",
        fullName: user.fullName, 
        role: user.role,
    };

    const token = JWT.sign(payload , secret, { expiresIn: "1d" });
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token , secret);
    return payload;
}

module.exports ={
    createTokenForUser,
    validateToken,
};