#!/usr/bin/env python

import sys
import json
from decimal import Decimal

JSON_YEAR = '1997'

def process_args(c):
    if len(sys.argv) > c+1 and "/" in sys.argv[c+1]:

        op = sys.argv[c+1].split("/")

        return ( float(sys.argv[c]) + float(op[0]) / float(op[1]), c+2 )
    elif "$" == sys.argv[c]:
        return process_args(c+1)
    else:
        return (float(sys.argv[c].replace('$','')), c+1)

symbol = sys.argv[1]

if symbol.replace('.','').isalpha() and len(sys.argv) > 5:

    # arg cursor
    c = 2

    result = process_args(c)

    low_1997 = result[0]
    c = result[1]

    result = process_args(c)

    high_1997 = result[0]
    c = result[1]

    result = process_args(c)

    low_1996 = result[0]
    c = result[1]

    result = process_args(c)

    high_1996 = result[0]
    c = result[1]

    div_arg_cnt = len(sys.argv) - c

    dividend = -99999999

    if div_arg_cnt == 0:
        dividend = 0
    elif div_arg_cnt == 1:
        dividend = float(sys.argv[c])
    elif div_arg_cnt == 2:
        dividend = float(sys.argv[c]) * 2 + float(sys.argv[c+1]) * 2
    elif div_arg_cnt == 3:
        dividend = float(sys.argv[c]) * 2 + float(sys.argv[c+1]) + float(sys.argv[c+2])
    elif div_arg_cnt == 4:
        dividend = float(sys.argv[c]) + float(sys.argv[c+1]) + float(sys.argv[c+2]) + float(sys.argv[c+3])
    else:
        print("unknown arg cnt error")

    ratio = ((low_1997 + high_1997) / 2 + dividend) / ((low_1996 + high_1996) / 2)

    print( "(("+str(low_1997)+" + "+str(high_1997)+") / 2 + "+str(dividend)+") / (("+str(low_1996)+" + "+str(high_1996)+") / 2): " + str(ratio) )

    f = open('ratio-data.json', 'r')

    ratios = json.load(f)
    f.close()

    ratios[symbol] = {JSON_YEAR: ratio}

    f = open('ratio-data.json', 'w')

    json.dump(ratios, f)

    f.close()

    print {symbol: ratios[symbol]}

else:
    print("COMMAND SYNTAX:")
    print("compute_ratio [symbol] [year2_high] [year2_low] [year1_high] [year1_low] [0-4 dividend args ...]")
