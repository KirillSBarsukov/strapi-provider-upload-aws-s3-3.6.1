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
//               ACL: 'public-read',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              const url = new URL(data.Location)
              file.url = process.env.IMAGEKIT_URL ? process.env.IMAGEKIT_URL.concat(url.pathname) : data.Location
              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        console.log("DELETE file", file)
        // url: 'https://ofb11images-clone.s3.ca-central-1.amazonaws.com/strapi_images/20180522154/chocolate_cake_19a0efcdff.jpg',

        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          let path = "";
          if(process.env.IMAGEKIT_URL){
            const url = file.url.replace(process.env.IMAGEKIT_URL, "")
            const patModified = url.slice(1)
            path = patModified;
          } else {
            const url = new URL(file.url)
            const patModified = url.pathname.slice(1)
            path = patModified;
          }
          console.log("path", path)
          S3.deleteObject(
            {
              // Key: `${path}${file.hash}${file.ext}`,
              Key: path,
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
