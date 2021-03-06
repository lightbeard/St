const fs = require("fs");
const opn = require('opn');

const sleep = require('system-sleep');

const request = require('request');

const yahooFinance = require('yahoo-finance');
const assert = require('assert');

const START_AT = 0;
const year = 2011;

const PRIVATE = '_PRIVATE';

var rdata = JSON.parse(fs.readFileSync('ratio-data.json'));
var OFF = false;

var smap = {
  'Allegiance Corporation':PRIVATE,
  'Tele-Communications, Inc.':PRIVATE,
  'Nebco Evans Holding Company':PRIVATE,
  'Principal Financial Group':'PFG',
  'GenAmerica Corporation':PRIVATE,
  'Rykoff-Sexton, Inc.':'RYK',
  'TruServ Corporation':PRIVATE,
  'Borden, Inc. and Affiliates':'brd?',
  'American Family Mutual Insurance Company':PRIVATE,
  'Premcor':'PCO',
  'Pacific Life Insurance Company':PRIVATE,
  'Barnett Banks, Inc.':PRIVATE,
  'Teachers Insurance and Annuity Association College Retiremen':PRIVATE,
  'The BFGoodrich Company':PRIVATE,
  'Pacific Enterprises':PRIVATE,
  'El Paso Natural Gas Company':PRIVATE,
  'State Farm Group':PRIVATE,
  'Metropolitan Life Insurance Co.':'MET',
  'United Parcel Service of America, Inc.':'UPS',
  'USX Corporation':'X',
  'New York Life Insurance Company':PRIVATE,
  'Nationwide Insurance Enterprise': PRIVATE,
  'Teachers Insurance & Annuity Association of America': PRIVATE,
  'Northwestern Mutual Life Insurance Company':PRIVATE,
  'The Principal Mutual Life Insurance Company':PRIVATE,
  'Publix Super Markets, Inc.':PRIVATE,
  'Liberty Mutual Insurance Group':PRIVATE,
  'College Retirement Equities Fund':PRIVATE,
  'Farmland Industries, Inc.':PRIVATE,
  'Massachusetts Mutual Life Insurance':PRIVATE,
  'Levi Strauss Associates':PRIVATE,
  'United Services Automobile Association':PRIVATE,
  'ITT Corporation':'ITT',
  'Guardian Life Insurance Co. of America':PRIVATE,
  'Associated Insurance Companies,Inc.':'ANTM',
  'Anthem Insurance Companies,Inc.':'ANTM',
  'John Hancock Mutual Life Insurance Company':PRIVATE,
  'ARAMARK Corporation':'ARMK',
  'Thrifty Payless Holdings, Inc.':PRIVATE,
  'Supermarkets General Holdings Corporation':PRIVATE,
  'Mutual of Omaha Insurance Companies':PRIVATE,
  'Food 4 Less Holdings, Inc.':PRIVATE,
  'Pacific Mutual Life Insurance':PRIVATE,
  'The Pittston Company':'BCO',
  'Aid Association for Lutherans':PRIVATE,
  'Graybar Electric Company, Inc.':PRIVATE,
  'Spartan Stores, Inc.':'SPTN',
  'Cotter & Co.':PRIVATE,
  'Ace Hardware Corporation':PRIVATE,
  'Phoenix Home Life Mutual Insurance':PRIVATE,
  'The Grand Union Company':PRIVATE,
  'Ohio Edison Company':PRIVATE,
  'AST Research, Inc.':PRIVATE,
  'General Instrument Corporation':PRIVATE,
  'The New York Times Company':'NYT',
  'Varity Corporation':PRIVATE,
  'Prudential Insurance Company of America':PRIVATE,
  'Federal National Mortgage Association':PRIVATE,
  'Federal Home Loan Mortgage Corporation':PRIVATE,
  'Metropolitan Life Insurance Co.':PRIVATE,
  'The Stop & Shop Companies, Inc.':PRIVATE,
  'State Farm Insurance Companies':PRIVATE,
  'The Principal Financial Group':'PFG',
  'Borden, Inc.':PRIVATE,
  'Food 4 Less Holdings':PRIVATE,
  'American Family Insurance Group':PRIVATE,
  'General American Life Insurance':PRIVATE,
  'Lutheran Brotherhood':PRIVATE,
  'Fannie Mae':PRIVATE,
  'NYNEX Corporation':PRIVATE,
  'Federal Home Loan Mortgage Corp.':PRIVATE,
  'FHP International Corporation':PRIVATE,
  'SAFECO Corporation':PRIVATE,
  'LG&E Energy Corporation': PRIVATE,
  'Great Western Financial Corporation': PRIVATE,
  'Foundation Health Corporation': PRIVATE,
  'Jefferson Smurfit Corporation': PRIVATE,
  'Long Island Lighting Company' : PRIVATE
};

function intrinio(symbol, year, title, i, callback) {

  var url = "https://api.intrinio.com/historical_data?identifier=" + symbol.toUpperCase() + "&amp;item=adj_close_price&start_date=" + year + "-06-01&amp;end_date=" + (year + 1) + "-07-01&amp;frequency=quarterly";

  console.log('intinio api:', url);

  request({
    'url':url,
    'auth':{
      'user':'609049632e3b5c37054c4e2639fd9bc3',
      'pass':'23b52233a64c03cb646ed1c8151a411f'
    }
  }, function (error, response, body) {

    if(error) {
      console.log("******** don't forget to use mtech network *********");
      throw new Error(error);
    }

    const payload = JSON.parse(body);

    console.log(payload, title);

    if(payload && payload.data && payload.data.length > 0) {

      const re1 = new RegExp( year + '-05|' + year + '-06|' + year + '-07' );
      const re2 = new RegExp( (year+1) + '-05|' + (year+1) + '-06|' + (year+1) + '-07' );

      var y1price, y2price;

      for(var qindex=0; qindex<payload.data.length; qindex++) {
        var item = payload.data[qindex];
        if(re1.test(item.date)) y1price = item.value;
        if(re2.test(item.date)) y2price = item.value;
      }

      if(y1price && y2price) {
          const ratio = Number(y2price) / Number(y1price);
          if(!rdata[symbol]) rdata[symbol] = {};
          rdata[symbol][year] = ratio;
          fs.writeFileSync('ratio-data.json', JSON.stringify(rdata));
          console.log('intrinio added to local cache:', symbol, year, ratio);
          callback(ratio);
      } else {
        callback(-1);
      }

    } else {
        console.log('%%%%%%%%%%%% Intrinio Missing: '+symbol+", "+title+", "+year+", "+i);
        if(payload.errors && payload.errors[0] && payload.errors[0].message.indexOf("max API calls per day") >= 0) {
          throw new Error(payload.errors[0].human)
        }
        callback(-1);
        return;
        /* old */
        var familiar = false;
        var words = title.split(" ");
        if(words.length > 1) words[words.length-2] = words[words.length-2].replace(",","");
        var last = words[words.length-1];
        if(last.indexOf("Company") >= 0) {
          familiar = true;
          words[words.length-1] = "Co";
        } else if(last.indexOf("Corporation") >= 0) {
          familiar = true;
          words[words.length-1] = "Corp";
        } else if(last.indexOf("Inc") >= 0) {
          familiar = true;
          words[words.length-1] = "Inc";
        }

        if(familiar) {
          var tstr = "";
          for(var j=0; j<words.length-1; j++) {
            var w = words[j].replace("-","+").replace(".","");
            if(!(j==0 && w == "The")) tstr += w + "+";
          }
          tstr += words[words.length-1];

          opn("https://www.sec.gov/cgi-bin/browse-edgar?company=" + tstr + "&owner=exclude&action=getcompany&type=10-k");
        }

        OFF=true;
      }

  });



}

// determine earnings ratio for stock in given year, e.g. 10% return is 1.1
function earningFactor(symbol, year, title, i, callback) {

  if(OFF) return;

  console.log('earningFactor()', symbol, year);
  assert(typeof year === 'number' && typeof symbol === 'string' && symbol != 'DEFUNCT' && symbol.length != 0);

  if(rdata[symbol] && typeof rdata[symbol][year] === 'number') {
    // local fs hit
    callback(rdata[symbol][year]);
    return;
  }

  // try yahoo first
  console.log('yahoo-api:', symbol, title, year);
  yahooFinance.historical({
      symbol: symbol,
      from: year + '-06-01',
      to: (year+1) + '-06-01',
      period: 'm',
    }, function (err, quotes) {
      if(err) console.log(symbol, year, err);
      else if(OFF) return;
      else {
        if(quotes.length === 0) {
//console.log('%%%%%%%%%%%% Yahoo Missing: '+symbol+", "+title+", "+year+", "+i);
          // use intrinio as fallback
          intrinio(symbol, year, title, i, callback);
          return;
        }
        //assert(quotes.length > 0, '##### Yahoo Missing: '+symbol+", "+title+", "+year);
        var ratio = quotes[quotes.length - 1].open / quotes[0].open;
        if(!rdata[symbol]) rdata[symbol] = {};
        rdata[symbol][year] = ratio;
        fs.writeFileSync('ratio-data.json', JSON.stringify(rdata));
        console.log('yahoo added to local cache:', symbol, year, ratio);
        callback(ratio);
      }
    });
}

var portfolio = [];
var salary = 60000;

var tmp = [];
var complete = 0;

// extract stock symbols into tmp[]
for(var i=1; i<=25; i++) {
  var stocks = JSON.parse(fs.readFileSync(year+'/'+i+'.json')).articles;

  for(var j=0; j<stocks.length; j++) {
    var rank = Number(stocks[j].rank);
    var sym = smap[stocks[j].title] ? smap[stocks[j].title] : stocks[j].ticker_text;
    if(sym) {
      tmp.push({s:sym, r:rank, t:stocks[j].title});
      complete += Number(rank);
    }
  }
}

console.log('########## complete:', complete);

var total = 0;
var symbols = [];

// create result set in symbols[]
for(var i=START_AT; i<tmp.length; i++) {

    (function() {
      // closure is used here so stock var isn't overwritten by loop
      var stock = tmp[i];      var index = i;
      if(stock.s == PRIVATE) {
        // skip
        total += Number(stock.r);
      } else {
        // stagger requests
        setTimeout(function() {
          earningFactor(stock.s, year, stock.t, index, function(factor) {
              symbols[Number(stock.r)-1] = {symbol:stock.s, factor:factor};
              //else symbols[Number(stock.r)-1] = {symbol:'DEFUNCT', factor:1.0}; // old?
              total += Number(stock.r);
  //console.log(symbols.length);
  console.log('########## INDEX:', index);
            });
        }, (i - START_AT) * 200);
      }
    })();

}

delete tmp;

while(total < 9995873899) require('deasync').runLoopOnce();
