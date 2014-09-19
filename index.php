<!DOCTYPE html>
<html>
    <head>
        <title>Ritetag - Rest API</title>

        <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
        <style>
            .page {padding:10px;}
        </style>
        <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
        <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
    </head>
    <body>
        <div class="page">
            <h1>Ritetag rest API</h1>

            <?php
            error_reporting(E_ALL);
            ini_set('error_reporting', E_ALL);
            ini_set('display_errors', 1);

            require_once 'ritetag/init.php';
            /*
             * configuration
             */
            if (file_exists('config.php')) {
                require_once 'config.php';
                $client = new \ritetag\Client(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);
                /*
                 * 
                 */
            } else {
                ?>
                <div class="alert alert-danger" role="alert">Missing configuration file config.php (you can copy config.sample.php and fill your auth tokens from <a href="https://ritetag.com/developer/dashboard">developers dashboard</a>)</div>
            <?php }
            ?>

            <!-- Nav tabs -->
            <ul class="nav nav-tabs" role="tablist">
                <li class="<?php echo isset($_POST["hashtag-directory"]) ? "active" : ""; ?>"><a href="#hashtag-directory" role="tab" data-toggle="tab">Hashtag directory</a></li>
                <li class="<?php echo isset($_POST["trending-hashtags"]) ? "active" : ""; ?>"><a href="#trending-hashtags" role="tab" data-toggle="tab">Trending hashtags</a></li>
                <li class="<?php echo isset($_POST["hashtags-for-url"]) ? "active" : ""; ?>"><a href="#hashtags-for-url" role="tab" data-toggle="tab">Hashtags for URL</a></li>
                <li class="<?php echo isset($_POST["influencers-for-hashtags"]) ? "active" : ""; ?>"><a href="#influencers-for-hashtags" role="tab" data-toggle="tab">Influencers for Hashtag</a></li>
                <li class="<?php echo isset($_POST["historical-data"]) ? "active" : ""; ?>"><a href="#historical-data" role="tab" data-toggle="tab">Historical data</a></li>
                <li class="<?php echo isset($_POST["tweet-grader"]) ? "active" : ""; ?>"><a href="#tweet-grader" role="tab" data-toggle="tab">Tweet grader</a></li>
            </ul>

            <!-- Tab panes -->
            <div class="tab-content">
                <div class="tab-pane <?php echo isset($_POST["hashtag-directory"]) ? "active" : ""; ?>" id="hashtag-directory">
                    <form role="form" method="POST">
                        <div class="form-group">
                            <label for="hashtag">Hashtag</label>
                            <input type="text" class="form-control" name="hashtag" value="<?php echo isset($_POST['hashtag']) ? $_POST['hashtag'] : "" ?>" placeholder="enter the hashtag without #">
                        </div>
                        <button type="submit" name="hashtag-directory" class="btn btn-default">Submit</button>
                    </form>

                    <?php
                    if (isset($_POST["hashtag-directory"]) && isset($_POST['hashtag'])) {
                        $response = $client->aiTwitter($_POST['hashtag']);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>

                </div>

                <div class="tab-pane <?php echo isset($_POST["trending-hashtags"]) ? "active" : ""; ?>" id="trending-hashtags">
                    <form role="form" method="POST">
                        <div class="form-group">
                            <p><input type="checkbox" class="" name="green" <?php echo isset($_POST['green']) ? "checked=checked" : "" ?>> green</p>
                            <p><input type="checkbox" class="" name="onlylatin" <?php echo isset($_POST['onlylatin']) ? "checked=checked" : "" ?>> only latin</p>
                        </div>
                        <button name="trending-hashtags" type="submit" class="btn btn-default">Load trending hashtags</button>
                    </form>
                    <?php
                    if (isset($_POST["trending-hashtags"])) {
                        $green = isset($_POST['green']);
                        $latin = isset($_POST['onlylatin']);
                        $response = $client->trendingHashtags($green,$latin);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>

                </div>
                <div class="tab-pane <?php echo isset($_POST["hashtags-for-url"]) ? "active" : ""; ?>" id="hashtags-for-url">
                    <form role="form" method="post">
                        <div class="form-group">
                            <label for="hashtag">URL</label>
                            <input type="text" class="form-control" name="url" value="<?php echo isset($_POST['url']) ? $_POST['url'] : "" ?>" placeholder="enter the url">
                        </div>

                        <button name="hashtags-for-url" type="submit" class="btn btn-default">Submit</button>
                    </form>
                    <?php
                    if (isset($_POST["hashtags-for-url"]) && isset($_POST['url'])) {
                        $response = $client->hashtagsForLinks($_POST['url']);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>

                </div>
                <div class="tab-pane <?php echo isset($_POST["influencers-for-hashtags"]) ? "active" : ""; ?>" id="influencers-for-hashtags">
                    <form role="form" method="POST">
                        <div class="form-group">
                            <label for="hashtag">Hashtag</label>
                            <input type="text" class="form-control" name="hashtag" value="<?php echo isset($_POST['hashtag']) ? $_POST['hashtag'] : "" ?>" placeholder="enter the hashtag without #">
                        </div>
                        <button name="influencers-for-hashtags" type="submit" class="btn btn-default">Submit</button>
                    </form>
                    <?php
                    if (isset($_POST["influencers-for-hashtags"]) && isset($_POST['hashtag'])) {
                        $response = $client->influencersForHashtag($_POST['hashtag']);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>
                </div>
                <div class="tab-pane <?php echo isset($_POST["historical-data"]) ? "active" : ""; ?>" id="historical-data">
                    <form role="form" method="POST">
                        <div class="form-group">
                            <label for="hashtag">Hashtag</label>
                            <input type="text" class="form-control" name="hashtag" value="<?php echo isset($_POST['hashtag']) ? $_POST['hashtag'] : "" ?>" placeholder="enter the hashtag without #">
                        </div>
                        <button name="historical-data" type="submit" class="btn btn-default">Submit</button>
                    </form>
                    <?php
                    if (isset($_POST["historical-data"]) && isset($_POST['hashtag'])) {
                        $response = $client->historicalData($_POST['hashtag']);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>

                </div>
                <div class="tab-pane <?php echo isset($_POST["tweet-grader"]) ? "active" : ""; ?>" id="tweet-grader">
                    <form role="form" method="POST">
                        <div class="form-group">
                            <label for="hashtag">Tweet</label>
                            <input type="text" class="form-control" name="tweet" value="<?php echo isset($_POST['tweet']) ? $_POST['tweet'] : "" ?>" placeholder="enter the tweet">
                        </div>
                        <button name="tweet-grader" type="submit" class="btn btn-default">Submit</button>
                    </form>
                    <?php
                    if (isset($_POST["tweet-grader"]) && isset($_POST['tweet'])) {
                        $response = $client->tweetGrader($_POST['tweet']);
                        echo "<h2>Response body</h2>";
                        echo "<div><pre id='json'>";
                        echo $response->getBody();
                        echo "</pre></div>";

                        echo "<h2>Remain limit</h2>";
                        echo "<h3>This day</h3>";
                        echo $response->getRemain();
                        echo "<h3>This hour</h3>";
                        echo $response->getRemainPerHour();
                    }
                    ?>
                </div>
            </div>



        </div>
        <script>
            var json = $("#json").html();
            var obj = JSON.parse(json);
            var str = JSON.stringify(obj, undefined, 4);
            $("#json").html(syntaxHighlight(str));
            function syntaxHighlight(json) {
                json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
                    var cls = 'number';
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            cls = 'key';
                        } else {
                            cls = 'string';
                        }
                    } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                    } else if (/null/.test(match)) {
                        cls = 'null';
                    }
                    return '<span class="' + cls + '">' + match + '</span>';
                });
            }
        </script>
        <style>
            .string { color: green; }
            .number { color: darkorange; }
            .boolean { color: blue; }
            .null { color: magenta; }
            .key { color: red; }
        </style>

    </body>
</html>