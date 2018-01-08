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
