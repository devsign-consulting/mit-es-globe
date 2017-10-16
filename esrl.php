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
                "lat" => $_POST['lat'],
                "lon" => $_POST['lon']
            ));
        }

        if ($_POST['action'] === "section") {
            $minpress = $_POST['minpress'];
            $month = $_POST['month'];
            $field = $_POST['field'];
            $contour = $_POST['contour'];

            $fn="section-".md5($minpress.$month.$field.$contour);
            passthru("esrl/showsection.py --filename $fn --field $field --time $time --press $press");

        }

    }
?>