async function Login(req, res) {
    res.json('login');
}

async function Register(req, res) {
    res.json('register');
}

export default {
    Login,
    Register
}