from matplotlib.colors import LinearSegmentedColormap
import matplotlib.pyplot as plt
import numpy as np

def customColorMap(vcent, vrange, vmin, vmax):

    print "custom color map", vcent, vrange, vmin, vmax
    # vmin = 225
    # vmax = 950
    # vcent = 500
    # vrange = 100

    cm = plt.cm.jet
    colorIdx = np.arange(1, 256, 1)

    arr = np.array([])
    colorList = []
    for i in colorIdx:
        colorList.append(cm(colorIdx[i-1]))

    colorList = np.asarray(colorList)

    v = np.arange(0,255,1)
    v = v / 255.0
    v = v * (vmax-vmin) + vmin

    #print v

    tanhv = np.tanh((v-vcent)/vrange) + 1
    tanhv = (tanhv-tanhv.min())/(tanhv.max()-tanhv.min())

    #print tanhv
    x_str = np.array_repr(tanhv).replace('\n', '')
    #print(x_str)

    newMapIndexArr = np.floor(tanhv*255.999)
    #print newMapIndexArr
    newColorList = []

    for i in newMapIndexArr:
        if i > colorList.shape[0] - 1:
            i = colorList.shape[0] - 1
        newColorList.append(colorList[int(i)])

    newColorList = np.asarray(newColorList).tolist()

    cm = LinearSegmentedColormap.from_list(
        'tanh', newColorList, N=255)

    return cm

def airColorMap(press_range):
    min = -100
    max = 80
    vcenter = 0
    vrange = 200

    return [min, max, vcenter, vrange]

def shumColorMap(press_range):
    min = 0
    max = 40
    vcenter = -10
    vrange = 20

    return [min, max, vcenter, vrange]

def rhumColorMap(press_range):
    min = 0
    max = 125
    vcenter = 50
    vrange = 100
    return [min, max, vcenter, vrange]

def wspdColorMap(press_range):
    min = 0
    max = 80
    vcenter = 5
    vrange = 50

    return [min, max, vcenter, vrange]

def pottmpColorMap(press_range):
    vcenter = 250
    vrange = 250

    if int(press_range) == 500:
        min = 225
        max = 350
    elif int(press_range) == 10:
        min = 225
        max = 1200
        vcenter = 300
        vrange = 250
    elif int(press_range) == 1:
        min = 225
        max = 1200
        vcenter = 600
        vrange = 300
    else:
        min = 225
        max = 500

    return [min, max, vcenter, vrange]

def uwndColorMap(press_range):
    if int(press_range) == 500:
        min = -20
        max = 40
        vcenter = 5
        vrange = 50
    else:
        min = -50
        max = 80
        vcenter = 5
        vrange = 100

    return [min, max, vcenter, vrange]


def vwndColorMap(press_range):
    if int(press_range) == 500:
        min = -15
        max = 15
        vcenter = 0
        vrange = 30
    else:
        min = -15
        max = 15
        vcenter = 0
        vrange = 30

    return [min, max, vcenter, vrange]

def omegaColorMap(press_range):
    if int(press_range) == 500:
        min = -0.1
        max = 0.15
        vcenter = 0
        vrange = 100
    else:
        min = -0.1
        max = 0.15
        vcenter = 0
        vrange = 100

    return [min, max, vcenter, vrange]


def heightColorMap(press_range):
    if int(press_range) == 500:
        min = -500
        max = 8000
        vcenter = 2000
        vrange = 10000
    else:
        min = -500
        max = 30000
        vcenter = 10000
        vrange = 10000

    return [min, max, vcenter, vrange]