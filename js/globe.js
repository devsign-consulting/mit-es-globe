var globe = angular.module('p5globe', ['angular-p5']);
globe.controller('P5GlobeCtrl', function ($scope, $rootScope, $log, $window, $timeout, p5globe) {
    $timeout(function () {
        console.log("=== p5 globe controller init ===");
        $window.sph = p5globe.sph;
    });
});

globe.factory('p5globe', ['p5', '$window', '$rootScope', function(p5, $window, $rootScope) {
    var factory = {};
    var sph = {};
    factory.sketch = function (p) {
        var sz = 870;
        var w = 450;
        scalefac=1.06;
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
            return nm;
        };

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
        };

        p.checkSphere = function (im) {
            simg = im;
            if (pg && pg.image) {
                pg.image(simg, 0, 0, simg.width, simg.height, 0, 0, res[0], res[1]);
            }
            nSphere += skp;
            if (!movie) playing = false;
        };

        p.stopSphere = function () {
            console.log("stop " + imgnum + "\n");
            sphereok = true;
            playing = false;
        };

        // get an image with callback to draw it
        p.loadSphere = function (j) {
            imgnum = j + 1;
            skp = sph.skip;
            //console.log(p.convfn(url, j + 1));
            if (j == 0 || movie) {
                p.loadImage(p.convfn(url, j + 1), p.checkSphere, p.stopSphere);
            }
        };

        p.getcanvas = function(c) {
            if(!pg) return false;
            return pg.elt;
        };

        p.putcanvas = function(c) {
            context=pg.elt.getContext('2d');
            pg.elt.width=c.width;
            pg.elt.height=c.height;
            context.drawImage(c, 0, 0);
        };

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
        };

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
        };

        p.mouse2xz = function (mx, my) {
            xt = scalefac*(mx - sz / 2) / (sz / 2 - 20);
            zt = scalefac*(sz / 2 - my) / (sz / 2 - 20);
            return [xt, zt];
        };

        p.latlon2xy = function (latlon) {
            lat = latlon[0];
            lon = latlon[1];


            if (lon < -180) lon += 360;
            if (lon > 180) lon -= 360;

            // console.log("==== p.latlon2xy ====", latlon, res)

            return [(parseFloat(lon) + 180) / 360.0 * res[0], (90 - parseFloat(lat)) / 180.0 * res[1]];
        };
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
        };

        p.mousePressed = function (evt) {
            x00 = x0 = p.mouseX;
            y00 = y0 = p.mouseY;
            if (sph.mouseDown) {
                xz = p.mouse2xz(x0, y0);
                p.mouseDown(xz, p.xy2latlon(xz));
            }
            // console.log("mouse pressed", evt);
            return true;
        };

        p.mouseDragged = function () {
            msx = p.mouseX;
            msy = p.mouseY;
            p.dragInSphere(msx, msy);
            return false;
        };

        p.mouseReleased = function () {
            msx = p.mouseX;
            msy = p.mouseY;
            var latlng = p.xy2latlon([msx, msy]);
            if (sph.mouseUp) {
                r = sph.mouseUp([msx, msy], latlng);
                if (!r) return;
            }

            if ((msx - x00) * (msx - x00) + (msy - y00) * (msy - y00) > 16) return false;

            p.clickInSphere(msx, msy);
            return false;
        };

        var maincanvas;

        p.myevent = function (e) {
            alert(e.type);
        };

        p.setup = function () {
            maincanvas = p.createCanvas(sz, sz, p.WEBGL);
            maincanvas.parent('canvas-container');
            p.ortho(-p.width / 2, p.width / 2, -p.height / 2, p.height / 2, -1000, 1000);
            pg = p.createGraphics(res[0], res[1]);
            p.loadSphere(0);
            //    maincanvas.elt.addEventListener('keydown', myevent, false);
        };

        p.draw = function () {
            //    if(keyIsPressed)console.log(key);
            if (nSphere <= currentFrame) return;
            p.drawSphere();
            if (movie) {
                currentFrame += sph.skip;
                p.loadSphere(currentFrame);
            }
        };

        p.rot = function (f) {
            rottheta += f;
        };
        p.tilt = function (f) {
            phi += f;
        };

        p.orient = function (lat, lon) {
            rottheta = 0;
            theta = (180 - lon) * pi / 180;
            phi = lat * pi / 180;
        };

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
        };

        p.doclick = function (xy, latlon) {
            lat = p.rnd(latlon[0], 10);
            lon = p.rnd(latlon[1], 10);

            if (lat !==0 && lon !== 0) {
                p.clickedCoord = [ lat, lon ];
                console.log("doclick", p.clickedCoord);
                var xy = p.latlon2xy(latlon);
                p.drawLon(xy[0]);

                $rootScope.$broadcast("latlon", {latlon: [lat, lon]});
            }

            // sph.orient(lat,lon);

        };

        p.rnd = function (v, n) {
            return Math.round(v * n) / n;
        };

        p.drawTrajectory = function(x) {
            p.loadSphere(0);
            var xy = p.latlon2xy(p.clickedCoord);
            var x1 = xy[0];
            var y1 = xy[1];
            var x2 = x1;
            var y2 = y1;

            function getRandomArbitrary(min, max) {
                return Math.random() * (max - min) + min;
            }

            var drawLoop = function (ctx, color) {
                ctx.strokeStyle = color;
                setTimeout(function () {
                    ctx.beginPath();
                    var randx = getRandomArbitrary(-3, 3.5);
                    var randy = getRandomArbitrary(-3.5, 3);
                    x2 = x1 + randx;
                    y2 = y1 + randy;

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    x1 = x2;
                    y1 = y2;
                    drawLoop(ctx, color);
                }, 100);
            };

            var canvas = p.getcanvas();
            var ctx = canvas.getContext('2d');
            const colors = [
                '#FFFFFF',
                '#5aff75',
                '#ff9f84',
                '#9d9eff',
                '#ff5ffc',
                '#e6ff5f',
                '#ffcc97',
                '#85ffe7',
                '#ecff8d',
                '#ff7c00'
            ];
            var color = colors[Math.round(getRandomArbitrary(0, colors.length - 1), 0)];
            ctx.lineWidth=2;
            drawLoop(ctx, color);
        };

        p.drawLon = function(x){
            p.loadSphere(0);
            setTimeout(function () {
                var canvas = p.getcanvas();
                ctx = canvas.getContext('2d');
                ctx.strokeStyle="#550a07";
                ctx.lineWidth=5;
                ctx.beginPath();
                ctx.moveTo(x,0);
                ctx.lineTo(x,canvas.height-1);
                ctx.stroke();
            }, 100);

        };

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
            drawTrajectory: p.drawTrajectory
        };
        factory.sph = sph;
        return p;
    };

    return factory;
}])
