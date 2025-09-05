const inquirer = require('inquirer')
const fs = require('fs')
const path = require('path')
const QRCode = require('qrcode');
const Jimp = require('jimp')
const QrCodeReader = require('qrcode-reader')
const { up } = require('inquirer/lib/utils/readline');

const uploadDir = path.join(__dirname, "uploads");
if(!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

async function generateQRCode(text){
    const fileName= `qrcode_${Date.now()}.png`;
    const filePath = path.join(uploadDir, fileName);
    await QRCode.toFile(filePath, text);
    return filePath;
}

async function scanQRCode(filePath){
    const image = await Jimp.read(filePath);
    const qr = new QrCodeReader();
    return new Promise((resolve, reject) =>{
        qr.callback = (err, value) =>{
            if(err) return reject(err);
            resolve(value ? value.result : null);
        };

        qr.decode(image.bitmap);
    });
}

async function main(){
    const { text } = await inquirer.prompt([
        { type:"input", name:"text", message:"Enter a string/URL to generate a QR code:"}
    ]);

    if(!text.trim()){
        console.log("No text provided, Exiting")
        return;
    }

    const filePath = await generateQRCode(text.trim());
    console.log("QR code saved at:", filePath)

    const { scanNow } = await inquirer.prompt([
        { type:"confirm", name:"scanNow", message:"Scan the generated Qr now ?", default: true}
    ]);

    if (!scanNow) {
        console.log("Done. You can scan later.");
        return;
    }

    try{
        const decode = await scanQRCode(filePath);
        console.log("Decoded text", decode);
    } catch (e) {
        console.log("fail to scan:", e.message || e);
    }
    

}

main();