const fs = require('fs');
const FormData = require('form-data');
const { default: axios } = require('axios');

function uploadCloudFlare(filePath) {

    const cloudflareFormData = new FormData();

    const file = fs.createReadStream(filePath);
            
    cloudflareFormData.append('file', file);
    

    return new Promise((resolve, reject) => {
        axios.post(process.env.CLOUDFLARE_UPLOAD_URL, cloudflareFormData, {
            headers: {
                ...cloudflareFormData.getHeaders(),
                'AUTHORIZATION' : 'Bearer ' + process.env.CLOUDFLARE_BEARER_TOKEN
            }
        })
        .then(({data}) => {
            console.log(data);
            resolve(data);
        })
        .catch(err => {
            console.log(err);
        })
    })
}

module.exports = uploadCloudFlare;