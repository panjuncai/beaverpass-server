//app.js
const express = require('express')
const session = require('express-session')
const app = express()
     
app.use(session({
	secret: '94c5bd3eba894fc0baa7c68e7abd31bde90f9dd0a1492b139acf69951d86ab9ac8f16acbca71a906a0f7cb012b04cc2af2f875ef16eb6cef4f8b55524caa25a9v',
	resave: false,
}))
app.get('/',(req,res) => {
    res.send("hello");
});
app.listen(4000, () => {
	console.log('Server is running at port 3000')
})
