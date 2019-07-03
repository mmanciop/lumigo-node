const axios = require('axios');

const token = 't_a595aa58c126575c5c41';
const edgeHost = 'kzc0w7k50d.execute-api.eu-west-1.amazonaws.com';
const debug = true;

const lumigo = require('./main')({ token, edgeHost, debug });

const myHandler = async (event, context, callback) => {
  const { data } = await axios.get('https://sagi.io');
  callback(null, data);
};

exports.handler = lumigo.trace(myHandler);
