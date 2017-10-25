#!/usr/bin/python
import numpy as np
import logging, sys
import os, argparse

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
from scipy.io.netcdf import netcdf_file


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

parser = argparse.ArgumentParser(description='ShowClim image generator')
parser.add_argument('--minpress',
                    action="store",
                    dest="minpress",
                    type=int,
                    default=200)
parser.add_argument('--lon',
                    action="store",
                    dest="lon",
                    type=int,
                    default=0)
parser.add_argument('--month',
                    action="store",
                    dest="month_str",
                    default="Jan",
                    help='Month')
parser.add_argument('--field',
                    action="store",
                    dest="field",
                    default="pottmp",
                    help='pottmp, hgt, uwnd, vwnd, omega')
parser.add_argument('--field2',
                    action="store",
                    dest="field2",
                    default="none",
                    help='pottmp, hgt, uwnd, vwnd, omega')
parser.add_argument('--contour',
                    action="store",
                    dest="contour",
                    default=5,
                    type=int,
                    help='Contour density')
parser.add_argument('--contour2',
                    action="store",
                    dest="contour2",
                    default=5,
                    type=int,
                    help='Contour density')
parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")
args = parser.parse_args()
# typ1="uwnd"; % second set

fn='./output/' + args.fn

months={"Jan":0,"Feb":1,"Mar":2,"Apr":3,"May":4,"Jun":5,"Jul":6,"Aug":7,"Sep":8,"Oct":9,"Nov":10,"Dec":11,"year":-1}
mon=months[args.month_str]

titles = { "pottmp": "Potential Temperature (K)", "omega": "Omega", "hgt":"Geopotential Height", "uwnd":"UWND", "vwnd":"VWND" }
fieldTitle = titles[args.field]

if args.field2 != 'none':
    field2Title = titles[args.field2]

def read_nc(type):
    nc0=netcdf_file('ESRL-'+type+'.mon.1981-2010.ltm.nc','r')
    nc=nc0.variables
    lat=nc['lat'][:]
    lon=nc['lon'][:]
    level=nc['level'][:]
    yrday=nc['time'][:]
    theta=nc[type][:,:,:,:]

    #for dimobj in nc0.dimensions.values():
    #    print (dimobj)

    nc0.close()
    return [lat, lon, level, theta]

[lat1, lon1, level1, theta] = read_nc(args.field)
if args.field2 != 'none':
    [lat2, lon2, level2, theta2] = read_nc(args.field2)

logging.debug("======= level1 =========")
#print (level1)

latr=[-90,90]
lat1 = np.asarray(lat1)
latind = np.where((lat1 <= latr[1]) & (lat1 >= latr[0]))
lon0 = args.lon+360*(args.lon<0)

lon2 = abs(lon1-lon0)
lv = min(lon2)
lonind = lon2.tolist().index(lv)

level1 = np.asarray(level1)
vind = np.where(level1 >= args.minpress)

# the expression below only works if the 2nd and 3rd argument have the same dimensions
# However, the 2nd argument is an array of indicies for the pressure, and the 3rd argument is an array of
# indices for latitude, so I don't know what to do here to make this work.
th=np.squeeze(theta[mon,vind,:,lonind])

if args.field2 != 'none':
    th2=np.squeeze(theta2[mon,vind,:,lonind])

lev = level1[vind]

import matplotlib
matplotlib.use('Agg')
from matplotlib import cm
import matplotlib.pyplot as plt

plt.figure()
CS = plt.contour(lat1[latind], lev, th, np.arange(0,800,args.contour))

if args.field2 != 'none':
    CS2 = plt.contour(lat2[latind], lev, th2, np.arange(0,800, args.contour2),cmap=cm.gray)
    plt.clabel(CS2, CS2.levels, inline=True, fmt="%0.0f", fontsize=10)

plt.gca().invert_yaxis()
plt.clabel(CS, CS.levels, inline=True, fmt="%0.0f", fontsize=10)

if args.field2 != 'none':
    plt.title(fieldTitle + ' and ' + field2Title +' at lon ' + str(args.lon))
else:
    plt.title(fieldTitle + ' at lon ' + str(args.lon))

plt.savefig(fn)
