<?php
$data = array("response"=>"hello");
header('Content-Type: text/javascript');
echo $_GET['callback'] ."(".json_encode($data).")";