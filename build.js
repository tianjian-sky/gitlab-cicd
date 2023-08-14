const fs = require('fs')
const process = require("child_process");

if (fs.existsSync('./dist')) {
    process.execSync(`rm -rf ./dist`)
}
fs.mkdirSync('./dist')
const folerContent = fs.readdirSync('./')
folerContent.forEach(path => {
    if (!path.includes('dist') && path != '.git') {
        process.execSync(`cp -r ${path} ./dist`)
    }
})
const versionBuf = process.execSync(`npm view tianjian-cicd version`)
const version = versionBuf.toString().replace(/\s/g, '')
const pkg = fs.readFileSync('./package.json')
console.log('version', version)
// process.execSync(`npm pkg set version=${version.toString()}`)
fs.writeFileSync('./dist/package.json', pkg.toString().replace(/"version": "[^"]*"/, `"version": "${version}"`))
return 0
