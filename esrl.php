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

        $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"year"=>-1);
        $t0 = $time[$_POST['time']];

        // execute the temp program file
        passthru("chmod +x /tmp/esglobe.program;/tmp/esglobe.program");
        echo json_encode(array(
            "filename" => $fn."-".$t0.".png",
            "lat" => $_POST['lat'],
            "lon" => $_POST['lon']
        ));
    }
?>