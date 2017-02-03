'use strict';

module.exports = {
    json_content_type: ['application/json'],
    max_file_size: 1024 * 1024 * 100, //100M
    max_fields: 100,
    max_fields_size: 2 * 1024 * 1024, //2M,
    single_file_header: 'x-filename',
  //  file_upload_path: Beacon.RUNTIME_PATH + Beacon.sep + 'public' + Beacon.sep + 'upload',
    file_auto_remove: true,
    log_error: false,
    allow_upload_types: {
        "css": "text/css",
        "gif": "image/gif",
        "html": "text/html",
        "ico": "image/x-icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "pdf": "application/pdf",
        "png": "image/png",
        "svg": "image/svg+xml",
        "swf": "application/x-shockwave-flash",
        "tiff": "image/tiff",
        "txt": "text/plain",
        "wav": "audio/x-wav",
        "wma": "audio/x-ms-wma",
        "wmv": "video/x-ms-wmv",
        "xml": "text/xml"
    }
};