#!/usr/bin/python
import numpy as np
import os
from scipy.io.netcdf import netcdf_file
import argparse

abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

parser = argparse.ArgumentParser(description='ShowClim image generator')
parser.add_argument('--time',
                    action="store",
                    dest="time",
                    default="Jan",
                    help='Month (Jan-Dec), or year for movie')
parser.add_argument('--press',
                    action="store",
                    dest="press",
                    default="1000",
                    help='Pressure (e.g. 1000)')
parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="pottmp",
                    help='pottmp, hgt, uwnd, vwnd, omega')
parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")
args = parser.parse_args()
execfile("map.py")

nc0=netcdf_file('ESRL-'+args.field+'.mon.1981-2010.ltm.nc','r')
nc=nc0.variables
lat=nc['lat'][:];
lon=nc['lon'][:];
# roll and duplicate
ind=(lon>=180)
lon1=np.roll(lon-360*ind,72)
lon=np.append(lon1,180)
level=nc['level'][:];
yrday=nc['time'][:];
theta=nc[args.field][:,:,:,:];


fn='./output/'+args.fn
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
t0=months[args.time]
if t0<0:
  t0=0
  t1=11
else:
  t1=t0

if args.press=="vertical movie":
  lev0=0
  lev1=len(level)
else:
  press=int(args.press)
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
