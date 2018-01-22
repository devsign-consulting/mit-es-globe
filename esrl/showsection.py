#!/usr/bin/python
import numpy as np
import logging, sys
import os, argparse

logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)
from scipy.io.netcdf import netcdf_file
import json


abspath = os.path.abspath(__file__)
dname = os.path.dirname(abspath)
os.chdir(dname)

parser = argparse.ArgumentParser(description='ShowClim image generator')
def str2bool(v):
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')

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
                    type=float,
                    help='Contour density')
parser.add_argument('--contour2',
                    action="store",
                    dest="contour2",
                    default=5,
                    type=float,
                    help='Contour density')
parser.add_argument('--filename',
                    action="store",
                    help='Output filename',
                    dest="fn")
parser.add_argument('--logscale',
                    type=str2bool, nargs='?',
                    const=True,
                    default=True,
                    help='log scale on y-axis')

parser.add_argument('--fill-contour',
                    type=str2bool, nargs='?',
                    dest="fillcontour",
                    const=True,
                    default=False,
                    help='draws a fill contour')

parser.add_argument('--zonal-average',
                    type=str2bool, nargs='?',
                    dest="zonalaverage",
                    const=True,
                    default=False,
                    help='returns the zonal average')

parser.add_argument('--min',
                    action="store",
                    dest="min",
                    help="min data range")

parser.add_argument('--max',
                    action="store",
                    dest="max",
                    help="max data range")

parser.add_argument('--min2',
                    action="store",
                    dest="min2",
                    help="min2 data range")

parser.add_argument('--max2',
                    action="store",
                    dest="max2",
                    help="max2 data range")

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


latr=[-90,90]
lat1 = np.asarray(lat1)
latind = np.where((lat1 <= latr[1]) & (lat1 >= latr[0]))
lon0 = args.lon+360*(args.lon<0)

lon2 = abs(lon1-lon0)
lv = min(lon2)
lonind = lon2.tolist().index(lv)

level1 = np.asarray(level1)

# if minpress is 1, that's the upper stratosphere
if args.minpress == 1:
    vind = np.where(level1 <= 100)
else:
    vind = np.where(level1 >= args.minpress)

# the expression below only works if the 2nd and 3rd argument have the same dimensions
# However, the 2nd argument is an array of indicies for the pressure, and the 3rd argument is an array of
# indices for latitude, so I don't know what to do here to make this work.
th=np.squeeze(theta[mon,vind,:,lonind])

#calculate the zonal average
th_zone = np.squeeze(theta[mon, vind, :, :])
th_zone = np.average(th_zone, axis=2)

if args.field2 != 'none':
    th2=np.squeeze(theta2[mon,vind,:,lonind])
    #calculate the zonal average
    th2_zone = np.squeeze(theta2[mon, vind, :, :])
    th2_zone = np.average(th2_zone, axis=2)

lev = level1[vind]

import matplotlib
import math
matplotlib.use('Agg')
from matplotlib import cm
import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter
import matplotlib.ticker as ticker
import colorMap

matplotlib.rc('xtick', labelsize=18)
matplotlib.rc('ytick', labelsize=18)

fig = plt.figure(figsize=(12, 10))
ax = fig.add_subplot(1,1,1)

# argument min/max overrides
if args.min:
    min = float(args.min)
else:
    min = math.floor(th.min())

if args.max:
    max = float(args.max)
else:
    max = math.ceil(th.max())

contour = args.contour

if args.field2 != 'none':
    # argument min/max overrides
    if args.min2:
        min2 = float(args.min2)
    else:
        min2 = math.floor(th2.min())

    if args.max2:
        max2 = float(args.max2)
    else:
        max2 = math.ceil(th2.max())
    contour2 = args.contour2

# color bar formatter
def colorbarFmt(x, pos):
    if args.field == 'omega' or args.field == 'vwnd':
        return "%.2f" % x;
    elif args.field == 'vwnd':
        return "%.1f" % x;
    else:
        return int(x)

if args.zonalaverage:
    th = th_zone
    if args.field2 == args.field:
        th2 = th2_zone

# print (max, min, contour)
if args.fillcontour:
    cm = plt.cm.jet

    cmap_center = 250
    cmap_range = 250

    if args.field == 'pottmp':
        cmap_center = 250
        cmap_range = 250

        if args.minpress == 500:
            min = 225
            max = 350
        elif args.minpress == 10:
            min = 225
            max = 1200
            cmap_center = 300
            cmap_range = 250
        elif args.minpress == 1:
            min = 225
            max = 1200
            cmap_center = 600
            cmap_range = 300
        else:
            min = 225
            max = 500
        cm = colorMap.customColorMap(cmap_center, cmap_range, min, max)

    if args.field == 'uwnd':
        min = -15
        max = 50
        cm = colorMap.customColorMap(5, 100, min, max)

    if args.field == args.field2:
        min2 = min
        max2 = max

    CS = plt.contourf(lat1[latind], lev, th, np.arange(min, max, contour), cmap=cm)
    if args.field2 and args.field2 != args.field:
        b = plt.colorbar(CS, orientation='vertical', format = ticker.FuncFormatter(colorbarFmt), pad=0.02)
else:
    CS = plt.contour(lat1[latind], lev, th, np.arange(min, max, contour))
    fmt1 = "%0.0f"
    if args.field == 'vwnd':
        fmt1="%0.1f"
    if args.field == 'omega':
        fmt1="%0.3f"
    plt.clabel(CS, CS.levels[::2], inline=True, fmt=fmt1, fontsize=14)

plt.gca().invert_yaxis()

# print (th)

if args.field2 != 'none':
    CS2 = plt.contour(lat2[latind], lev, th2, np.arange(min2,max2, contour2), colors='k')
    fmt2 = "%0.0f"
    if args.field2 == 'vwnd':
        fmt2="%0.1f"
    if args.field2 == 'omega':
        fmt2="%0.3f"
    plt.clabel(CS2, CS2.levels[::2], inline=True, fmt=fmt2, fontsize=14)

if args.field2 != 'none' and args.field2 != args.field:
    if args.zonalaverage:
        plt.title(fieldTitle + ' and ' + field2Title +' (Zonal)', fontsize=20)
    else:
        plt.title(fieldTitle + ' and ' + field2Title +' at lon ' + str(args.lon), fontsize=20)
else:
    if args.zonalaverage:
        plt.title(fieldTitle + ' (Zonal) ', fontsize=20, y=1.04)
    else:
        plt.title(fieldTitle + ' at lon ' + str(args.lon), fontsize=20, y=1.04)

axis_font = {'fontname':'Arial', 'size':'20'}
plt.xlabel("Latitude", **axis_font)
plt.ylabel("Pressure", **axis_font)

if args.logscale:
    ax1 = plt.axes()
    ax1.set_yscale('log')
    if args.minpress == 100:
        ax1.set_yticks([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000])
    elif args.minpress == 10:
        ax1.set_yticks([10, 100, 200, 300, 400, 500])
    elif args.minpress == 1:
        ax1.set_yticks([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
    elif args.minpress == 500:
        ax1.set_yticks([500, 600, 700, 800, 900, 1000])

    ax1.get_yaxis().set_major_formatter(matplotlib.ticker.ScalarFormatter())
    # https://stackoverflow.com/questions/46498157/overlapping-axis-tick-labels-in-logarithmic-plots/46498658#46498658
    ax1.minorticks_off()

plt.savefig(fn, bbox_inches='tight', transparent = True)

if args.field2 != 'none':
    print (json.dumps({
        'field': {
            'min': min,
            'max': max,
            'contour': contour
        },
        'field2': {
            'min': min2,
            'max': max2,
            'contour': contour2
        }
    }))
else:
    print (json.dumps({
        'field': {
            'min': min,
            'max': max,
            'contour': contour
        }
    }))
