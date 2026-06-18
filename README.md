# COMPLETE UPLOAD FLOW

# Multer is Express middleware that handles file uploads coming from the frontend.

# RabbitMQ is a message queue. It lets your API delegate long-running work to background workers.

# MinIO is object storage. Think of it as your own version of Amazon S3.

User Selects Image
↓
React Dropzone
↓
Axios Upload
↓
Node API
↓
Multer
↓
Save Asset Record
↓
RabbitMQ Job
↓
Return 201 Created
↓
Worker Picks Job
↓
Sharp Thumbnail
↓
Metadata Extraction
↓
Upload Original to MinIO
↓
Upload Thumbnail to MinIO
↓
Update Asset Status
↓
Gallery Displays Asset
