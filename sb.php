<html>
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
      var res=[2048,1024];
    </script>
    <script src="sph.js"></script>
  </head>
  <body>
  <div class='ext'>
    <iframe src="http:<?php echo $_SERVER["QUERY_STRING"]?>" 
    height=800px width=720px></iframe>
  </div>
</body>
</html>
