const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');

// AWS SDK configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: 'us-east-1' // Change this to your actual AWS region if different
});

console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY);
console.log('AWS_SECRET_KEY:', process.env.AWS_SECRET_KEY);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);

const s3 = new AWS.S3();
const router = express.Router();

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// File Upload to S3
router.post('/', upload.single('image'), (req, res) => {
  console.log('Received upload request');
  if (!req.file) {
    console.error('No file received');
    return res.status(400).json({ error: 'No file received' });
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${Date.now()}-${path.basename(req.file.originalname)}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('S3 upload error:', err);
      return res.status(500).json({ error: 'S3 upload failed', details: err.message });
    }
    console.log('File uploaded successfully:', data.Location);
    res.status(200).json({ message: 'File uploaded successfully', url: data.Location });
  });
});

// List all files in the S3 bucket
router.get('/', async (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: 'uploads/'
  };
  try {
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map(obj => ({
      key: obj.Key,
      lastModified: obj.LastModified,
      size: obj.Size,
      url: `https://${params.Bucket}.s3.amazonaws.com/${obj.Key}`
    }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list files', details: err.message });
  }
});

// Download a file by key
router.get('/:key', async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };
  try {
    const data = await s3.getObject(params).promise();
    res.set('Content-Type', data.ContentType);
    res.send(data.Body);
  } catch (err) {
    res.status(404).json({ error: 'File not found', details: err.message });
  }
});

// Update/replace a file by key
router.put('/:key', upload.single('image'), async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' });
  }
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };
  try {
    await s3.putObject(params).promise();
    res.status(200).json({ message: 'File updated successfully', key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update file', details: err.message });
  }
});

// Delete a file by key
router.delete('/:key', async (req, res) => {
  const key = decodeURIComponent(req.params.key);
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  };
  try {
    await s3.deleteObject(params).promise();
    res.status(200).json({ message: 'File deleted successfully', key });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file', details: err.message });
  }
});

module.exports = router;
