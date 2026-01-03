const { getChats, getDatabases } = require("./models/models");


const data = getDatabases()

data.then(res => console.log(res))