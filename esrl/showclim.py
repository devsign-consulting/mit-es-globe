import numpy as np
from scipy.io.netcdf import netcdf_file
import dap.client
import sys
import subprocess

execfile("map.py")

nc0=netcdf_file('ESRL-'+field+'.mon.1981-2010.ltm.nc','r')
nc=nc0.variables
lat=nc['lat'][:];
lon=nc['lon'][:];
# roll and duplicate
ind=(lon>=180)
lon1=np.roll(lon-360*ind,72)
lon=np.append(lon1,180)
level=nc['level'][:];
yrday=nc['time'][:];
theta=nc[field][:,:,:,:];
#nc0.close()

fn='/tmp/'+fn

os.environ[ 'MPLCONFIGDIR' ] = '/tmp/'
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


def splotit(theta,n,lev):
  th1=np.roll(theta[n,lev,:,:],72,axis=1)
  th=np.hstack((th1,th1[:,0:1]))
  #  plt.figure(1,figsize=[8.125*3.253/2,6.125*3.253/2])
  fig=plt.figure(figsize=(20.48,10.24))
  ax=fig.add_axes((0,0,1,1))
  ax.set_axis_off()
  ax.pcolormesh(lon,lat,th)
  lonx=[]
  latx=[]
  for i in range(0,len(lonm)):
    if lonm[i]<-180:
      ax.plot(lonx,latx,"#777777")
      lonx=[];
      latx=[];
    else:
      lonx.append(lonm[i])
      latx.append(latm[i])

  ax.plot(lonx,latx,"#777777")
  ax.axis('tight')
  #  plt.axis('off')
  #  plt.axis('equal')
  #plt.show(block=False)
  plt.savefig(fn+'-'+str(n)+'.png')
  #  img=subprocess.check_output(["../pngmunge"])
#  sys.stdout.write(img)
#  sys.stdout.flush()

months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11,"year":-1}
t0=months[time]
if t0<0:
  t0=0
  t1=11
else:
  t1=t0
if press=="vertical movie":
  lev0=0
  lev1=len(level)
else:
  press=int(press)
  lev0=np.argmin(np.abs(level-press))
  lev1=-1
if lev1<0:
  nr=range(t0,t1+1)
  for n in nr:
    splotit(theta,n,lev0)
else:
  nr=range(lev0,lev1)
  for lev in nr:
    splotit(theta,t0,lev)
