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
vind = np.where(level1 >= args.minpress)

# the expression below only works if the 2nd and 3rd argument have the same dimensions
# However, the 2nd argument is an array of indicies for the pressure, and the 3rd argument is an array of
# indices for latitude, so I don't know what to do here to make this work.
th=np.squeeze(theta[mon,vind,:,lonind])

if args.field2 != 'none':
    th2=np.squeeze(theta2[mon,vind,:,lonind])

lev = level1[vind]

import matplotlib
import math
matplotlib.use('Agg')
from matplotlib import cm
import matplotlib.pyplot as plt
from matplotlib.ticker import ScalarFormatter
import matplotlib.ticker as ticker

matplotlib.rc('xtick', labelsize=18)
matplotlib.rc('ytick', labelsize=18)

fig = plt.figure(figsize=(12, 10))
ax = fig.add_subplot(1,1,1)

# field 1 logic
if args.field == 'omega':
    th = th*1000
    fieldTitle = fieldTitle + " x 1E-3"

if (args.field == 'vwnd') or (args.field == 'uwnd'):
    th = th*10
    fieldTitle = fieldTitle + " x 1E-1"

# argument min/max overrides
if args.min:
    min = float(args.min)
else:
    min = math.floor(th.min())

if args.max:
    max = float(args.max)
else:
    max = math.ceil(th.max())

contour = (max - min) / args.contour


# field 2 logic
if args.field2 == 'omega':
    th2 = th2*1000
    field2Title = field2Title + " x 1E-3"

if (args.field2 == 'vwnd') or (args.field2 == 'uwnd'):
    th2 = th2*10
    field2Title = field2Title + " x 1E-1"



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
    contour2 = (max2 - min2) / args.contour2


# color bar formatter
def colorbarFmt(x, pos):
    return int(x)

# print (max, min, contour)
if args.fillcontour:
    CS = plt.contourf(lat1[latind], lev, th, np.arange(min, max, contour))
    if args.field2 and args.field2 != args.field:
        b = plt.colorbar(CS, orientation='vertical', format = ticker.FuncFormatter(colorbarFmt), pad=0.02)
else:
    CS = plt.contour(lat1[latind], lev, th, np.arange(min, max, contour))
    plt.clabel(CS, CS.levels[::2], inline=True, fmt="%0.0f", fontsize=14)

plt.gca().invert_yaxis()

# print (th)

if args.field2 != 'none':
    CS2 = plt.contour(lat2[latind], lev, th2, np.arange(min2,max2, contour2), colors='k')
    plt.clabel(CS2, CS2.levels[::2], inline=True, fmt="%0.0f", fontsize=14)

if args.field2 != 'none' and args.field2 != args.field:
    plt.title(fieldTitle + ' and ' + field2Title +' at lon ' + str(args.lon), fontsize=20, y=1.04)
else:
    plt.title(fieldTitle + ' at lon ' + str(args.lon), fontsize=20, y=1.08)

axis_font = {'fontname':'Arial', 'size':'20'}
plt.xlabel("Latitude", **axis_font)
plt.ylabel("Pressure", **axis_font)

if args.logscale:
    ax1 = plt.axes()
    ax1.set_yscale('log')
    ax1.set_yticks([200, 300, 400, 500, 600, 700, 800, 900, 1000])
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
