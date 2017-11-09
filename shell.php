<html>
  <?php
     // s.php?shell.php/resultsproc&sourceurl
     $s=explode("&",$_SERVER["PATH_INFO"]);
     //echo "<p>http:/~glenn/iglobe/mit",$s[0],"</p>\n";
     //echo "<p>",$s[1],"</p>\n";
     ?>
<html>
<head>
<script>
function set_nosee(d){
  document.getElementById('work').style.display=d;
  }
function clearurl(){
  document.getElementById('urltext').value='';
}
</script>
</head>
<body>
<form action="http:/esglobe/<?php echo $s[0]?>.php" method="POST" target="nosee">
<b>Copy information to here</b><br/>
<button onclick='clearurl()'>Clear</button>
<input id='urltext' type="text" size=80 name="url"/>
<input type="submit" value="Show">
<div id="work" style="display:none" width="600" height="100">
<iframe name="nosee"></iframe>
<a href="javascript:set_nosee('none')">hide</a>
</div>
<a href="javascript:set_nosee('')">+</a>
</form>
<p>
<iframe src="http://<?php echo $s[1]?>" width="100%" height="92%"></iframe>
</body>
</html>
