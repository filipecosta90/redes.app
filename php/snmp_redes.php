<?php
// The request is a JSON request.
// We must read the input.
// $_POST or $_GET will not work!

$data = file_get_contents("php://input");

$objData = json_decode($data);

// Static array for this demo
$values = snmp2_getnext("127.0.0.1", "public", "1.3.6.1.2.1.4.3");
	echo $values;

