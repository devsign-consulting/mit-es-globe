<html>
<?php
$url=$_POST["url"];
//$s=array("plotrange/X/91.25/521.25","plotborder+72","plotaxislength+700");
//$r=array("plotrange/X/-180/180","plotborder+0","plotaxislength+2048");
//$url=str_replace($s,$r,$url);
$s=array("/plotrange\/X\/[0-9,.]*\/[0-9,.]*/","/plotborder\+[0-9]*\+/","/plotaxislength\+[0-9]*\+/","/\.gif/");
$r=array("plotrange/X/-180/180","plotborder+0+","plotaxislength+2048+",".png");
$url=preg_replace($s,$r,$url);

$k=rand(0,9999);
$fn=sprintf("/tmp/mp-%04d.png",$k);
$cmd='curl "'.$url.'" > '.$fn;
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
ok<br/>
<?php echo $cmd?><br/>
</body>
</html>
