import os
# os.chdir("/d3/glenn/public_html/esglobe/esrl")
os.chdir("/var/www/subdomains/mit-es-globe/esrl")
time="year"
press="1000"
field="pottmp"
clat=30
clon=0
field2="none"
flatr=[0,90]
flon="zonal av"
fpress=[1000,200]
fcontour=5
fn="/tmp/es-1328.png"
execfile("showclim.py")
