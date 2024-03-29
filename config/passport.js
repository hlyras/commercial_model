const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const db = require('./connection');

passport.serializeUser(async (user, done) => {
    done(null, user);
});

passport.deserializeUser(async (user, done) => {
    if(user.access == 'ctm'){
        var query = "SELECT * FROM hl_model_db.customers WHERE id='"+user.id+"';";
    } else {
        var query = "SELECT * FROM hl_model_db.users WHERE id='"+user.id+"';";
    };
    let row = await db(query);
    done(null, row[0]);
});

// If you need a ecommerce sign up use this piece of code
// passport.use(
//     'local-signup',
//     new LocalStrategy({
//         usernameField : 'email',
//         passwordField : 'password',
//         passReqToCallback : true
//     },
//     async (req, email, password, done) => {
//         const query = "SELECT * FROM hl_model_db.users WHERE email='"+req.body.email+"';";
//         let users = await db(query);
        
//         if (users.length) {
//             return done(null, false, req.flash('signupMessage', 'Este usuário já está cadastrado.'));
//         } else {
//             const newPartner = {
//                 name: req.body.name,
//                 email: req.body.email,
//                 phone: req.body.phone,
//                 password: bcrypt.hashSync(password, null, null)
//             };
            
//             const insertQuery = "INSERT INTO hl_model_db.users (name, email, phone, password) values ('"
//             +newPartner.name+"', '"
//             +newPartner.email+"', '"
//             +newPartner.phone+"', '"
//             +newPartner.password+"')";

//             db(insertQuery)
//                 .then(row => {
//                     newPartner.id = row.insertId;
//                     return done(null, newPartner);
//                 })
//                 .catch(err => {
//                     console.log(err);
//                     return;
//                 });
//         };
//     })
// );

passport.use(
    'local-login',
    new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    async (req, email, password, done) => {
        const userQuery = "SELECT * FROM hl_model_db.users WHERE email = '"+email+"';";
        const customerQuery = "SELECT * FROM hl_model_db.customers WHERE email = '"+email+"';";
        
        let users = await db(userQuery);
        let customers = await db(customerQuery);
        
        if (!users.length && !customers.length){
            return done(null, false, req.flash('loginMessage', 'Usuário não encontrado.'))
        };

        if(users.length){
            if (!bcrypt.compareSync(password, users[0].password)){
                return done(null, false, req.flash('loginMessage', 'Senha inválida.'));
            };
            return done(null, users[0]);
        };

        if(customers.length){
            if (!bcrypt.compareSync(password, customers[0].password)){
                return done(null, false, req.flash('loginMessage', 'Senha inválida.'));
            };
            return done(null, customers[0]);
        };
    })
);

module.exports = passport;