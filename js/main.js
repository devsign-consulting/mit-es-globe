var app = angular.module('app', ['angular-p5', 'ui.bootstrap']);
app.controller('MainCtrl', function ($scope, $rootScope, $log, $window, $timeout, $uibModal, globeSketch) {
    $scope.loop = {};
    $scope.input = {};
    $scope.input.delay = 1000;

    $scope.message = function (data) {
        // get child scope, we do not use factory since frame is not there yet in that phase
        $childScope = document.getElementById("esrl2").contentWindow.angular.element('body').scope();
        $childScope.$apply(function () {
            $childScope.$emit('from-parent', data);
        });
    };

    $scope.timeoutLoop = function (filename) {
        $scope.input.movieLoop = setTimeout(function() {
            if (!$scope.pause) {
                $scope.getFrame(filename, $scope.loop.i);
                $scope.loop.i++;
            }

            if ($scope.loop.i === 12)
                $scope.loop.i = 0;

            if (!$scope.pause)
                $scope.timeoutLoop(filename);
            else {
                clearTimeout($scope.input.movieLoop);
            }
        }, $scope.input.delay);
    };

    $scope.showGlobeImage = function (filename) {
        globeSketch.sph.show(filename, "/graphics");
    };

    $scope.getFrame = function (filename, frame) {
        var filename_frame = filename+"-"+frame+".png";
        globeSketch.sph.show(filename_frame);
        $timeout(function () {
            $scope.message({ frame: frame+1 });
        });
    };


    $scope.openLightboxModal = function (input, filename) {
        console.log("===openLightboxModal ", {input, filename });
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'lightboxModal.html',
            controller: 'LightboxModalCtrl',
            controllerAs: 'ctrl',
            size: "lg",
            appendTo: angular.element(".modal-parent"),
            resolve: {
                input: function () {
                    return input;
                },
                filename: function () {
                    return filename;
                }
            }
        });

        modalInstance.result.then(function () {
            $ctrl.selected = selectedItem;
        });
    }

    $rootScope.$on('latlon', function(event, data) {
        console.log("===latlon angular data===", data);
        $scope.message({ latlon: data});
    });

    $scope.$watch('iframeMessage', function (newVal, oldVal) {
        if (newVal && newVal.form === 'esrl' && newVal.filename) {
            // if it's a movie
            if(newVal.movie) {
                var filename = newVal.filename.split("-")[0];
                $scope.input.filename = filename;
                $scope.loop.i = 0;
                $scope.pause = false;
                clearTimeout($scope.input && $scope.input.movieLoop);
                $scope.timeoutLoop(filename, $scope.input.delay)
            } else {
                console.log("===globeSketch===", globeSketch);
                globeSketch.sph.show(newVal.filename);
                if (!newVal.bypassOrient)
                    globeSketch.sph.orient(newVal.lat, newVal.lon);
            }
        }

        if (newVal && newVal.action) {
            switch(newVal.action) {
                case "stepBack":
                    $scope.loop.i--;
                    if ($scope.loop.i < 0)
                        $scope.loop.i = 11;
                    $scope.getFrame($scope.input.filename, $scope.loop.i);
                    break;
                case "stepForward":
                    $scope.loop.i++;
                    if ($scope.loop.i === 12)
                        $scope.loop.i = 0;
                    $scope.getFrame($scope.input.filename, $scope.loop.i);
                    break;
                case "play":
                    $scope.pause = false;
                    $scope.timeoutLoop($scope.input.filename, $scope.input.delay);
                    break;
                case "pause":
                    $scope.pause = true;
                    $scope.loop.i--;
                    break;
                case "setDelay":
                    if (!_.isNaN(newVal.value) && newVal.value >=100 && newVal.value <=2000) {
                        $scope.input.delay = newVal.value;
                    }
                    break;
                case "lightboxModal":
                    $scope.openLightboxModal(newVal.input, newVal.filename);
                    break;

            }
        }

    });
});

app.controller("LightboxModalCtrl", function ($uibModalInstance, input, filename) {
    console.log("=== LightboxModalCtrl input ==", input, filename);
    this.filename = filename;
    this.input = input;
})

app.factory('globeSketch', ['p5', '$window', '$rootScope', function(p5, $window, $rootScope) {
    var factory = {};
    var sph = {};
    factory.sketch = function (p) {
            var sz = 950;
            var w = 500;
            var args = {};
            if ("res" in args) {
                var res = args.res;
            } else {
                var res = [2048, 1024];
            }
            if ("map" in args) {
                var url = args.map;
            } else {
                var url = "earth2048.jpg";
            }
            if ("online" in args) {
                var online = 1;
            } else {
                var online = 0;
            }

            var movie = false;
            var playing = true;
            var pi = 3.1415926536;
            var radtodeg = 180.0 / pi;
            //var res=[1024,512];

            var theta = pi;
            var phi = 0;
            var rottheta = 0;
            var rotphi = 0;

            var simg;
            var pg;

            var sphereok = false;
            var nSphere = 0;
            var currentFrame = 0;

            p.latlon = [];

            p.convfn = function (fn, fnum) {
                if (movie) {
                    p = fn.indexOf("#");
                    z = "0000";
                    ns = fnum.toString();
                    if (ns.length < 4) ns = z.substr(0, 4 - ns.length) + ns;
                    nm = fn.substr(0, p) + ns + fn.substr(p + 1);
                } else {
                    nm = fn;
                }
                ;
                return nm;
            }

            p.drawSphere = function () {
                //    pg.image(simg,0,0,simg.width,simg.height,0,0,1024,512);
                //    pg.strokeWeight(2);
                //    pg.stroke(255,0,0);
                //    pg.line(20,20,300,300);//x0,y0,x,y);
                p.texture(pg);
                p.rotateX(phi);
                p.rotateY(theta);
                p.ellipsoid(w, w, w, 40, 24);
                theta += rottheta;
            }

            p.checkSphere = function (im) {
                simg = im;
                pg.image(simg, 0, 0, simg.width, simg.height, 0, 0, res[0], res[1]);
                nSphere += skp;
                if (!movie) playing = false;
            }

            p.stopSphere = function () {
                console.log("stop " + imgnum + "\n");
                sphereok = true;
                playing = false;
            }

            // get an image with callback to draw it
            p.loadSphere = function (j) {
                imgnum = j + 1;
                skp = sph.skip;
                console.log(p.convfn(url, j + 1));
                if (j == 0 || movie) {
                    p.loadImage(p.convfn(url, j + 1), p.checkSphere, p.stopSphere);
                }
                ;
            }

            var x0 = 0;
            var y0 = 0;
            var x00 = 0;
            var y00 = 0;

            p.dragInSphere = function (mx, my) {
                xz = p.mouse2xz(mx, my);
                if (xz[0] * xz[0] + xz[1] * xz[1] > 1) return;
                if (sph.sphereDrag) {
                    latlon = p.xy2latlon(xz);
                    r = sph.sphereDrag(xz, latlon);
                    if (!r) return;
                }
                ;
                theta += 0.005 * (mx - x0);
                phi += 0.005 * (my - y0);
                rottheta = 0;
                rotphi = 0;
                x0 = mx;
                y0 = my;
                return;
            }

            p.clickInSphere = function (mx, my) {
                xz = p.mouse2xz(mx, my);
                if (xz[0] * xz[0] + xz[1] * xz[1] <= 1) {
                    if (sph.sphereClick) {
                        latlon = p.xy2latlon(xz);
                        sph.sphereClick(xz, latlon);
                    }
                } else {
                    if (sph.sphereClick) {
                        sph.sphereClick([-999, -999], [0, 0]);
                    }
                }
                //    var typ="u";
                //    if (yt>0) typ="l";
                //    if (xt>0) typ=typ+"r";
                //    else typ=typ+"l";
                //    clickOutside(typ);
                return false;
            }

            p.mouse2xz = function (mx, my) {
                xt = (mx - sz / 2) / (sz / 2 - 20);
                zt = (sz / 2 - my) / (sz / 2 - 20);
                return [xt, zt];
            }
            p.latlon2xy = function (latlon) {
                lat = latlon[0];
                lon = latlon[1];
                if (lon < -180) lon += 360;
                if (lon > 180) lon -= 360;
                return [(float(lon) + 180) / 360.0 * res[0], (90 - float(lat)) / 180.0 * res[1]];
            }
            p.xy2latlon = function (xz) {
                xt = xz[0];
                zt = xz[1];
                yt = -p.sqrt(p.abs(1 - xt * xt - zt * zt));
                zn = -yt * p.sin(phi) + zt * p.cos(phi);
                yt = yt * p.cos(phi) + zt * p.sin(phi)
                xn = -xt * p.cos(theta) - yt * p.sin(theta);
                yn = xt * p.sin(theta) - yt * p.cos(theta);
                lat = radtodeg * p.asin(zn);
                lon = radtodeg * p.atan2(xn, -yn);
                return [lat, lon];
            }

            p.mousePressed = function () {
                x00 = x0 = p.mouseX;
                y00 = y0 = p.mouseY;
                if (sph.mouseDown) {
                    xz = p.mouse2xz(x0, y0);
                    p.mouseDown(xz, p.xy2latlon(xz));
                }
                ;
                return false;
            }

            p.mouseDragged = function () {
                msx = p.mouseX;
                msy = p.mouseY;
                p.dragInSphere(msx, msy);
                return false;
            }

            p.mouseReleased = function () {
                msx = p.mouseX;
                msy = p.mouseY;
                var latlng = p.xy2latlon([msx, msy]);
                if (sph.mouseUp) {
                    r = sph.mouseUp([msx, msy], latlng);
                    if (!r) return;
                }
                ;
                if ((msx - x00) * (msx - x00) + (msy - y00) * (msy - y00) > 16) return false;

                p.clickInSphere(msx, msy);
                return false;
            }

            var maincanvas;

            p.myevent = function (e) {
                alert(e.type);
            }

            p.setup = function () {
                maincanvas = p.createCanvas(sz, sz, p.WEBGL);
                maincanvas.parent('canvas-container');
                p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -1000, 1000);
                pg = p.createGraphics(res[0], res[1]);
                p.loadSphere(0);
                //    maincanvas.elt.addEventListener('keydown', myevent, false);
            }

            p.draw = function () {
                //    if(keyIsPressed)console.log(key);
                if (nSphere <= currentFrame) return;
                p.drawSphere();
                if (movie) {
                    currentFrame += sph.skip;
                    p.loadSphere(currentFrame);
                }
                ;
            }

            p.rot = function (f) {
                rottheta += f;
            }
            p.tilt = function (f) {
                phi += f;
            }
            p.orient = function (lat, lon) {
                rottheta = 0;
                theta = (180 - lon) * pi / 180;
                phi = lat * pi / 180;
            }

            p.show = function (fn, path) {
                playing = false;
                if (!path)
                    url = "/esrl/output/" + fn;
                else
                    url = path + "/" + fn;

                if (url.indexOf("#") >= 0)
                    movie = true;
                else
                    movie = false;

                currentFrame = 0;
                p.loadSphere(0);
                playing = true;
            }

            p.showcanvas = function (c) {
                pg.elt = c;
            }

            p.doclick = function (xy, latlon) {
                lat = p.rnd(latlon[0], 10);
                lon = p.rnd(latlon[1], 10);
                // sph.orient(lat,lon);
                console.log("=== dlick ===", latlon);
                $rootScope.$broadcast("latlon", {latlon: [lat, lon]});
            }

            p.rnd = function (v, n) {
                return Math.round(v * n) / n;
            }

            sph = {
                rot: p.rot,
                tilt: p.tilt,
                orient: p.orient,
                show: p.show,
                skip: 1,
                sphereClick: p.doclick,
                sphereDrag: null,
                mouseDown: null,
                mouseUp: null,
                url: url,
                online: online,
                res: res,
                showcanvas: p.showcanvas
            };

            console.log("=== setting sph ===", sph);
            factory.sph = sph;
            return p;
        };

        return factory;
    }
]);
