import { isString, isError } from 'magic-types';

const log =
  startTime =>
    console.log(
      'request took',
      (new Date().getTime() - startTime) / 1000,
      'seconds'
    );

export const getPort =
  port =>
    parseInt(port, 10) === 80
      ? ''
      : `:${port}`;

export const getHost =
  ({ host, protocol, port, path = '' }) =>
    `${protocol}://${host}${getPort(port)}${path}`;

export const fetchJSON =
  ({ url, method = 'GET' }) =>
    fetch({
      url,
      method,
      json: true,
    });

export const fetch =
  ({ url, method = 'GET', json = false, timeoutMs = 3000 }) =>
    new Promise((resolve, reject) => {
      const requestStart = new Date().getTime();

      console.log('fetching', { url, method, json });

      const req = new window.XMLHttpRequest();

      req.timeout = timeoutMs;
      req.open(method, url);

      req.onload =
        () => {
          log(requestStart);

          if (req.status === 200) {
            if (!json) {
              console.log('not a json request');
              return resolve(req);
            }

            const parsed = parseJSONResult(req.response || req.responseText);
            if (isString(parsed)) {
              console.log('json returned string');
              return reject(parsed);
            }

            if (isError(parsed)) {
              console.log('json returned error');
              return reject(parsed.message);
            }
            console.log({ parsed, isError: isError(parsed) });
            console.log('json resolved');
            return resolve(parsed);
          }

          console.log('http unknown error');
          reject(req.statusText || 'Unkown Error');
        };

      req.onerror =
        () => {
          log(requestStart);
          reject('Network Error');
        };

      req.ontimeout =
        () => {
          log(requestStart);
          reject('Request timed out');
        };

      req.send();
    });

export const parseJSONResult =
  res => {
    let parsed = new Error('Response invalid');
    try {
      parsed = JSON.parse(res);
    } catch (e) {
      console.error('JSON parsing error', { e, res });
    }

    return parsed;
  };
