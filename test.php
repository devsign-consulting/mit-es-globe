<html>
<body>
<pre>
<?php
echo "==== SERVER ====\n";
print_r($_SERVER);
//ini_set("session.gc_maxlifetime", "86400");
session_start();
echo "==== SESSION ====\n";
echo "expire=",ini_get("session.gc_maxlifetime"),"\n";
echo "path=",session_save_path(),"\n";
print_r($_SESSION);
$_SESSION['test']='next time';
if($_SERVER['REQUEST_METHOD']=="POST"){
  echo "==== POST DATA ====\n";
  print_r($_POST);
};
?>
</pre>
</body>
</html>

