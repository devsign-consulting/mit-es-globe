<?php
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        if ($_POST['action'] === "esrl") {
            $fn="esrl/".$_POST['model'];
            if (! file_exists($fn)) {
                exit();
            };
            $timeInput = $_POST['time'];
            $fieldInput = $_POST['field'];
            $pressInput = $_POST['press'];
            $fn="es".md5($timeInput.$fieldInput.$pressInput);
            $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"year"=>-1);
            $t0 = $time[$_POST['time']];
            if ($t0 >= 0)
                $filename=$fn."-".$t0.".png";
            else
                $filename=$fn."-0.png";

            if (!file_exists("./esrl/output/$filename")) {
                error_log("==== executing program ====");
                error_log("esrl/showclim.py --filename $fn --field $fieldInput --time $timeInput --press $pressInput");
                passthru("esrl/showclim.py --filename $fn --field $fieldInput --time $timeInput --press $pressInput");
            }

            echo json_encode(array(
                "filename" => $filename,
                "form" => "esrl",
                "lat" => $_POST['lat'],
                "lon" => $_POST['lon']
            ));
        } else if ($_POST['action'] === "section") {
            $press = $_POST['press'];
            $time = $_POST['time'];
            $field = $_POST['field'];
            $field2 = $_POST['field2'];
            $contour = $_POST['contour'];
            $contour2 = $_POST['contour2'];
            $lon = $_POST['lon'];

            $fn="section-".md5($press.$time.$field.$contour.$lon.$field2.$contour2).".png";
            if (!file_exists("./esrl/output/$fn")) {
                error_log("===== executing program=====");

                if ($field2) {
                    $cmd = "esrl/showsection.py --filename $fn --field $field --field2 $field2 --month $time --minpress $press --lon $lon --contour $contour --contour2 $contour2";
                    error_log($cmd);
                    passthru($cmd);
                } else {
                    $cmd = "esrl/showsection.py --filename $fn --field $field --month $time --minpress $press --lon $lon --contour $contour";
                    error_log($cmd);
                    passthru($cmd);
                }

            }

            echo json_encode(array(
                "filename" =>$fn,
                "form" => "section"
            ));
        } else {
            // execute any generic script with command line arguments
            // Construct the arguments from the $_POST variable

        }

    }
?>