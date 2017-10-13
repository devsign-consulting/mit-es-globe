<?php
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
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
        $fn=sprintf("es-%04d",rand(0,9999));
        $k[$nn]='${fn}';
        $r[$nn++]=$fn;
        //print_r($_POST);
        foreach ($_POST as $pk => $p)
        {
            $k[$nn]='${' . $pk . '}';
            $r[$nn++]=$p;
        };
        error_log(print_r($k, true));
        error_log(print_r($r, true));
        $snew=str_replace($k,$r,$s);

        // create a temp file in /tmp/esglobe.program
        $dn="/tmp/esglobe.program";

        error_log("====snew===");
        error_log(print_r($snew, true));
        //exit(0);

        // write the temp program file
        file_put_contents($dn,$snew);

        // execute the temp program file
        passthru("chmod +x /tmp/esglobe.program;/tmp/esglobe.program");
        echo json_encode(array(
            "filename" => $fn."-0.png",
            "lat" => $_POST['lat'],
            "lon" => $_POST['lon']
        ));
    }
?>