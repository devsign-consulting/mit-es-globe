<html>
  <?php
$s=explode("&",$_SERVER["PATH_INFO"]);
//echo "<p>http:/~glenn/iglobe/mit",$s[0],"</p>\n";
//echo "<p>",$s[1],"</p>\n";
?>
<h4>Paste URL here
<form action="http:/~glenn/iglobe/mit<?php echo $s[0]?>" method="POST">
<input type="text" width=80 name="url"/>
<input type="submit">
</form></h4>
<p>
<iframe src="https://<?php echo $s[1]?>" width="100%" height="90%"></iframe>
</html>
