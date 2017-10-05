import numpy as np
from scipy.io.netcdf import netcdf_file
import dap.client
import sys
import subprocess
field="pottmp"
z=1000
longitude=360-70
dt=5
fn="test.png"

nc0=netcdf_file('ESRL-'+field+'.mon.1981-2010.ltm.nc','r')
nc=nc0.variables
lat=nc['lat'][:]
lon=nc['lon'][:]
level=nc['level'][:]
yrday=nc['time'][:]
theta=nc[field][:,:,:,:]

# os.environ[ 'MPLCONFIGDIR' ] = '/tmp/'
import matplotlib
matplotlib.use('Agg')
import matplotlib.mlab as mlab
import matplotlib.pyplot as plt

delta = 0.025
x = np.arange(-3.0, 3.0, delta)
y = np.arange(-2.0, 2.0, delta)
X, Y = np.meshgrid(x, y)
Z1 = mlab.bivariate_normal(X, Y, 1.0, 1.0, 0.0, 0.0)
Z2 = mlab.bivariate_normal(X, Y, 1.5, 0.5, 1, 1)
# difference of Gaussians
Z = 10.0 * (Z2 - Z1)

plt.figure()
CS = plt.contour(X, Y, Z)
plt.clabel(CS, inline=1, fontsize=10)
plt.title('Simplest default with labels')

plt.savefig(fn)