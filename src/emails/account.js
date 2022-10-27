
const sg = require('@sendgrid/mail')

 


sg.setApiKey(process.env.SENDGRID_API_KEY)


console.log(process.env.SENDGRID_API_KEY)

const sendCreationMail=(email,name)=>{
    sg.send({
        to:email,
        from:'shahilmohammed7@gmail.com',  
        subject:'This is my first creation!',
        text:`welcome ${name} to Task app`
    })
}

const sendCancelMail=(email,name)=>{
    sg.send({
        to:email,
        from:'shahilmohammed7@gmail.com',
        subject:'This is my from Shahil Task App creation!',
        text:` ${name} cancelled Task app`
    })
}


module.exports={
    sendCreationMail,
    sendCancelMail
}