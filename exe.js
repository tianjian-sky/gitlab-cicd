const fs = require('fs')
fs.writeFile('./log', new Date().toLocaleString(), function (err) {
    if (err) {
        return console.error(err)
    }
    console.log("数据写入成功！")
})