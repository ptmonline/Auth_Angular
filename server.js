var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var jwtSecret = 'fhusedif7vhclsdkf0oljfasdsf';

var app = express();

var user = {username: 'pau', password: 'pau'}

app.use(cors());
app.use(bodyParser.json());
app.use(expressJwt({secret: jwtSecret}).unless({path: ['/login']}));

app.get('/random-user', function(req,res){
  var user = faker.helpers.userCard();
  user.avatar = faker.image.avatar();
  res.json(user);
});

app.get('/me', function(req, res){
  res.send(req.user)
})

app.post('/login', authenticate, function(req, res){
var token = jwt.sign({
  username: user.username
}, jwtSecret)
  res.send({
    user: user,
    token: token
  });
})

app.listen(3000, function(){
  console.log('working on port 3000!');
});

function authenticate(req, res, next){
  var body = req.body;
  if(!body.username || !body.password){
    res.status(400).end('Information incomplete')
  }
  if(body.username !== user.username || body.password !== user.password){
    res.status(401).end('Try again')
  }
  next();
}
