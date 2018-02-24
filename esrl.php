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
            $min = $_POST['min'];
            $max = $_POST['max'];
            $pressureRange = $_POST['pressureRange'];
            $contourStep = $_POST['contourStep'];
            $fn="es".md5($timeInput.$fieldInput.$pressInput.$contour.$contourStep.$pressureRange);
            $time = array("Jan"=>0,"Feb"=>1,"Mar"=>2,"Apr"=>3,"May"=>4,"Jun"=>5,"Jul"=>6,"Aug"=>7,"Sep"=>8,"Oct"=>9,"Nov"=>10,"Dec"=>11,"Movie"=>-1,"Year"=>-2);
            $t0 = $time[$_POST['time']];
            if ($t0 >= 0)
                $filename=$fn."-".$t0.".png";
            else
                $filename=$fn."-0.png";

            if (!file_exists("./esrl/output/$filename")) {
                error_log("==== executing program ====");
                $cmd = "python esrl/showclim.py --filename $fn --field $fieldInput --time $timeInput --press $pressInput --min $min --max $max";
                if ($contour) {
                    $cmd .= " --contour true --contour-step $contourStep";
                }

                if ($pressureRange) {
                    $cmd .= " --press-range $pressureRange";
                }

                error_log($cmd);
                exec($cmd);
            }

            echo json_encode(array(
                "filename" => $filename,
                "colorbarFilename" => $fn."-colorbar.png",
                "form" => "esrl",
                "lat" => $_POST['lat'],
                "lon" => $_POST['lon'],
                "time" => $_POST['time']
            ));
        } else if ($_POST['action'] === "section") {
            $press = $_POST['press'];
            $time = $_POST['time'];
            $field = $_POST['field'];
            $field2 = $_POST['field2'];
            $contour = $_POST['contour'];
            $contour2 = $_POST['contour2'];
            $logscale = $_POST['logScale'];
            $zonalaverage = $_POST['zonalAverage'];
            $fillcontour = $_POST['fillContour'];
            $min = $_POST['min'];
            $max = $_POST['max'];
            $min2 = $_POST['min2'];
            $max2 = $_POST['max2'];
            $returnData = $_POST['returnData'];

            $lon = $_POST['lon'];

            $fn="section-".md5($press.$time.$field.$contour.$lon.$field2.$contour2.$logscale.$max.$min.$max2.$min2.$fillcontour.$zonalaverage).".png";
            if (!file_exists("./esrl/output/$fn")) {
                error_log("===== executing program=====");
                $cmd = "python esrl/showsection.py --filename $fn --field $field --month $time --minpress $press --lon $lon --contour $contour --logscale $logscale --zonal-average $zonalaverage";

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

                if ($returnData) {
                    $cmd .= " --return-data";
                }

                error_log($cmd);
                $output = exec($cmd);
                $output = json_decode($output);

            }

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