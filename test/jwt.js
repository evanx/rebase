const jwt = require('jsonwebtoken');

const main = async () => {
    const userId = 'evanx@test.com';
    const secret = 'secret';
    const token = jwt.sign({ id: userId }, secret, {
        expiresIn: 86400
    });
    console.log(token)
    const payload = jwt.verify(token, secret)
    console.log(JSON.stringify(payload, null, 2))
}

main().catch(console.error)
