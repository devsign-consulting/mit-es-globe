<?php
header("Content-type: image/png");
$qs=$_SERVER["QUERY_STRING"];
$pi=$_SERVER["PATH_INFO"];
$a=explode('/',$pi,3);
//print_r($a);
switch($a[1]){
  case "ijpg":
    $cmd="/home/glenn/public_html/iglobe/ijpg/exijpg /home/glenn/public_html/iglobe/earth/webgl/".$a[2].".ijpg ".($qs+1);
    break;
  case "realtime":
  case "zip":
    $cmd="unzip -p /home/glenn/Movies/".$a[2].".zip sphere-".sprintf("%04d",$qs+1).".jpg";
    break;
  case "zipf":
    $cmd="unzip -p /home/glenn/Movies/".$a[2].".zip flat-".sprintf("%04d",$qs+1).".jpg";
    break;
  case "zipcut":
    $cmd="unzip -p /home/glenn/Movies/".$a[2].".zip sphere-".sprintf("%04d",$qs+1).".jpg|jpegtopnm|pnmscale -reduce 2|pnmtojpeg";
    break;
  case "image":
  case "flat":
  default:
    $cmd="cat /".$a[2];
    break;
    };
error_log($cmd);
passthru($cmd);
?>
