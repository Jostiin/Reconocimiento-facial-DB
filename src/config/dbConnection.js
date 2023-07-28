const mysql = require("mysql")


module.exports = () => {
    return mysql.createConnection({
        host:"blfwenfbvy67nyrdjnn1-mysql.services.clever-cloud.com",
        database:"blfwenfbvy67nyrdjnn1",
        user:"u9wueh4gxmanc7s0",
        password:"piPiMzicesnKFxSGlych",
        port:'3306'
    })
}