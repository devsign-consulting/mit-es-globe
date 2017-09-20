#!/usr/bin/python
import os
# os.chdir("/d3/glenn/public_html/esglobe/esrl")
os.chdir("/var/www/subdomains/mit-es-globe/esrl")
time="${time}"
press="${press}"
field="${field}"
clat=${lat}
clon=${lon}
field2="${field2}"
flatr=[${flatr}]
flon="${flon}"
fpress=[${fpress}]
fcontour=${fcontour}
fn="${fn}"
execfile("showclim.py")
