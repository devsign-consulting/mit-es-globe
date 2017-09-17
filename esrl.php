<html>
<?php
$fn="esrl/".$_POST['model'];
//echo $fn,"\n";
if (! file_exists($fn)) {
  exit();
};
$s=file_get_contents($fn);
//print_r($s);
$nn=0;
$k[$nn]='${QUERY_STRING}';
$r[$nn++]=$_SERVER['QUERY_STRING'];
$fn=sprintf("/tmp/es-%04d.png",rand(0,9999));
$k[$nn]='${fn}';
$r[$nn++]=$fn;
//print_r($_POST);
foreach ($_POST as $pk => $p)
 {
  $k[$nn]='${' . $pk . '}';
  $r[$nn++]=$p;
 };
print_r($k);
print_r($r);
$snew=str_replace($k,$r,$s);
$dn="/tmp/esglobe.program";
//print_r($dn);
//print_r($snew);
//exit(0);
file_put_contents($dn,$snew);
passthru("chmod +x /tmp/esglobe.program;/tmp/esglobe.program")
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
ok
</body>
</html>

