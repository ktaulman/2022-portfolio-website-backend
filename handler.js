"use strict";
const nodemailer=require('nodemailer')
const {google}=require('googleapis')

module.exports.contactForm = async (event) => {
  const {name,email,message}=JSON.parse(event.body)

  
  const OAuth2 = google.auth.OAuth2
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_AUTH_URL
  )
  oauth2Client.setCredentials({
    refresh_token:process.env.GOOGLE_REFRESH_TOKEN
  })
  
  const getAccessToken=async () =>{
    try{
      const response=await oauth2Client.getAccessToken();
      return response.token;
    }
    catch(err){
      console.log(err)
    }
  }
    
    // console.log('GET ACCESS TOKEN',await getAccessToken())
  // return;
    let transporter = nodemailer.createTransport({
      service:"gmail",
      host:'mail.google.com',
      port:465,
      secure:true,
      auth:{
        type:"OAuth2",
        user:process.env.GOOGLE_USER,
        pass:process.env.GOOGLE_PASS,
        accessToken:await getAccessToken(),
        clientId:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
        refreshToken:process.env.GOOGLE_REFRESH_TOKEN
      }
    })
    let info = await transporter.sendMail({
      from: `Portfolio Website <${process.env.GOOGLE_TO}>`, 
      to: process.env.GOOGLE_TO,
      subject: "Portfolio Website", 
      text: "Hello world?",
      html:`
      <p<b>Name: ${name}</b></p>
      <p><b>Email:${email}</b></p>
      <p>${message}</p>
  `
    });
 

 
  return {
    statusCode: 200,
    headers:{
      'content-type':'application/json'
    },
    body: JSON.stringify(
      {
        message: "Message was successful"+name+email+message,
        input: info,
      },
      null,
      2
    ),
  };
};
