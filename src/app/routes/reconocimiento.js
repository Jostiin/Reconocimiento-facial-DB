const { json } = require('body-parser');
const dbConnection = require('../../config/dbConnection');
const { options } = require('../../config/server');
const fs = require("fs")
const path = require('path');
//Se define variables para su uso 
var name_user = null
var optionDB = null
var business = null
var acces = false
var error_navbar = false

//Se exporta el modulo
module.exports = app => {
    //Se crea una instancia de conexion
    const conection = dbConnection();
    //Se renderiza la pagina index
    //cuando se encuentre en la ruta /

   
    app.get('/',(req,res) =>{
        //let username = req.body.name
        //let password = req.body.pass
        var ip = req.header("x-forwarded-fir") || req.connection.remoteAddress;
        
        conection.query(`SELECT Business from admins WHERE ip='${ip}'`,function(error,result){
            if(error){
                throw error
                
            }else{
                if(result.length == 0) {
                    console.log(ip)
                    res.render('not _authorized')
                }
                else res.render('index',{
                    navbar:error_navbar
                })
               
               
            }
        })
      

    });
    //Se hace una consulta a la base de datos
    app.get('/mysql',(req,res) =>{
        conection.query(`SELECT Nombre,image1,image2 from wide`,function(error,result){
            if(error){
                throw error
            }else{
                for (let index = 0; index < result.length; index++) {
                   
                    //Revisa si la carpeta existe, sino se crea 
                    if(fs.existsSync(`src/app/labeled_images/${result[index]["Nombre"]}`)){
                       
                        fs.writeFileSync(`src/app/labeled_images/${result[index]["Nombre"]}/1.jpg`,result[index]["image1"])
                        fs.writeFileSync(`src/app/labeled_images/${result[index]["Nombre"]}/2.jpg`,result[index]["image2"])
                    }else{
                     
                        fs.mkdir(`src/app/labeled_images/${result[index]["Nombre"]}`,{recursive:true},(err)=>{
                            if(err) throw err
                            else{
                                fs.writeFileSync(`src/app/labeled_images/${result[index]["Nombre"]}/1.jpg`,result[index]["image1"])
                                fs.writeFileSync(`src/app/labeled_images/${result[index]["Nombre"]}/2.jpg`,result[index]["image2"])
                            }
                        })
                      
                    }
                    //Se envia un JSON con datos de la consulta
                    
                }
                res.send(JSON.stringify(result))
                
            }
        })
       
    });
    //Ruta de guardado exitoso
    app.post("/save_succesfull",(req,res)=>{
        //Si los datos registran null se redirige a index
        if(name_user == null  || optionDB==null) res.redirect("/")
        else{
            //Se crea una instancia del tiempo
            var date = new Date()
            //Renderiza una pagina pasandole datos
            res.render("save",{
                name:name_user,
                option:optionDB,
                date:date.toLocaleString()
            })
        }
        
    })
    //Ruta para redirecionar a index
    app.post('/reset',(req,res) =>{
        acces = false
        res.redirect("/")
    })

    app.post('/error',(req,res) =>{
        error_navbar = req.body.navbar
        res.redirect("/")
    })

    app.post('/add_user',(req,res) =>{
        res.render("add_user")
    })
    app.post('/edit_user',(req,res) =>{
        let id = req.body.btn_edit
        
        conection.query(`SELECT Nombre,Entrada,Salida,image1,image2 FROM wide WHERE id='${id}'`,function(error,result){
            if(error){
                throw error
            }else{
                res.render("edit_user",{
                    user:result
                })
            }
        })
        
    })

    app.get('/admin',(req,res) =>{
        
        conection.query(`SELECT id,Nombre,Entrada,Salida,image1,image2 from wide`,function(error,result){
            if(error){
                throw error
            }else{
                res.render("crud",{
                    users:result,
                    msgbad:false
                })
            }
        })
       
       
    })

  
    app.post('/admin',(req,res) =>{    
        conection.query(`SELECT id,Nombre,Entrada,Salida,image1,image2 from wide`,function(error,result){
            if(error){
                throw error
            }else{
                res.render("crud",{
                    users:result,
                    msgbad:false
                })
            }
        })
    })

    app.post('/panel-control',(req,res) =>{
        
        conection.query(`SELECT id,Nombre,Entrada,Salida,image1,image2 from wide`,function(error,result){
            if(error){
                throw error
            }else{
                res.render("control",{
                    users:result
                })
            }
        })
       
       
    })


    app.post('/add',(req,res) =>{
        let username = req.body.username
        let image1 = req.files.image1[0]
        let image2 = req.files.image2[0]
        let ruta1 = path.join(__dirname,`../upload/${image1["originalname"]}`)
        let ruta2 = path.join(__dirname,`../upload/${image2["originalname"]}`)
        let image1UP = fs.readFileSync(ruta1)
        let image2UP = fs.readFileSync(ruta2)

        conection.query("INSERT INTO wide SET ?",{Nombre:username,Entrada:"",Salida:"",image1:image1UP,image2:image2UP},(err,result)=>{
            if(err){
                throw err
            }else{}
        })
        res.redirect("/admin")
    })

    app.post('/delete',(req,res) =>{
        let id = req.body.btn_delete
        
        conection.query(`DELETE FROM wide WHERE id='${id}'`,function(error,result){
            if(error){
                throw error
            }else{
               
            }
        })
        res.redirect("/admin")
    })
    
    app.post('/edit',(req,res) =>{
        
        let username = req.body.username
        let image1 = req.files.image1
        let image2 = req.files.image2
        

        let entrada = req.body.entrada
        let salida  = req.body.salida
        
        if(image1 == undefined && image2 == undefined){
           
            conection.query(`UPDATE wide SET Nombre='${username}',Entrada='${entrada}',Salida='${salida}' WHERE Nombre='${username}'`,function(error,result){
                if(error){
                    throw error
                }else{
                   
                }
            })
        }
        else if(image1 == undefined){

            let ruta2 = path.join(__dirname,`../upload/${image2[0]["originalname"]}`)
            let image2UP = fs.readFileSync(ruta2)
            conection.query(`UPDATE wide SET ? WHERE Nombre='${username}'`,{Nombre:username,Entrada:entrada,Salida:salida,image2:image2UP},(err,result)=>{
                if(err){
                    throw err
                }else{}
            })
           
        }
        else if(image2 == undefined){
            let ruta1 = path.join(__dirname,`../upload/${image1[0]["originalname"]}`)
            let image1UP = fs.readFileSync(ruta1)
            conection.query(`UPDATE wide SET ? WHERE Nombre='${username}'`,{Nombre:username,Entrada:entrada,Salida:salida,image1:image1UP},(err,result)=>{
                if(err){
                    throw err
                }else{}
            })
            
        }
        else{
            let ruta1 = path.join(__dirname,`../upload/${image1[0]["originalname"]}`)
            let ruta2 = path.join(__dirname,`../upload/${image2[0]["originalname"]}`)
            let image1UP = fs.readFileSync(ruta1)
            let image2UP = fs.readFileSync(ruta2) 
            conection.query(`UPDATE wide SET ? WHERE Nombre='${username}'`,{Nombre:username,Entrada:entrada,Salida:salida,image1:image1UP,image2:image2UP},(err,result)=>{
                if(err){
                    throw err
                }else{}
            })
        }
        res.redirect("/")
       
        
    })
    //Ruta para actualizar los datos del usuario detectado
    app.post('/register',(req,res) =>{
        option_ = req.body.option
        user = req.body.name
        name_user = user
        //Si los datos devueltos son null no actualiza
        if(name_user == null || name_user == "unknown") console.log("no existe nombre")
        else{
            
            optionDB = option_
        
            var date = new Date()
            
            conection.query(`UPDATE wide SET ${option_}='${date.toLocaleString()}' WHERE Nombre='${name_user}' `,function(error,result){
                if(error){
                    throw error
                }else{
                   
                }
            })
        }
    //------------------------CRUD----------------------------//
    

    });
    
}