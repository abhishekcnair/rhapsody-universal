<?php

include "myapikey.php";

$artistname_old = urlencode($_POST['artistname']);
$artistname = str_replace('%2B', '+', $artistname_old);

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => 'http://api.rhapsody.com/v1/search?q='.$artistname.'&type=artist&apikey='.$myapikey,
    CURLOPT_USERAGENT => 'Codular Sample cURL Request'
));

$resp = curl_exec($curl);
curl_close($curl);

$myArtists = json_decode($resp, true);
$counter = 0;
$artistids = []; //"";

foreach($myArtists as $thisArtist){
	similar_text($artistname, $thisArtist["name"], $sim);
	if($sim > 75){
		if($counter > 0){
			//$myArtistIDs = $myArtistIDs."#";
		}
		array_push($artistids,$thisArtist["id"]); // = $myArtistIDs.$thisArtist["id"];
		$counter++;
	}
}

if(count($artistids) > 0){
	$theseTracks = "";

	$x = 0;
	$artistid = $artistids[$x];
	$myArtistTracks = []; //getArtistTracks($artistid);
	//$x++;

	//echo "GOT SO MANY TRACKS FROM THIS ARTIST ID: ". $artistid." : ".count($myArtistTracks)." \n";

	while($x < count($artistids) && count($myArtistTracks) == 0){
		$artistid = $artistids[$x];

		$curl = curl_init();
		// Set some options - we are passing in a useragent too here
		curl_setopt_array($curl, array(
			CURLOPT_RETURNTRANSFER => 1,
			CURLOPT_URL => 'http://api.rhapsody.com/v1/artists/'.$artistid.'/tracks/top?limit=10&apikey='.$myapikey,
			CURLOPT_USERAGENT => 'Codular Sample cURL Request'
		));

		//echo 'http://api.rhapsody.com/v1/search?q='.$artistname.'&type=artist&apikey='.$myapikey;
		// Send the request & save response to $resp
		$resp = curl_exec($curl);
		// Close request to clear up some resources
		curl_close($curl);
		//echo 'RESPONSE IS : ' . $resp. "\n\n";
		$myArtistTracks = json_decode($resp, true);

		//echo "GOT SO MANY TRACKS FROM THIS ARTIST ID: ". $artistid." : ".count($myArtistTracks)." \n";
		$x++;
	}

	echo $_POST['x']."%%".$_POST['i']."%%".$_POST['splitX']."%%".$_POST['splitLen']."%%";
	echo $artistid."%%";

	foreach($myArtistTracks as $thisTrack){
		//$myArtistIDs = $myArtistIDs.", ".implode(", ",$thisArtist)."\n";
		$theseTracks = $theseTracks.$thisTrack["id"]."@@".$thisTrack["name"]."#";
	}

	echo $theseTracks;
}
else{
	echo "";
}
	/*
	include "databaseaccess.php";
	$output = "";
	$artistids = explode("#", $_POST['artistids']);
	$theseTracks = "";

	$x = 0;
	$artistid = $artistids[$x];
	$myArtistTracks = getArtistTracks($artistid);
	$x++;

	//echo "GOT SO MANY TRACKS FROM THIS ARTIST ID: ". $artistid." : ".count($myArtistTracks)." \n";

	while($x < count($artistids) && count($myArtistTracks) == 0){
		$artistid = $artistids[$x];
		$myArtistTracks = getArtistTracks($artistid);
		//echo "GOT SO MANY TRACKS FROM THIS ARTIST ID: ". $artistid." : ".count($myArtistTracks)." \n";
		$x++;
	}

	echo $artistid."%%";

	foreach($myArtistTracks as $thisTrack){
		//$myArtistIDs = $myArtistIDs.", ".implode(", ",$thisArtist)."\n";
		$theseTracks = $theseTracks.$thisTrack->TrackId."@@".$thisTrack->TrackName."#";
	}
	echo $theseTracks;
	*/

	//echo $output;

?>