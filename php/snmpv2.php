<?php
// The request is a JSON request.
// We must read the input.
// $_POST or $_GET will not work!


$data = array(); // array to pass back data
$errors = array(); //array to hold errors


if (empty($_POST['ip_address']))
  $errors['ip_address'] = 'ipAddress is required.';
if (empty($_POST['snmp_key']))
  $errors['snmp_key'] = 'SNMP Key is required.';
if (empty($_POST['snmp_mib']))
  $errors['snmp_mib'] = 'SNMP MIB  is required.';
if (empty($_POST['snmp_mib_time']))
  $errors['snmp_mib_time'] = 'SNMP MIB for time tracking is required.';
// return a response ===========================================================
// response if there are errors

if ( ! empty($errors)) {
  // if there are items in our errors array, return those errors
  $data['success'] = false;
  $data['errors'] = $errors;
  $data['messageError'] = 'Please check the fields in red';
} else {
  // if there are no errors, return a message
  $ip_address = $_POST['ip_address']; // required
  $snmp_key = $_POST['snmp_key']; // required
  $snmp_mib = $_POST['snmp_mib']; // required
  $snmp_mib_time = $_POST['snmp_mib_time']; // required

  $time = snmp2_get($ip_address, $snmp_key , "SNMPv2-MIB::sysUpTime.0");
  $token = strtok($time, " ()\n\t");
  $token_time = strtok(" ()\n\t");

  $values = snmp2_getnext($ip_address, $snmp_key, "1.3.6.1.2.1.4.3");
  $data['time'] = $token_time;
  $token_packets = strtok($values , " : \n\t");
  $token_packets = strtok ( " : \n\t");
  $data['snmp_packets']= $token_packets; 
  $data['success'] = true;
  $data['messageSuccess'] = 'SNMP command executed';

}
// return all our data to an AJAX call
echo json_encode($data);

