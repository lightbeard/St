#!/bin/bash
awk '{ sub("\r$", ""); print }' dump-fortune.sh > dump-fortune2.sh
mv dump-fortune2.sh dump-fortune.sh
chmod +x dump-fortune.sh
