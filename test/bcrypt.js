const bcrypt = require('bcrypt');
const saltRounds = 12;

const main = async () => {
    const password = 'test';
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(hash)
}

main().catch(console.error)