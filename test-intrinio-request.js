
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const request = require('request');

request({
  'url':'https://api.intrinio.com/historical_data?identifier=XRX&amp;item=adj_close_price&start_date=1997-06-01&amp;end_date=1998-07-01&amp;frequency=quarterly',
  /*'headers': {
    'Authorization': 'Basic NjA5MDQ5NjMyZTNiNWMzNzA1NGM0ZTI2MzlmZDliYzM6MjNiNTIyMzNhNjRjMDNjYjY0NmVkMWM4MTUxYTQxMWY='
  }*/
  'auth':{
    'user':'609049632e3b5c37054c4e2639fd9bc3',
    'pass':'23b52233a64c03cb646ed1c8151a411f'
  }
},
  function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  }
);

//.auth('609049632e3b5c37054c4e2639fd9bc3','23b52233a64c03cb646ed1c8151a411f', true);
