<?php

/**
 * Description of api
 *
 * @author Pavel
 */
class api {
    //put your code here
}
$client = new \Ritetag\Client(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);

                /*
                 * Hashtag Directory
                 */
                echo "<h2>ai</h2>";
                $response = $client->aiTwitter('hello');
                echo $response->getRemain();
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                /*
                 * Trending Hashtags
                 */
                echo "<h2>trending hashtags</h2>";
                $response = $client->trendingHashtags();
                echo $response->getRemain();
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                /*
                 * Hashtags for Url
                 */
                echo "<h2>hashtags for url</h2>";
                $response = $client->hashtagsForLinks('http://bit.ly/EZ2Black');
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                /*
                 * 
                 */
                echo "<h2>influencers for hashtag</h2>";
                $response = $client->influencersForHashtag('ritetag');
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                echo "<p>Limit remain: " . $response->getRemain() . "</p>";

                /*
                 * 
                 */
                echo "<h2>historical data for hashtag</h2>";
                $response = $client->historicalData('media');
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                echo "<p>Limit remain: " . $response->getRemain() . "</p>";


                /*
                 * 
                 */
                echo "<h2>tweet grader</h2>";
                $response = $client->tweetGrader('Do you know when and how to #media optimize #iphonegames? What related hashtags are top-rated? https://ritetag.com/best-hashtags-for/iphonegames');
                echo "<div><pre>";
                echo $response->getBody();
                echo "</pre></div>";

                echo "<p>Limit remain: " . $response->getRemain() . "</p>";