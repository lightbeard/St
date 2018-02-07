#!/usr/bin/env python

import sys
import json
from decimal import Decimal

MIN_DATA_SET = 5

def fortune_500_list(year):
    result = [None for x in range(1000)]
    for i in range(1, 26):
        with open(str(year) + '/' + str(i) + '.json') as json_data:
            stocks = json.load(json_data)['articles']
            for stock in stocks:
                result[int(stock['rank'])] = stock['ticker_text']
                
    return result

csv = ''

years = {}

for year in range(1996, 2017):
    years[str(year)] = fortune_500_list(year)

for rank in range(1, 501):
    csv = csv + str(rank) 
    if rank < 500:
        csv = csv + ','
    else:
        csv = csv + '\n'

ratio_data = None
with open("ratio-data.json") as json_data:
    ratio_data = json.load(json_data)

for rank in range(1, 501):
    cnt = 0
    best1 = 0
    best2 = 0
    worst1 = 99.0
    worst2 = 99.0
    ROI = 1.0
    for year in range(1996, 2017):
        if years[str(year)][rank] is not None:
            symbol = years[str(year)][rank]
            if symbol in ratio_data:
                if str(year) in ratio_data[symbol]:
                    ratio = ratio_data[symbol][str(year)]
                    if ratio > 0:
                        #print('symbol:'+symbol+' ratio:'+str(ratio))
                        cnt = cnt + 1
                        ROI = ROI * ratio
                        if ratio > best1:
                            best2 = best1
                            best1 = ratio
                        elif ratio > best2:
                            best2 = ratio
                            
                        if ratio < worst1:
                            worst2 = worst1
                            worst1 = ratio
                        elif ratio < worst2:
                            worst2 = ratio
    if cnt >= MIN_DATA_SET:
        ROI = ROI / best1 / best2 / worst1 / worst2
        csv = csv + str(ROI) + ','
    else:
        csv = csv + ','

print(csv)

