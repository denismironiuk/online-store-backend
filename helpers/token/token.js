const jwt = require('jsonwebtoken');

function createToken(data){

    const{email,_id}=data

    console.log(email)
    const token = jwt.sign(
        {
          email,
          userId:_id.toString()
        },
        'secret',
       
      );

      return token
}

module.exports = {
    createToken

}