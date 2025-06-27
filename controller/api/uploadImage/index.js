const router = require('express').Router();
const jwt = require('jsonwebtoken');
const FormData = require('form-data');
const { default: axios } = require('axios');

router.post('/', async (req, res) => {
    const token = req.headers.authorization;
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded || decoded.userType !== 'ADMIN') {
            return res.json({ status: 'fail', message: 'Unauthorized' });
        }

        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, info) {
            const cloudflareFormData = new FormData();
            cloudflareFormData.append('file', file);
        
            axios.post(process.env.CLOUDFLARE_UPLOAD_URL, cloudflareFormData, {
                headers: {
                    ...cloudflareFormData.getHeaders(),
                    'AUTHORIZATION': 'Bearer ' + process.env.CLOUDFLARE_BEARER_TOKEN
                }
            })
            .then(({ data }) => {
                console.log(data);
                if (data.success) {
                    res.json({ status: 'success', data });
                } else {
                    res.json({ status: 'fail', message: 'Cloudflare upload failed', data });
                }
            })
            .catch(err => {
                console.log(err);
                res.json({ status: 'fail', message: 'Upload error', error: err.message });
            });
        });

        req.busboy.on('error', function(err) {
            console.log(err);
            res.json({ status: 'fail', message: 'File processing error', error: err.message });
        });
    });
});

module.exports = router;