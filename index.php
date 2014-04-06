<?php
error_reporting(E_ALL);
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);

require_once 'ritetag/init.php';
require_once 'config.php';

$client = new \ritetag\Client(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);

$response = $client->aiTwitter('test');
echo "<div><pre>";
echo $response->getBody();
echo "</pre></div>";

echo "<p>Limit remain: ".$response->getRemain()."</p>";
