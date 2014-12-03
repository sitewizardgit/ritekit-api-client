# README #

##[Browse the code](https://bitbucket.org/ritetag/ritetag-api/src/)##



##How to implement RiteTag Hashtag Bar to a textarea##

This is how RiteTag Hashtag Bar looks like in Twitter. Using our sample code, you can make it work for any textarea on your site too (currently, without colorized hashtags inside the textarea).

![hashtagbar.png](https://bitbucket.org/repo/pMKgRz/images/993122408-hashtagbar.png)

###1. Create RiteTag developer account###
[Sign up for developer account here](https://ritetag.com/developer/signup)



###2. Install via composer ###
```composer create-project ritetag/api ritetag-app```

###3. Run demo (optional) ###

If you just want to run a demo, skip to 7a and upload to server

###4. Save folder js, css, img to assets on your web###

###5. Link JS and CSS files in <head> ###


```
#!html
<script src="/assets/js/jquery-1.11.1.js"></script>
<script src="/assets/js/jquery.rest.min.js"></script>
<script src="/assets/js/twitter-text.js"></script>
<script src="/assets/js/q.js"></script>
<script src="/assets/js/infobar.js"></script>
<script src="/assets/js/setup.js"></script>

<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css">
<link rel="stylesheet" href="www/css/hastagbar.css">

```

###6. Copy this where you want the Hashtag Bar to appear###
```
#!html
<div style="margin:15px;width: 500px;height: 200px" class="tweet-content">
<div style="padding-left: 15px" class="ritetag-infobar"></div>
<div style="width:100%;height: 100%;border: #292f33 1px solid" class="ritetag-richeditor" contenteditable="true"></div>
</div>

```

###7. Implement PHP library for handling API call proxy###
Save folder api on your web

####7a. Config ####
Edit config.sample and save as config.php to api folder

```
#!php
<?php
/*
 *  https://ritetag.com/developer/dashboard
 */
define('CONSUMER_KEY', '????');
define('CONSUMER_SECRET', '????');
define('OAUTH_TOKEN', "????");
define('OAUTH_TOKEN_SECRET',"????");

```

####7b.  Autoloader ####
Edit index.php, update path to config and autoloader.php

```
#!php

<?php
require_once '../../config.php';
require_once '../../vendor/autoload.php';

```