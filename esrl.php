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
            $contour = $_POST['contour'];
            $contourDensity = $_POST['contourDensity'];
            $fn="es".md5($timeInput.$fieldInput.$pressInput.$contour.$contourDensity);
            $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"year"=>-1);
            $t0 = $time[$_POST['time']];
            if ($t0 >= 0)
                $filename=$fn."-".$t0.".png";
            else
                $filename=$fn."-0.png";

            if (!file_exists("./esrl/output/$filename")) {
                error_log("==== executing program ====");
                $cmd = "python esrl/showclim.py --filename $fn --field $fieldInput --time $timeInput --press $pressInput";
                if ($contour) {
                    $cmd .= " --contour true --contour-density $contourDensity";
                }

                error_log($cmd);
                exec($cmd);
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
            $logscale = $_POST['logScale'];
            $fillcontour = $_POST['fillContour'];
            $min = $_POST['min'];
            $max = $_POST['max'];
            $min2 = $_POST['min2'];
            $max2 = $_POST['max2'];

            $lon = $_POST['lon'];

            $fn="section-".md5($press.$time.$field.$contour.$lon.$field2.$contour2.$logscale.$max.$min.$max2.$min2.$fillcontour).".png";
            // if (!file_exists("./esrl/output/$fn")) {
                error_log("===== executing program=====");
                $cmd = "python esrl/showsection.py --filename $fn --field $field --month $time --minpress $press --lon $lon --contour $contour --logscale $logscale";

                if ($min)
                    $cmd .= " --min $min";
                if ($max)
                    $cmd .= " --max $max";
                if ($fillcontour)
                    $cmd .= " --fill-contour";

                if ($field2) {
                    $cmd .= " --field2 $field2 --contour2 $contour2";

                    if ($min2)
                        $cmd .= " --min2 $min2";
                    if ($max2)
                        $cmd .= " --max2 $max2";
                }

                error_log($cmd);
                $output = exec($cmd);
                $output = json_decode($output);

            // }

            echo json_encode(array(
                "filename" =>$fn,
                "form" => "section",
                "output" => $output
            ));
        } else {
            // execute any generic script with command line arguments
            // Construct the arguments from the $_POST variable
        }

    }
?>