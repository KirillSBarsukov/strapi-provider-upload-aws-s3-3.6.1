'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
           const path = file.path ? `${file.path}/` : '';
          // const path = customParams.user.vendorId + "/";
          // console.log("PATH", path);
          S3.upload(
            {
              Key: `${path}${file.hash}${file.ext}`,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: 'public-read',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              file.url = data.Location;

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        console.log("DELETE file", file)
        console.log("DELETE customParams", customParams)

        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const url = new URL(file.url)
          const patModified = url.pathname.slice(1)
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            {
              // Key: `${path}${file.hash}${file.ext}`,
              Key: patModified,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
