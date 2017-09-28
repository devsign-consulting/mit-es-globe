//url="iglobe.php/image/earth"+res[0]+".jpg";

movie=false;
playing=true;
var pi=3.1415926536;
var radtodeg=180.0/pi;
//var res=[1024,512];

var theta=pi;
var phi=0;
var rottheta=0;
var rotphi=0;

var simg;
var pg;

var sphereok=false;
var nSphere=0;
var currentFrame=0;

function convfn(fn,fnum){
    if(movie){
	p=fn.indexOf("#");
        z="0000";
        ns=fnum.toString();
        if (ns.length < 4) ns=z.substr(0,4-ns.length)+ns;
        nm=fn.substr(0,p)+ns+fn.substr(p+1);
    } else {
        nm=fn;
    };
    return nm;
}

function drawSphere(){
//    pg.image(simg,0,0,simg.width,simg.height,0,0,1024,512);
//    pg.strokeWeight(2);
//    pg.stroke(255,0,0);
//    pg.line(20,20,300,300);//x0,y0,x,y);
    texture(pg);
    rotateX(phi);
    rotateY(theta);
    ellipsoid(w,w,w,40,24);
    theta += rottheta;
}

function checkSphere(im){
    simg=im;
    pg.image(simg,0,0,simg.width,simg.height,0,0,res[0],res[1]);
    nSphere += skp;
    if(!movie) playing=false;
}

function stopSphere(){
    console.log("stop "+imgnum+"\n");
    sphereok=true;
    playing=false;
}

// get an image with callback to draw it
function loadSphere(j) {
    imgnum=j+1;
    skp=sph.skip;
    console.log(convfn(url,j+1));
    if(j==0 || movie){
	loadImage(convfn(url,j+1), checkSphere, stopSphere);
    };
}

var x0=0;
var y0=0;
var x00=0;
var y00=0;

function dragInSphere(mx,my){
    xz=mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]>1) return;
    if(sph.sphereDrag){
	latlon=xy2latlon(xz);
	r=sph.sphereDrag(xz,latlon);
	if (!r) return;
    };
    theta += 0.005*(mx-x0);
    phi += 0.005*(my-y0);
    rottheta=0;
    rotphi=0;
    x0=mx;
    y0=my;
    return;
}

function clickInSphere(mx,my){
    xz=mouse2xz(mx,my);
    if (xz[0]*xz[0]+xz[1]*xz[1]<=1){
        if(sph.sphereClick){
            latlon=xy2latlon(xz);
            sph.sphereClick(xz,latlon);
        }
        } else {
            if(sph.sphereClick){
                sph.sphereClick([-999,-999],[0,0]);
        }
    }
//    var typ="u";
//    if (yt>0) typ="l";
//    if (xt>0) typ=typ+"r";
//    else typ=typ+"l";
//    clickOutside(typ);
    return false;
}

function mouse2xz(mx,my){
    xt=(mx-sz/2)/(sz/2-20);
    zt=(sz/2-my)/(sz/2-20);
    return [xt,zt];
}
function latlon2xy(latlon){
    lat=latlon[0];
    lon=latlon[1];
    if(lon<-180) lon +=360;
    if(lon>180) lon -=360;
    return [(float(lon)+180)/360.0*res[0],(90-float(lat))/180.0*res[1]];
}
function xy2latlon(xz){
    xt=xz[0];
    zt=xz[1];
    yt=-sqrt(abs(1-xt*xt-zt*zt));
    zn=-yt*sin(phi)+zt*cos(phi);
    yt=yt*cos(phi)+zt*sin(phi)
    xn=-xt*cos(theta)-yt*sin(theta);
    yn=xt*sin(theta)-yt*cos(theta);
    lat=radtodeg*asin(zn);
    lon=radtodeg*atan2(xn,-yn);
    return [lat,lon];
}

function mousePressed(){
    x00=x0=mouseX;
    y00=y0=mouseY;
    if(sph.mouseDown){
	xz=mouse2xz(x0,y0);
	mouseDown(xz,xy2latlon(xz));
    };
    return false;
}

function mouseDragged(){
    msx=mouseX;msy=mouseY;
    dragInSphere(msx,msy);
    return false;
}

function mouseReleased(){
    msx=mouseX;msy=mouseY;
    var latlng = xy2latlon([msx,msy]);
    if(sph.mouseUp){
        r=sph.mouseUp([msx,msy],latlng);
        if(!r)return;
    };
    if ((msx-x00)*(msx-x00)+(msy-y00)*(msy-y00)>16)return false;
    console.log("click "+msx+", "+msy, latlng);
    clickInSphere(msx,msy);
    return false;
}

var maincanvas;

function myevent(e){
    alert(e.type);
}

function setup(){
    maincanvas=createCanvas(sz, sz, WEBGL);
    maincanvas.parent('canvas-container');
    ortho(-width/2,width/2,-height/2,height/2,-1000,1000);
    pg = createGraphics(res[0],res[1]);
    loadSphere(0);
//    maincanvas.elt.addEventListener('keydown', myevent, false);
}

function draw(){
//    if(keyIsPressed)console.log(key);
    if(nSphere <= currentFrame) return;
    drawSphere();
    if(movie){
	currentFrame += sph.skip;
	loadSphere(currentFrame);
    };
}

function rot(f){
  rottheta += f;
}
function tilt(f){
  phi +=f;
}
function orient(lat,lon){
    rottheta=0;
    theta=(180-lon)*pi/180;
    phi=lat*pi/180;
}
function show(fn){
    playing=false;
    url="iglobe.php/"+fn;

    if(url.indexOf("#") >= 0)
	    movie=true;
    else
	    movie=false;

    currentFrame=0;
    loadSphere(0);
    playing=true;
}

function showLocal(fn){
    playing=false;
    url="/graphics/"+fn;

    if(url.indexOf("#") >= 0)
        movie=true;
    else
        movie=false;

    currentFrame=0;
    loadSphere(0);
    playing=true;
}

function showcanvas(c){
    pg.elt=c;
}

var sph={
    rot:rot,
    tilt:tilt,
    orient:orient,
    show:show,
    skip:1,
    sphereClick:null,
    sphereDrag:null,
    mouseDown:null,
    mouseUp:null,
    url:url,
    online:online,
    res:res,
    showcanvas:showcanvas
};
