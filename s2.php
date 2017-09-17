<html>
<?php
$qs=explode(";",$_SERVER["QUERY_STRING"]);
$url=$qs[0];
$arglist="var args={";
if(count($qs) > 1){
for ($n=1;$n<count($qs);$n++){
  $arg=explode("=",$qs[$n],2);
  $arglist=$arglist . $arg[0] . ':"' . $arg[1] . '",'; 
	       };
	       }
$arglist=$arglist . "}";
?>
  <head>
    <style>
      div.ext {
      position: absolute;
      top: 0px;
      left: 850px;
      width: 720px;
      height: 800px;
      border: 3px solid #0077ff;
      background-color: #f1f1d4;
      }
    </style>
    <script src="p5.min.js"></script>
    <script>
      var sz=800;
      var w=475;
      <?php echo $arglist?>;
      if("res" in args) {
         var res=args.res;
      } else {
         var res=[2048,1024];
      };
      if("map" in args){
         var url=args.map;
      } else {
         var url="earth2048.jpg";
      };
      if("online" in args){
         var online=1;
      } else {
         var online=0;
      };
    </script>
    <script src="sph.js"></script>
  </head>
  <body>
  <div class='ext'>
    <iframe src="http:<?php echo $url?>" 
    height=800px width=720px></iframe>
  </div>
</body>
</html>
