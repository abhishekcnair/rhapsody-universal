<?php
//setup php for working with Unicode data
mb_internal_encoding('UTF-8');
mb_http_output('UTF-8');
mb_http_input('UTF-8');
mb_language('uni');
mb_regex_encoding('UTF-8');
ob_start('mb_output_handler');

$username="discoveruser";
$password="dont$4get";
$database="discover";
$DBH = "";

try {  
    $DBH = new PDO("mysql:host=localhost;dbname=$database", $username, $password, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8") );  
    $DBH->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
}  
catch(PDOException $e) {  
    echo $e->getMessage();  
}


$link = mysqli_connect ( "127.0.0.1", "root", "", "", 9306 );
if ( mysqli_connect_errno() )
    die ( "connect failed: " . mysqli_connect_error() );

require_once("bshare_model.php");

?>