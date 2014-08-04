<?php
error_reporting(E_ALL);
ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);

require_once 'ritetag/init.php';
require_once 'config.php';

$client = new \ritetag\Client(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);
echo "<h2>ai</h2>";
$response = $client->aiTwitter('test');
echo "<div><pre>";
echo $response->getBody();
echo "</pre></div>";
echo "<h2>trending hashtags</h2>";
$response = $client->trendingHashtags();
echo "<div><pre>";
echo $response->getBody();
echo "</pre></div>";
echo "<h2>hashtags for url</h2>";
$response = $client->hashtagsForLinks('http://bit.ly/EZ2Black');
echo "<div><pre>";
echo $response->getBody();
echo "</pre></div>";
echo "<p>Limit remain: ".$response->getRemain()."</p>";
