# README #

##[Browse the code](https://bitbucket.org/ritetag/ritetag-api/src/)##



##How to implement RiteTag Hashtag Bar to a textarea##

This is how the RiteTag Hashtag Bar looks in Twitter. Using our sample code, you can make it work for any textarea on your site (currently, without colorized hashtags in the textarea).

![hashtagbar.png](https://bitbucket.org/repo/pMKgRz/images/993122408-hashtagbar.png)

###1. Create RiteTag developer account###
[Sign up for developer account here](https://ritetag.com/developer/signup)



###2. Install via composer ###
```composer create-project ritetag/api ritetag-app```


####3. Config ####
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
