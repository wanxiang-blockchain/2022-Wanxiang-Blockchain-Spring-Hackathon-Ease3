import { PublishMessage } from "../support/publishMessage";
import { JSONStringifyExt } from "../support/utils";
import { ParachainConstants } from "../constants";

const http = require('http');

function requestWithTimeout(options, timeout, callback) {
  var timeoutEventId,
    req = http.request(options, function (res) {

      res.on('end', function () {
        clearTimeout(timeoutEventId);
        //console.log('response end...');
      });

      res.on('close', function () {
        clearTimeout(timeoutEventId);
        //console.log('response close...');
      });

      res.on('abort', function () {
        //console.log('abort...');
      });

      callback(res);
    });

  req.on('timeout', function (e) {
    if (req.res) {
      req.res('abort');
    }
    req.abort();
  });


  timeoutEventId = setTimeout(function () {
    req.emit('timeout', { message: 'have been timeout...' });
  }, timeout);

  return req;
}

export async function publish(obj: PublishMessage): Promise<void> {
  obj.chain = ParachainConstants.CHAIN_NAME;
  const data = JSONStringifyExt(obj);
  // logger.debug(`publish: ${data}`);
  logger.info(`publish: ${obj.key}`);
  const options = {
    hostname: ParachainConstants.DATA_SERIVE_HOST_NAME,
    port: ParachainConstants.DATA_SERIVE_HOST_PORT,
    path: ParachainConstants.DATA_SERIVE_ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  return new Promise((resolve, reject) => {
    const req = requestWithTimeout(options, 5000, res => {
      // logger.debug(`statusCode: ${res.statusCode}`);
      res.on('data', d => {
        // logger.info(d);
        resolve(d);
      });
      // res.on('end', function () {
      //   // logger.info('end');
      //   resolve();
      // });
      // res.on('close', function () {
      //   // logger.info('close');
      //   resolve();
      // });
      // res.on('abort', function () {
      //   // logger.info('abort');
      //   resolve();
      // });
    });
    req.on('error', error => {
      // logger.info('error'); 
      logger.error(error);
      reject(error);
    });
    req.on('timeout', function (e) {
      logger.error('timeout');
      reject();
    });

    req.write(data);
    req.end();
  })

}



