#!/bin/bash
mkdir $1
cd $1
for i in $(seq 1 25)
do
    $(wget -O $i.json http://fortune.com/data/franchise-list/1666518/$i/)
    sleep 1
done
