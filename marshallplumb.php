<html>
<?php
$url=$_POST["url"];
$s=array("/X\/[0-9,.,-]*\/[0-9,.,-]*/","/Y\/[0-9,.,-]*\/[0-9,.,-]*/","/plotborder\+[0-9]*\+/","/plotaxislength\+[0-9]*\+/");
$r=array("X/-180/180","Y/-90/90","plotborder+0+","plotaxislength+2048+");
$rmit=array("X/-180/180","Y/-90/90","plotborder+0+","plotaxislength+1024+");

if (strpos($url,".mit.")){
$url=preg_replace($s,$rmit,$url);
} else {
$url=preg_replace($s,$r,$url);
};

$k=rand(0,9999);
$fn=sprintf("/tmp/mp-%04d.gif",$k);
$cmd='curl --globoff "'.$url.'" > '.$fn;
//echo $cmd;
passthru($cmd);
?>
<head>
  <script>
    var sph;
    function init(){
    sph=parent.parent.sph;
    sph.show("image<?php echo $fn?>");
    }
    function finis(){
    }
  </script>
</head>
<body onload="init()">
<?php echo $cmd?><br/>
</body>
</html>
