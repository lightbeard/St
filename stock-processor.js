var fs = require("fs");
var opn = require('opn');

var sleep = require('system-sleep');

var yahooFinance = require('yahoo-finance');
var assert = require('assert');

var rdata = JSON.parse(fs.readFileSync('ratio-data.json'));

var PRIVATE = '_PRIVATE';

var OFF = false;

var smap = {
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
  'Fannie Mae':PRIVATE
};

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
console.log('%%%%%%%%%%%% Yahoo Missing: '+symbol+", "+title+", "+year+", "+i);
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
          return;
        }
        //assert(quotes.length > 0, '##### Yahoo Missing: '+symbol+", "+title+", "+year);
        var ratio = quotes[quotes.length - 1].open / quotes[0].open;
        if(!rdata[symbol]) rdata[symbol] = {};
        rdata[symbol][year] = ratio;
        console.log('added to local cache:', symbol, year, ratio);
        callback(ratio);
      }
    });
}

var portfolio = [];
var salary = 60000;

var year = 1997;

var tmp = [];
var complete = 0;

// extract stock symbols into tmp[]
for(var i=1; i<=25; i++) {
  var stocks = JSON.parse(fs.readFileSync(year+'/'+i+'.json')).articles;

  for(var j=0; j<stocks.length; j++) {
    var rank = Number(stocks[j].rank);
    var sym = smap[stocks[j].title] ? smap[stocks[j].title] : stocks[j].ticker_text;
    if(!sym) {
      // symbol map miss
      console.log(stocks[j]);
      assert.fail(null, 'stock-symbol');
    }

    tmp.push({s:sym, r:rank, t:stocks[j].title});
    complete += Number(rank);
  }
}

console.log('########## complete:', complete);

var total = 0;
var symbols = [];

// create result set in symbols[]
for(var i=0; i<tmp.length; i++) {
  (function() {
    // closure is used here so stock var isn't overwritten by loop
    var stock = tmp[i];
    var index = i;
    if(stock.s == PRIVATE) {
      // skip
      total += Number(stock.r);
    } else {
      // stagger requests
      setTimeout(function() {
        earningFactor(stock.s, year, stock.t, index, function(factor) {
            if(factor) symbols[Number(stock.r)-1] = {symbol:stock.s, factor:factor};
            else symbols[Number(stock.r)-1] = {symbol:'DEFUNCT', factor:1.0}; // old?
            total += Number(stock.r);
//console.log(symbols.length);
console.log('########## TOTAL:', total);
          });
      }, i * 10);
    }
  })();
}

delete tmp;

while(total < 99958738) require('deasync').runLoopOnce();
